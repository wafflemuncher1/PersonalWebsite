-- Nocturne: multi-tenant pivot
-- Adds a public `profiles` table (bio-link data + plan/billing state), opens
-- signup to everyone (was previously locked to a single owner), auto-provisions
-- a profile + unique username on signup, and exposes a security-definer
-- function that returns a safe, aggregated snapshot of a user's private stats
-- for their public bio-link page (the underlying tables stay locked down).

-- 1. Open up signups -------------------------------------------------------
drop trigger if exists restrict_signup_to_owner on auth.users;
drop function if exists public.restrict_signup_to_owner();

-- 2. profiles table ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  links jsonb not null default '[]'::jsonb, -- [{ "label": "Instagram", "url": "https://...", "icon": "instagram" }]
  theme text not null default 'default',
  show_stats boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_-]{3,20}$')
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- keep updated_at honest
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3. auto-provision a profile + unique username on signup ------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_-]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  base_username := substr(base_username, 1, 16);

  candidate := base_username;
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := substr(base_username, 1, 16) || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, coalesce(new.raw_user_meta_data ->> 'display_name', base_username))
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. safe public stats snapshot ---------------------------------------------
-- Bypasses RLS (security definer) but only ever returns aggregated counts,
-- and only when the owner has opted in via profiles.show_stats.
create or replace function public.get_public_stats(p_username text)
returns json
language plpgsql
security definer set search_path = public
stable
as $$
declare
  prof record;
  result json;
begin
  select id, show_stats into prof from public.profiles where username = lower(p_username);

  if prof.id is null or prof.show_stats is not true then
    return null;
  end if;

  select json_build_object(
    'goals_completed', (select count(*) from public.goals where user_id = prof.id and status = 'completed'),
    'active_goals', (select count(*) from public.goals where user_id = prof.id and status = 'active'),
    'active_streaks', (select count(*) from public.streaks where user_id = prof.id and archived = false),
    'total_check_ins', (select count(*) from public.streak_logs where user_id = prof.id)
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_public_stats(text) to anon, authenticated;
