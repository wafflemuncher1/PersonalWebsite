-- Issue reports: lets testers file bugs/feedback from inside the app, and
-- gives devs a single inbox to triage them from the Developer area. Kept
-- separate from Reminders/Goals since these are reports *about the product*,
-- not personal tasks, and only a dev should ever change their status.
--
-- References public.profiles (not auth.users) on purpose so PostgREST can
-- embed the reporter's username/display_name in a single select — profiles
-- is already 1:1 with auth.users via its own FK + signup trigger.

create table if not exists public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  page_path text not null default '',
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'wontfix')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists issue_reports_user_id_idx on public.issue_reports (user_id);
create index if not exists issue_reports_status_idx on public.issue_reports (status);

alter table public.issue_reports enable row level security;

-- Only tester/dev accounts can file reports (defense in depth — the report
-- page is already gated by the normal-role DevelopmentGate, but RLS
-- shouldn't rely solely on the UI for this).
drop policy if exists "issue_reports_insert_tester_or_dev" on public.issue_reports;
create policy "issue_reports_insert_tester_or_dev"
  on public.issue_reports for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role in ('tester', 'dev')
    )
  );

-- Reporters see their own reports; devs see everyone's.
drop policy if exists "issue_reports_select_own_or_dev" on public.issue_reports;
create policy "issue_reports_select_own_or_dev"
  on public.issue_reports for select
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'dev')
  );

-- Only devs update reports (triage: status changes). Reporters edit by
-- deleting and re-filing rather than mutating an open ticket.
drop policy if exists "issue_reports_update_dev_only" on public.issue_reports;
create policy "issue_reports_update_dev_only"
  on public.issue_reports for update
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'dev'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'dev'));

-- Reporters can retract their own; devs can clear anyone's.
drop policy if exists "issue_reports_delete_own_or_dev" on public.issue_reports;
create policy "issue_reports_delete_own_or_dev"
  on public.issue_reports for delete
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'dev')
  );

drop trigger if exists issue_reports_set_updated_at on public.issue_reports;
create trigger issue_reports_set_updated_at
  before update on public.issue_reports
  for each row execute function public.set_updated_at();
