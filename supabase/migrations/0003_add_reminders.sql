-- Reminders: due-date tasks, separate from Goals (progress-based, often
-- long-running) and Streaks (daily habits). A reminder is binary — done or
-- not — and optionally recurs, rescheduling its own due date forward
-- instead of leaving a trail of duplicate completed rows.

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  notes text not null default '',
  due_date timestamptz,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  repeat text check (repeat is null or repeat in ('daily', 'weekly', 'monthly')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_due_date_idx
  on public.reminders (user_id, due_date nulls last);

alter table public.reminders enable row level security;

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own"
  on public.reminders for select
  using ((select auth.uid()) = user_id);

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own"
  on public.reminders for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own"
  on public.reminders for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own"
  on public.reminders for delete
  using ((select auth.uid()) = user_id);

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();
