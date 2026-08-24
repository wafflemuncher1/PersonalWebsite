import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { StatTile } from "@/components/dashboard/StatTile";
import { ManageAccountCard } from "@/components/dashboard/ManageAccountCard";
import { Achievements, type Achievement } from "@/components/dashboard/Achievements";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { TodayStreaks } from "@/components/streaks/TodayStreaks";
import { computeStreakStats, relativeTime, todayKey } from "@/lib/utils";
import type { Goal, JournalEntry, Note, Profile, Streak, StreakLog } from "@/lib/types";

export const dynamic = "force-dynamic";

const MOOD_EMOJI: Record<string, string> = {
  great: "🤩",
  good: "🙂",
  neutral: "😐",
  low: "😕",
  rough: "😣",
};

export default async function OverviewPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: notes },
    notesCountRes,
    { data: goals },
    { data: streaks },
    { data: logs },
    { data: journalEntries },
    journalCountRes,
    { data: profileData },
  ] = await Promise.all([
    supabase.from("notes").select("*").order("updated_at", { ascending: false }).limit(4),
    supabase.from("notes").select("*", { count: "exact", head: true }),
    supabase.from("goals").select("*").order("updated_at", { ascending: false }),
    supabase.from("streaks").select("*").eq("archived", false).order("created_at"),
    supabase
      .from("streak_logs")
      .select("*")
      .gte("log_date", new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10)),
    supabase.from("journal_entries").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("journal_entries").select("*", { count: "exact", head: true }),
    user ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const notesCount = notesCountRes.count ?? 0;
  const journalCount = journalCountRes.count ?? 0;

  const allGoals = (goals ?? []) as Goal[];
  const allStreaks = (streaks ?? []) as Streak[];
  const allLogs = (logs ?? []) as StreakLog[];
  const recentNotes = (notes ?? []) as Note[];
  const recentJournal = ((journalEntries ?? []) as JournalEntry[]).slice(0, 3);
  const journalForStats = (journalEntries ?? []) as JournalEntry[];
  const profile = profileData as Profile | null;

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
  const bestLongest = Math.max(0, ...allStreaks.map((s) => streakStatsById.get(s.id)?.longest ?? 0));

  const topStreak = allStreaks.reduce<Streak | null>((top, s) => {
    const cur = streakStatsById.get(s.id)?.current ?? 0;
    const topCur = top ? streakStatsById.get(top.id)?.current ?? 0 : -1;
    return cur > topCur ? s : top;
  }, null);

  const topGoals = [...activeGoals]
    .sort((a, b) => {
      const pr = { high: 0, medium: 1, low: 2 };
      return pr[a.priority] - pr[b.priority] || b.progress - a.progress;
    })
    .slice(0, 4);

  // Momentum: blended, gamified score — not a metric anyone else can see.
  const journalLast7 = journalForStats.filter(
    (e) => Date.now() - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;
  const momentum = Math.round(
    (avgProgress / 100) * 40 + (Math.min(bestCurrent, 14) / 14) * 30 + (Math.min(journalLast7, 7) / 7) * 30
  );
  const momentumVibe =
    momentum >= 85
      ? "Locked in"
      : momentum >= 60
        ? "On a roll"
        : momentum >= 35
          ? "Building steam"
          : momentum >= 10
            ? "Just getting started"
            : "Wide open";

  const achievements: Achievement[] = [
    { id: "first-goal", emoji: "◎", label: "First goal set", unlocked: allGoals.length >= 1 },
    { id: "goal-getter", emoji: "🎯", label: "Goal getter", unlocked: completedGoals.length >= 1 },
    { id: "goal-crusher", emoji: "🏆", label: "Goal crusher ×10", unlocked: completedGoals.length >= 10 },
    { id: "streak-3", emoji: "🔥", label: "3-day streak", unlocked: bestCurrent >= 3 },
    { id: "streak-7", emoji: "⚡", label: "Week on fire", unlocked: bestCurrent >= 7 },
    { id: "streak-30", emoji: "🌋", label: "Unstoppable ×30", unlocked: bestLongest >= 30 },
    { id: "journaler", emoji: "📓", label: "Journaler ×5", unlocked: journalCount >= 5 },
    { id: "note-taker", emoji: "✎", label: "Note taker ×10", unlocked: notesCount >= 10 },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Account Overview</h1>
      </Reveal>

      {/* Hero stats */}
      <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.08}>
        <RevealItem>
          <HeroStat
            label="Best streak"
            value={bestCurrent}
            sub={bestCurrent === 1 ? "day running" : "days running"}
            icon="🔥"
          />
        </RevealItem>
        <RevealItem>
          <HeroStat
            label="Profile views"
            value={(profile?.view_count ?? 0).toLocaleString()}
            sub="all time"
            icon="👁"
          />
        </RevealItem>
        <RevealItem>
          <HeroStat label="Momentum" value={momentum} sub={momentumVibe} icon="⚡" />
        </RevealItem>
        <RevealItem>
          <HeroStat
            label="Active goals"
            value={activeGoals.length}
            sub={`${completedGoals.length} completed`}
            icon="◎"
          />
        </RevealItem>
      </RevealGroup>

      <h2 className="text-lg font-semibold text-white">Account Statistics</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              icon="🔥"
              title="Top streak"
              value={topStreak ? `${topStreak.emoji} ${topStreak.name}` : "No streaks yet"}
              sub={topStreak ? `${bestCurrent} day${bestCurrent === 1 ? "" : "s"}` : undefined}
              href="/dashboard/streaks"
            />
            <StatTile
              icon="◎"
              title="Top goal"
              value={topGoals[0]?.title ?? "No goals yet"}
              sub={topGoals[0] ? `${topGoals[0].progress}% complete` : undefined}
              href="/dashboard/goals"
            />
            <StatTile
              icon="✎"
              title="Recent note"
              value={recentNotes[0] ? recentNotes[0].title || "Untitled" : "No notes yet"}
              sub={recentNotes[0]?.content}
              href="/dashboard/notes"
            />
            <StatTile
              icon="📓"
              title="Journal"
              value={`${journalCount} ${journalCount === 1 ? "entry" : "entries"}`}
              sub={recentJournal[0]?.entry}
              href="/dashboard/journal"
            />
          </div>
        </Card>
        <ManageAccountCard />
      </div>

      <Achievements achievements={achievements} />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Your activity</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's streaks */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Today&apos;s streaks</h2>
            <Link href="/dashboard/streaks" className="group flex items-center gap-1 text-xs text-violet-400 transition-all hover:gap-1.5 hover:text-violet-300">
              view all <span className="transition-transform group-hover:translate-x-0.5">→</span>
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

        {/* Journal preview */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Journal</h2>
            <Link href="/dashboard/journal" className="group flex items-center gap-1 text-xs text-violet-400 transition-all hover:gap-1.5 hover:text-violet-300">
              view all <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          {recentJournal.length === 0 ? (
            <EmptyState message="No entries yet." href="/dashboard/journal" cta="Write one" />
          ) : (
            <div className="space-y-3">
              {recentJournal.map((e) => (
                <Link
                  key={e.id}
                  href="/dashboard/journal"
                  className="block rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all duration-200 ease-premium hover:translate-x-0.5 hover:border-violet-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{MOOD_EMOJI[e.mood] ?? "😐"}</span>
                    <span className="font-mono text-[10px] text-zinc-600">{relativeTime(e.created_at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{e.entry}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent notes + priority goals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent notes</h2>
            <Link href="/dashboard/notes" className="group flex items-center gap-1 text-xs text-violet-400 transition-all hover:gap-1.5 hover:text-violet-300">
              view all <span className="transition-transform group-hover:translate-x-0.5">→</span>
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
                  className="block rounded-lg border border-white/5 bg-white/[0.02] p-3 transition-all duration-200 ease-premium hover:translate-x-0.5 hover:border-violet-500/30 hover:bg-white/[0.04]"
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

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Priority goals</h2>
            <Link href="/dashboard/goals" className="group flex items-center gap-1 text-xs text-violet-400 transition-all hover:gap-1.5 hover:text-violet-300">
              view all <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          {topGoals.length === 0 ? (
            <EmptyState message="No active goals yet." href="/dashboard/goals" cta="Set a goal" />
          ) : (
            <div className="space-y-3">
              {topGoals.map((g) => (
                <div key={g.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors duration-200 hover:border-white/10">
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
