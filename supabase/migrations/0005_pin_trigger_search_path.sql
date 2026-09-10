-- Hardening ahead of opening the app to testers: pin search_path on the
-- plain trigger functions the Supabase linter flagged as mutable. These
-- aren't SECURITY DEFINER (low real risk already, since they run as the
-- calling role under RLS), but pinning search_path is a one-line,
-- zero-behavior-change fix that removes the finding entirely.
alter function public.enforce_profile_link_limit() set search_path = public;
alter function public.enforce_username_cooldown() set search_path = public;
alter function public.enforce_profile_link_limits() set search_path = public;
alter function public.enforce_badge_equip_limit() set search_path = public;
alter function public.enforce_profile_shop_item_limits() set search_path = public;
