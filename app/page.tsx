import Link from "next/link";
import { PLANS } from "@/lib/plans";

const STEPS = [
  {
    title: "Claim your page",
    body: "Sign up and get a public bio-link page at nocturne.co/yourname — links, avatar, bio, all in one place.",
  },
  {
    title: "Track your life, privately",
    body: "Log back in and you land in a private dashboard: notes, goals, and streaks. Nobody sees this but you.",
  },
  {
    title: "Flex what you want, quietly",
    body: "Opt in to show a stats snapshot on your public page — goals hit, streaks running. Everything else stays yours.",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_14px_3px_rgba(139,92,246,0.7)]" />
          <span className="text-sm font-semibold tracking-wide text-white">NOCTURNE</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-zinc-400 transition hover:text-white">
            Pricing
          </Link>
          <Link href="/login" className="text-zinc-400 transition hover:text-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400"
          >
            Sign up free
          </Link>
        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 sm:pt-24">
        {/* Hero */}
        <section className="animate-fade-up mx-auto max-w-2xl text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              now in early access
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            One link. Two sides.
          </h1>
          <p className="mt-3 text-lg font-medium text-gradient">
            A public bio-link page out front. A private life tracker behind it.
          </p>

          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Nocturne gives you a shareable page for your links and a flex-worthy stats snapshot —
            plus a locked-down dashboard only you can see, for the notes, goals, and streaks you
            don&apos;t put on the internet.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400"
            >
              Create your page →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] hover:border-white/20"
            >
              See pricing
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24">
          <h2 className="mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
            <span className="h-px flex-1 bg-gradient-to-r from-violet-500/40 to-transparent" />
            How it works
            <span className="h-px flex-1 bg-gradient-to-l from-violet-500/40 to-transparent" />
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass glass-hover rounded-xl p-5">
                <div className="mb-3 font-mono text-xs text-violet-400">0{i + 1}</div>
                <h3 className="mb-2 font-medium text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="mt-24">
          <h2 className="mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
            <span className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
            Simple pricing
            <span className="h-px flex-1 bg-gradient-to-l from-amber-500/40 to-transparent" />
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <div key={plan.id} className="glass rounded-xl p-6">
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-white">{plan.price}</span>
                  <span className="text-sm text-zinc-500">{plan.priceSuffix}</span>
                </div>
                <p className="mb-4 text-sm text-zinc-400">{plan.description}</p>
                <Link
                  href={`/signup?plan=${plan.id}`}
                  className="inline-flex rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center">
            <Link href="/pricing" className="text-xs text-violet-400 hover:text-violet-300">
              Full plan comparison →
            </Link>
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-24 flex items-center justify-between border-t border-white/5 pt-6">
          <p className="font-mono text-[11px] text-zinc-600">
            © {new Date().getFullYear()} Nocturne
          </p>
          <div className="flex gap-4 font-mono text-[11px] text-zinc-600">
            <Link href="/pricing" className="hover:text-violet-400">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-violet-400">
              Log in
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
