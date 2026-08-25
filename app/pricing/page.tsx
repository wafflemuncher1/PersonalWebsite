import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <Logo />
        <nav className="flex items-center gap-6 text-sm">
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

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-16 sm:pt-20">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Pricing
            </h1>
            <p className="mt-3 text-[15px] text-zinc-400">
              Free to start. Upgrade when you outgrow it, cancel anytime.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2" stagger={0.1}>
          {PLANS.map((plan) => (
            <RevealItem key={plan.id}>
              <div
                className={`glass glass-hover h-full rounded-2xl p-8 transition duration-200 ease-premium hover:-translate-y-0.5 ${plan.id === "pro" ? "shadow-glow ring-1 ring-gold-400/25" : ""}`}
              >
                {plan.id === "pro" && (
                  <div className="mb-4 inline-flex rounded-full bg-gold-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-gold-300">
                    Most popular
                  </div>
                )}
                <h2 className="text-lg font-medium text-white">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-white">{plan.price}</span>
                  <span className="text-sm text-zinc-500">{plan.priceSuffix}</span>
                </div>
                <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="mt-0.5 text-emerald-400" aria-hidden="true">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/signup?plan=${plan.id}`}
                  className={`mt-8 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition duration-200 ease-premium active:scale-[0.98] ${
                    plan.id === "pro"
                      ? "bg-gold-400 text-ink-950 shadow-glow hover:bg-gold-300 hover:shadow-glow-lg"
                      : "border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-white/20 hover:bg-white/[0.08]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.15}>
          <p className="mt-10 text-center text-xs text-zinc-600">
            Already on Nocturne?{" "}
            <Link href="/dashboard/settings" className="text-gold-400 hover:text-gold-300">
              Manage your plan
            </Link>{" "}
            from Settings.
          </p>
        </Reveal>
      </div>
    </main>
  );
}
