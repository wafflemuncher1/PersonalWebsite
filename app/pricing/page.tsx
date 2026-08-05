import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_14px_3px_rgba(139,92,246,0.7)]" />
          <span className="text-sm font-semibold tracking-wide text-white">NOCTURNE</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
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

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Pricing
          </h1>
          <p className="mt-3 text-[15px] text-zinc-400">
            Free to start. Upgrade when you outgrow it — cancel anytime.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`glass rounded-2xl p-8 ${plan.id === "pro" ? "shadow-glow ring-1 ring-violet-500/30" : ""}`}
            >
              {plan.id === "pro" && (
                <div className="mb-4 inline-flex rounded-full bg-violet-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-violet-300">
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
                    <span className="mt-0.5 text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/signup?plan=${plan.id}`}
                className={`mt-8 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  plan.id === "pro"
                    ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-glow hover:from-violet-500 hover:to-violet-400"
                    : "border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          Already on Nocturne?{" "}
          <Link href="/dashboard/settings" className="text-violet-400 hover:text-violet-300">
            Manage your plan
          </Link>{" "}
          from Settings.
        </p>
      </div>
    </main>
  );
}
