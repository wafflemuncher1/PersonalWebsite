import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername } from "@/lib/reserved-usernames";
import type { Profile, ProfileLink, PublicStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username.toLowerCase();
  if (isReservedUsername(username)) {
    notFound();
  }

  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const p = profile as Profile;
  const links = Array.isArray(p.links) ? (p.links as ProfileLink[]) : [];

  let stats: PublicStats | null = null;
  if (p.show_stats) {
    const { data: statsData } = await supabase.rpc("get_public_stats", { p_username: username });
    stats = (statsData as PublicStats | null) ?? null;
  }

  const initial = (p.display_name || p.username).trim().charAt(0).toUpperCase() || "?";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="relative z-10 mx-auto max-w-md px-6 pb-16 pt-16 sm:pt-24">
        {/* Avatar + identity */}
        <div className="flex flex-col items-center text-center">
          {p.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.avatar_url}
              alt={p.display_name || p.username}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-500 text-2xl font-semibold text-white shadow-glow">
              {initial}
            </div>
          )}
          <h1 className="mt-4 text-xl font-semibold text-white">
            {p.display_name || p.username}
          </h1>
          <p className="font-mono text-xs text-zinc-500">@{p.username}</p>
          {p.bio && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">{p.bio}</p>
          )}
        </div>

        {/* Public stats (opt-in) */}
        {stats && (
          <div className="mt-8 grid grid-cols-4 gap-2">
            <StatChip label="goals done" value={stats.goals_completed} />
            <StatChip label="active goals" value={stats.active_goals} />
            <StatChip label="streaks" value={stats.active_streaks} />
            <StatChip label="check-ins" value={stats.total_check_ins} />
          </div>
        )}

        {/* Links */}
        <div className="mt-8 space-y-3">
          {links.length === 0 ? (
            <p className="text-center text-sm text-zinc-600">No links yet.</p>
          ) : (
            links.map((link, i) => (
              <a
                key={`${link.url}-${i}`}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="glass glass-hover flex items-center justify-center rounded-xl px-5 py-3.5 text-sm font-medium text-zinc-200 transition"
              >
                {link.label}
              </a>
            ))
          )}
        </div>

        {/* Footer / growth loop */}
        <footer className="mt-16 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <Link href="/" className="font-mono transition hover:text-violet-400">
            made with NOCTURNE
          </Link>
        </footer>
      </div>
    </main>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-lg px-2 py-3 text-center">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
    </div>
  );
}
