import Link from "next/link";

const STACK = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Supabase",
  "Python",
  "Tailwind CSS",
];

const PROJECTS = [
  {
    title: "Nocturne",
    description:
      "This site — a personal dashboard with strict row-level security, notes, goal tracking, and streak habits, built on Next.js + Supabase.",
    tags: ["Next.js", "Supabase", "RLS"],
  },
  {
    title: "Project Two",
    description:
      "Placeholder for another project. Swap this out with something you've shipped — a link, a screenshot, a short write-up of the problem and approach.",
    tags: ["Add", "Your", "Stack"],
  },
  {
    title: "Project Three",
    description:
      "Another placeholder slot. Three or four strong projects usually beats a long list — pick the ones you're proudest of.",
    tags: ["Placeholder"],
  },
];

const LINKS = [
  { label: "Email", value: "zanerisinger@gmail.com", href: "mailto:zanerisinger@gmail.com" },
  { label: "GitHub", value: "github.com/yourhandle", href: "https://github.com" },
  { label: "LinkedIn", value: "linkedin.com/in/yourhandle", href: "https://linkedin.com" },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-20 sm:pt-28">
        {/* Hero */}
        <section className="animate-fade-up">
          <div className="mb-6 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              available for interesting work
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Zane Risinger
          </h1>
          <p className="mt-3 text-lg text-gradient font-medium">
            Builder. Tinkerer. Habitual shipper of small, sharp tools.
          </p>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            I like taking messy problems and turning them into something clean, fast, and a
            little bit fun to use. This is a placeholder bio — swap in your real story: what you
            work on, what you're into, and what you're looking for. Two or three sentences is
            plenty.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-zinc-400"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mt-20">
          <h2 className="mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
            <span className="h-px flex-1 bg-gradient-to-r from-violet-500/40 to-transparent" />
            Selected work
            <span className="h-px flex-1 bg-gradient-to-l from-violet-500/40 to-transparent" />
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {PROJECTS.map((p, i) => (
              <div
                key={p.title}
                className="glass glass-hover group rounded-xl p-5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-white">{p.title}</h3>
                  <span className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-violet-400">
                    →
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] text-violet-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <div className="glass flex flex-col items-start justify-center rounded-xl border-dashed p-5 text-sm text-zinc-500">
              <span className="mb-1 text-2xl">+</span>
              More coming — this slot is reserved for whatever you ship next.
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-20">
          <h2 className="mb-6 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.15em] text-zinc-500">
            <span className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
            Get in touch
            <span className="h-px flex-1 bg-gradient-to-l from-amber-500/40 to-transparent" />
          </h2>

          <div className="glass divide-y divide-white/5 overflow-hidden rounded-xl">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-3.5 text-sm transition hover:bg-white/[0.03]"
              >
                <span className="text-zinc-500">{l.label}</span>
                <span className="text-zinc-200">{l.value}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 flex items-center justify-between border-t border-white/5 pt-6">
          <p className="font-mono text-[11px] text-zinc-600">
            © {new Date().getFullYear()} Zane Risinger
          </p>
          <Link
            href="/login"
            className="font-mono text-[11px] text-zinc-700 transition hover:text-violet-400"
          >
            •
          </Link>
        </footer>
      </div>
    </main>
  );
}
