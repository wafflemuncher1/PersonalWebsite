import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { ManageAccountCard } from "@/components/dashboard/ManageAccountCard";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { Achievements, type Achievement } from "@/components/dashboard/Achievements";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
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

  const greetName = profile?.display_name?.trim() || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {greeting}, {greetName}.
          </h2>
          <p className="mt-1 text-sm text-zinc-500">Here&apos;s where things stand.</p>
        </div>
        {profile?.username && (
          <Link
            href={`/${profile.username}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
          >
            nocturne.co/{profile.username} ↗
          </Link>
        )}
      </div>

      <h2 className="text-lg font-semibold text-white">Account Overview</h2>

      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <HeroStat
          label="Best streak"
          value={bestCurrent}
          sub={bestCurrent === 1 ? "day running" : "days running"}
          icon="🔥"
        />
        <HeroStat
          label="Profile views"
          value={(profile?.view_count ?? 0).toLocaleString()}
          sub="all time"
          icon="👁"
        />
        <HeroStat label="Momentum" value={momentum} sub={momentumVibe} icon="⚡" />
        <HeroStat
          label="Active goals"
          value={activeGoals.length}
          sub={`${completedGoals.length} completed`}
          icon="◎"
        />
      </div>

      <h2 className="text-lg font-semibold text-white">Account Statistics</h2>

      {/* Profile completion + manage account */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileCompletionCard profile={profile} />
        </div>
        <ManageAccountCard />
      </div>

      <Achievements achievements={achievements} />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Your activity</h2>

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

        {/* Journal preview */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Journal</h2>
            <Link href="/dashboard/journal" className="text-xs text-violet-400 hover:text-violet-300">
              view all →
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
                  className="block rounded-lg border border-white/5 bg-white/[0.02] p-3 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
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
            <div className="space-y-3">
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
