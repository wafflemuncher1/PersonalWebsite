-- Replaces the boolean is_dev flag with a three-tier role, since the
-- backend is now gated behind explicit access rather than open to anyone
-- who signs up. Existing is_dev=true accounts become role='dev'; everyone
-- else defaults to 'normal' and is gated at app/dashboard/layout.tsx until
-- a dev promotes them to 'tester' or 'dev'.
alter table public.profiles
  add column role text not null default 'normal' check (role in ('normal', 'tester', 'dev'));

update public.profiles set role = 'dev' where is_dev = true;

alter table public.profiles drop column is_dev;
