# Nocturne

A bio-link page out front, a private life tracker behind it. Anyone can sign up, claim
a public page at `nocturne.co/username`, and get a locked-down dashboard — notes, goals,
streaks — that only they can see. Built on Next.js (App Router) and Supabase.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Postgres, Auth (email + password), row-level security
- **Stripe** — subscription billing (Checkout + Billing Portal)
- **Vercel** — hosting (for now — see "Deployment" below)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Supabase URL + anon key live in `lib/supabase/config.ts` (safe to ship publicly — every
table is protected by row-level security). Everything else — the Supabase service role
key and the Stripe keys — goes in `.env.local` / your host's environment variables and
is never exposed to the browser.

## Site structure

- `app/page.tsx` — marketing site (main domain): what Nocturne is, pricing teaser, signup CTA
- `app/pricing` — full plan comparison
- `app/signup`, `app/login` — account creation / sign-in
- `app/[username]` — public bio-link page for each user (avatar, bio, links, opt-in stats)
- `app/dashboard` — private, per-user area (notes, goals, streaks, settings) — gated by `middleware.ts`
- `app/dashboard/settings` — includes the public-profile editor and billing panel
- `app/api/stripe/*` — checkout, billing portal, and webhook routes
- `middleware.ts` — refreshes the Supabase session and gates `/dashboard/*`
- `lib/supabase` — browser / server / middleware / **admin** (service-role, server-only) clients
- `lib/stripe.ts`, `lib/plans.ts` — Stripe SDK init and the single source of truth for plan pricing
- `supabase/migrations` — SQL migrations, applied directly to the Supabase project

## Data model

- `profiles` — one row per user: `username` (public, unique), `display_name`, `bio`,
  `avatar_url`, `links` (jsonb array), `show_stats` (opt-in), `plan`, `subscription_status`,
  `stripe_customer_id`, `stripe_subscription_id`. Publicly readable (that's the bio-link
  page); only the owner can write to their own row.
- `notes`, `goals`, `goal_categories`, `streaks`, `streak_logs` — private per-user data.
  RLS scoped to `auth.uid() = user_id`. Never exposed directly to the public profile page.
- `get_public_stats(username)` — a `security definer` Postgres function that returns
  aggregate counts only (goals completed, active streaks, etc.) for users who've opted
  in via `show_stats`. This is the *only* bridge between private data and the public
  page — it never leaks raw notes/goals/streak content.
- A trigger (`handle_new_user`) auto-creates a `profiles` row with a unique username the
  moment someone signs up (using their requested username if available, otherwise
  deriving one from their email).

## How access is locked down

- Signups are open to everyone (the earlier single-owner restriction has been removed).
- RLS is enabled on every table. `profiles` allows public `select`; every other table is
  scoped to `auth.uid() = user_id` for select/insert/update/delete.
- The Stripe webhook is the one place allowed to write another user's `plan` /
  `subscription_status` — it does so via the service-role admin client
  (`lib/supabase/admin.ts`), after verifying the Stripe signature. That key never ships
  to the client.

## Billing (Stripe)

The "spot that checks for upgrades" lives in three places:

1. `app/api/stripe/checkout` — creates a Stripe Checkout session for the signed-in user
   (creates a Stripe customer on first use, price ID always read server-side).
2. `app/api/stripe/portal` — opens the Stripe Billing Portal for an existing customer
   (update card, view invoices, cancel).
3. `app/api/stripe/webhook` — the source of truth. On `checkout.session.completed` and
   `customer.subscription.updated/deleted`, it updates `profiles.plan` and
   `profiles.subscription_status`. The UI never sets these directly.

**To go live with billing:** create the Pro product + price in the Stripe dashboard, set
`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PRO` (and the `NEXT_PUBLIC_` copy), point a Stripe
webhook at `/api/stripe/webhook` for `checkout.session.completed`,
`customer.subscription.updated`, and `customer.subscription.deleted`, and copy the signing
secret into `STRIPE_WEBHOOK_SECRET`. Until those are set, the checkout/portal buttons will
show a clear error instead of failing silently.

## Deployment

Deploying to Vercel now. The main domain should point at this Next.js app (Vercel handles
that as a custom domain on the project). Public bio-link pages are path-based
(`nocturne.co/username`) rather than subdomains — no wildcard DNS/SSL to manage while
you're getting started. If you later want `username.nocturne.co` instead, that's a bigger
lift (wildcard domain + a rewrite/middleware rule to route the subdomain to the
`[username]` page) and worth doing once you have real usage to justify it.

Moving off Vercel later (e.g. for cost or infra control) is mostly a matter of the app
already being framework-standard Next.js — the main things to re-point are the domain's
DNS and the Stripe webhook URL. Nothing in the code is Vercel-specific.

## What's still a placeholder

- Reserved usernames (`login`, `signup`, `pricing`, etc.) are centralized in
  `lib/reserved-usernames.ts` and checked at signup, in Settings, and on the public
  profile route — add to that one list whenever you add a new top-level route.
- No plan-based limits are enforced yet (e.g. Free capping links or streaks) — the Free
  vs. Pro feature list in `lib/plans.ts` is currently descriptive, not enforced server-side.
- Avatar upload is a raw URL field for now, not a file upload — fine to swap for Supabase
  Storage later.
