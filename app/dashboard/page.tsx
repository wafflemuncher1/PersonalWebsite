import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { TodayStreaks } from "@/components/streaks/TodayStreaks";
import { computeStreakStats, relativeTime, todayKey } from "@/lib/utils";
import type { Goal, Note, Streak, StreakLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = createClient();

  const [{ data: notes }, notesCountRes, { data: goals }, { data: streaks }, { data: logs }] =
    await Promise.all([
      supabase.from("notes").select("*").order("updated_at", { ascending: false }).limit(4),
      supabase.from("notes").select("*", { count: "exact", head: true }),
      supabase.from("goals").select("*").order("updated_at", { ascending: false }),
      supabase.from("streaks").select("*").eq("archived", false).order("created_at"),
      supabase
        .from("streak_logs")
        .select("*")
        .gte("log_date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10)),
    ]);

  const notesCount = notesCountRes.count ?? 0;

  const allGoals = (goals ?? []) as Goal[];
  const allStreaks = (streaks ?? []) as Streak[];
  const allLogs = (logs ?? []) as StreakLog[];
  const recentNotes = (notes ?? []) as Note[];

  const activeGoals = allGoals.filter((g) => g.status === "active");
  const completedGoals = allGoals.filter((g) => g.status === "completed");
  const avgProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
    : 0;

  const today = todayKey();
  const loggedToday = new Set(allLogs.filter((l) => l.log_date === today).map((l) => l.streak_id));

  const streakStatsById = new Map<string, { current: number; longest: number; total: number }>();
  for (const s of allStreaks) {
    const keys = new Set(allLogs.filter((l) => l.streak_id === s.id).map((l) => l.log_date));
    streakStatsById.set(s.id, computeStreakStats(keys));
  }
  const bestCurrent = Math.max(0, ...allStreaks.map((s) => streakStatsById.get(s.id)?.current ?? 0));

  const topGoals = [...activeGoals]
    .sort((a, b) => {
      const pr = { high: 0, medium: 1, low: 2 };
      return pr[a.priority] - pr[b.priority] || b.progress - a.progress;
    })
    .slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">{greeting}, Zane.</h2>
        <p className="mt-1 text-sm text-zinc-500">Here&apos;s where things stand.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active goals" value={activeGoals.length} sub={`${completedGoals.length} completed`} icon="◎" />
        <StatCard label="Avg. progress" value={`${avgProgress}%`} sub="across active goals" icon="▲" accent="emerald" />
        <StatCard
          label="Best streak"
          value={bestCurrent}
          sub={bestCurrent === 1 ? "day running" : "days running"}
          icon="🔥"
          accent="amber"
        />
        <StatCard label="Notes" value={notesCount} sub="saved" icon="✎" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's streaks */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Today&apos;s streaks</h2>
            <Link href="/dashboard/streaks" className="text-xs text-violet-400 hover:text-violet-300">
              view all →
            </Link>
          </div>
          {allStreaks.length === 0 ? (
            <EmptyState
              message="No streaks yet. Start one to build momentum."
              href="/dashboard/streaks"
              cta="Create a streak"
            />
          ) : (
            <TodayStreaks
              streaks={allStreaks}
              loggedTodayIds={Array.from(loggedToday)}
              statsById={Object.fromEntries(streakStatsById)}
            />
          )}
        </Card>

        {/* Recent notes */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent notes</h2>
            <Link href="/dashboard/notes" className="text-xs text-violet-400 hover:text-violet-300">
              view all →
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <EmptyState message="No notes yet." href="/dashboard/notes" cta="Write one" />
          ) : (
            <div className="space-y-3">
              {recentNotes.map((n) => (
                <Link
                  key={n.id}
                  href="/dashboard/notes"
                  className="block rounded-lg border border-white/5 bg-white/[0.02] p-3 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-zinc-200">{n.title || "Untitled"}</p>
                    {n.pinned && <span className="text-amber-400 text-xs">★</span>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{n.content || "Empty note"}</p>
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-600">{relativeTime(n.updated_at)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Priority goals */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Priority goals</h2>
          <Link href="/dashboard/goals" className="text-xs text-violet-400 hover:text-violet-300">
            view all →
          </Link>
        </div>
        {topGoals.length === 0 ? (
          <EmptyState message="No active goals yet." href="/dashboard/goals" cta="Set a goal" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {topGoals.map((g) => (
              <div key={g.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-zinc-200">{g.title}</p>
                  <Badge
                    color={g.priority === "high" ? "red" : g.priority === "medium" ? "amber" : "zinc"}
                  >
                    {g.priority}
                  </Badge>
                </div>
                <ProgressBar value={g.progress} />
                <p className="mt-1.5 font-mono text-[10px] text-zinc-600">{g.progress}% complete</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function EmptyState({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
      <p className="mb-3 text-sm text-zinc-500">{message}</p>
      <Link
        href={href}
        className="inline-flex rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20"
      >
        {cta} →
      </Link>
    </div>
  );
}
