# Nocturne

A personal site with a public "about me" page and a private, single-owner dashboard —
notes, goals, and habit streaks — built on Next.js (App Router) and Supabase.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Postgres, Auth (passwordless magic link), strict row-level security
- **Vercel** — hosting

## Local development

```bash
npm install
npm run dev
```

Supabase URL + anon key are set in `lib/supabase/config.ts` (the anon key is safe to
ship publicly — every table is protected by row-level security).

## How access is locked down

- Sign-ups are blocked at the database level for every email except the owner's
  (`public.restrict_signup_to_owner` trigger on `auth.users`).
- There is no password — sign-in is a magic link sent to the owner's email
  (`supabase.auth.signInWithOtp`).
- Every table (`notes`, `goals`, `goal_categories`, `streaks`, `streak_logs`) has RLS
  enabled with policies scoped to `auth.uid() = user_id` for select/insert/update/delete.
  Even if someone else's magic-link email were somehow allowed through, they could never
  see another user's rows.

## Structure

- `app/page.tsx` — public landing page
- `app/login` — magic-link sign-in
- `app/dashboard` — protected area (notes, goals, streaks, overview)
- `middleware.ts` — refreshes the Supabase session and gates `/dashboard/*`
- `lib/supabase` — browser/server/middleware Supabase clients

## Customizing the public page

Edit `app/page.tsx` — swap the placeholder bio, project cards, and contact links for
your real ones.
