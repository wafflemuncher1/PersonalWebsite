import Link from "next/link";
import { ArrowRight, Flame, Globe, Link2, NotebookPen, Target, CalendarCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PLANS } from "@/lib/plans";

const STEPS = [
  {
    title: "Claim your page",
    body: "Sign up and get a public bio-link page at nocturne.co/yourname: links, avatar, bio, all in one place.",
  },
  {
    title: "Track your life, privately",
    body: "Log back in and land in a private dashboard for notes, goals, and streaks. Nobody sees this but you.",
  },
  {
    title: "Flex what you want, quietly",
    body: "Opt in to show a stats snapshot on your public page: goals hit, streaks running. Everything else stays yours.",
  },
];

const FEATURES = [
  {
    icon: Target,
    title: "Goals",
    body: "Set targets, track progress, mark them done. No forced deadlines, no guilt-tripping.",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: Flame,
    title: "Streaks",
    body: "Log a day, keep the chain going.",
    span: "",
  },
  {
    icon: NotebookPen,
    title: "Notes",
    body: "Freeform, pinned, searchable.",
    span: "",
  },
  {
    icon: CalendarCheck,
    title: "Journal",
    body: "Mood plus a few lines, most days.",
    span: "lg:col-span-2",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Logo />
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-zinc-400 transition hover:text-white">
            Pricing
          </Link>
          <Link href="/login" className="text-zinc-400 transition hover:text-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-ink-950 shadow-glow transition duration-200 ease-premium hover:bg-gold-300 hover:shadow-glow-lg active:scale-95"
          >
            Sign up free
          </Link>
        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
        {/* Hero */}
        <section className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <Reveal>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              One link.
              <br />
              Two sides.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-snug text-zinc-300">
              A public page for your links. A private space for the notes, goals, and streaks
              you keep to yourself.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow transition duration-200 ease-premium hover:bg-gold-300 hover:shadow-glow-lg active:scale-95"
                >
                  Create your page
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Magnetic>
              <Link
                href="/pricing"
                className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-300 transition duration-200 ease-premium hover:border-white/25 hover:text-white active:scale-95"
              >
                See pricing
              </Link>
            </div>
          </Reveal>

          {/* Real component preview: a small live mockup of an actual Nocturne
              public profile, not a fake screenshot — shows the product itself. */}
          <Reveal delay={0.12} y={16}>
            <div className="relative mx-auto w-full max-w-[300px] lg:ml-auto lg:mr-0">
              <div className="glass rounded-[1.75rem] border border-white/10 p-6 shadow-elevate-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-600" />
                  <p className="mt-3 text-sm font-semibold text-white">@yourname</p>
                  <p className="mt-1 text-xs text-zinc-500">night owl, builder, list-maker</p>

                  <div className="mt-5 flex items-center gap-3 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-amber-300">
                      <Flame className="h-3 w-3" /> 42
                    </span>
                    <span className="h-3 w-px bg-white/10" />
                    <span className="flex items-center gap-1 text-[11px] text-gold-300">
                      <Target className="h-3 w-3" /> 6
                    </span>
                    <span className="h-3 w-px bg-white/10" />
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Globe className="h-3 w-3" /> 812
                    </span>
                  </div>

                  <div className="mt-5 w-full space-y-2">
                    {["Portfolio", "Newsletter", "Shop"].map((label) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left"
                      >
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                        <span className="truncate text-xs text-zinc-300">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Feature showcase — asymmetric bento, not three equal cards */}
        <section className="mt-32">
          <Reveal>
            <h2 className="font-display max-w-lg text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Everything private, in one place.
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 lg:grid-cols-3" stagger={0.08}>
            {FEATURES.map((f) => (
              <RevealItem key={f.title} className={f.span}>
                <div className="glass glass-hover flex h-full flex-col justify-between rounded-2xl p-6 transition duration-200 ease-premium">
                  <f.icon className="h-5 w-5 text-gold-400" strokeWidth={1.5} />
                  <div className="mt-6">
                    <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* How it works */}
        <section className="mt-32">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
          </Reveal>

          <RevealGroup className="mx-auto mt-10 max-w-2xl space-y-3" stagger={0.08}>
            {STEPS.map((s, i) => (
              <RevealItem key={s.title}>
                <div className="glass glass-hover flex gap-4 rounded-xl p-5 transition duration-200 ease-premium hover:-translate-y-0.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/25 bg-gold-500/10 font-mono text-sm text-gold-300">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="mb-1 font-medium text-white">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{s.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* Pricing teaser */}
        <section className="mt-32">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Simple pricing
              </h2>
              <Link href="/pricing" className="hidden text-xs text-gold-400 hover:text-gold-300 sm:inline">
                Full plan comparison
              </Link>
            </div>
          </Reveal>

          <RevealGroup className="grid gap-4 sm:grid-cols-2" stagger={0.08}>
            {PLANS.map((plan) => (
              <RevealItem key={plan.id}>
                <div className="glass glass-hover rounded-xl p-6 transition duration-200 ease-premium hover:-translate-y-0.5">
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-white">{plan.price}</span>
                    <span className="text-sm text-zinc-500">{plan.priceSuffix}</span>
                  </div>
                  <p className="mb-4 text-sm text-zinc-400">{plan.description}</p>
                  <Link
                    href={`/signup?plan=${plan.id}`}
                    className="inline-flex rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition duration-200 ease-premium hover:bg-white/[0.1] active:scale-95"
                  >
                    {plan.cta}
                  </Link>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="mt-4 text-center sm:hidden">
            <Link href="/pricing" className="text-xs text-gold-400 hover:text-gold-300">
              Full plan comparison
            </Link>
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-24 flex items-center justify-between border-t border-white/5 pt-6">
          <p className="font-mono text-[11px] text-zinc-600">
            © {new Date().getFullYear()} Nocturne
          </p>
          <div className="flex gap-4 font-mono text-[11px] text-zinc-600">
            <Link href="/pricing" className="hover:text-gold-400">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-gold-400">
              Log in
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
