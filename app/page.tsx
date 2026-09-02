import Link from "next/link";
import { ArrowRight, Palette, Link2, ShoppingBag, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const STEPS = [
  {
    title: "Claim your page",
    body: "Sign up and your page exists at nocturne.co/yourname — instantly, before you've touched a single setting.",
  },
  {
    title: "Make it yours",
    body: "Background, fonts, glow, animated name, cursor effects — a full studio, not a theme picker.",
  },
  {
    title: "Send the one link",
    body: "Bio, links, shop, all of it — behind a single URL you put everywhere else.",
  },
];

const FEATURES = [
  {
    icon: Palette,
    title: "Customize",
    body: "Backgrounds, colors, fonts, glow effects, animated names, custom cursors — every pixel is a setting, not a template slot.",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: Link2,
    title: "Links",
    body: "Custom icons, colors, and glow per link. Ordered exactly how you want.",
    span: "",
  },
  {
    icon: ShoppingBag,
    title: "Shop",
    body: "A clean grid for anything you sell or point people toward.",
    span: "",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-void-950">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow-signal" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:56px_56px] opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(62,194,245,0.28), transparent 70%)" }}
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <Logo />
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/login" className="text-zinc-400 transition hover:text-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-signal-500 px-4 py-2 text-sm font-medium text-void-950 shadow-glow-signal transition duration-200 ease-premium hover:bg-signal-400 hover:shadow-glow-signal-lg active:scale-95"
          >
            Claim your page
          </Link>
        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
        {/* Hero */}
        <section className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-signal-500/25 bg-signal-500/10 px-3 py-1 text-xs font-medium text-signal-300">
              <Sparkles className="h-3 w-3" />
              Not a template. A studio.
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              A page that
              <br />
              actually looks
              <br />
              like you.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-snug text-zinc-300">
              One link. Fully custom — background, motion, glow, your own shop. Nothing about it
              reads as a default.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-lg bg-signal-500 px-6 py-3 text-sm font-semibold text-void-950 shadow-glow-signal transition duration-200 ease-premium hover:bg-signal-400 hover:shadow-glow-signal-lg active:scale-95"
                >
                  Create your page
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          {/* Live mockup of an actual customized Nocturne profile — not a
              stock screenshot — reflecting the real Customize/Links/Shop
              feature set rather than the retired lifestyle-stats framing. */}
          <Reveal delay={0.12} y={16}>
            <div className="relative mx-auto w-full max-w-[300px] lg:ml-auto lg:mr-0">
              <div className="glass animate-float rounded-[1.75rem] border border-white/10 p-6 shadow-elevate-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-signal-300 to-signal-600 shadow-glow-signal" />
                  <p className="animate-pulse-glow mt-3 text-sm font-semibold text-white">
                    @yourname
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">night owl, builder, maker</p>

                  <div className="mt-5 w-full space-y-2">
                    {["Portfolio", "Newsletter", "Shop"].map((label, i) => (
                      <div
                        key={label}
                        className="animate-fade-up flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left"
                        style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                      >
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-signal-400" />
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
              Every pixel is yours to move.
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 lg:grid-cols-3" stagger={0.08}>
            {FEATURES.map((f) => (
              <RevealItem key={f.title} className={f.span}>
                <div className="glass glass-hover flex h-full flex-col justify-between rounded-2xl p-6 transition duration-200 ease-premium hover:-translate-y-0.5">
                  <f.icon className="h-5 w-5 text-signal-400" strokeWidth={1.5} />
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-signal-500/25 bg-signal-500/10 font-mono text-sm text-signal-300">
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

        {/* Footer */}
        <footer className="mt-24 flex items-center justify-between border-t border-white/5 pt-6">
          <p className="font-mono text-[11px] text-zinc-600">
            © {new Date().getFullYear()} Nocturne
          </p>
          <div className="flex gap-4 font-mono text-[11px] text-zinc-600">
            <Link href="/login" className="hover:text-signal-400">
              Log in
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
