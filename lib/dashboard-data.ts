// Shared data fetch + computation for Dashboard 2 and the Dashboard Builder
// preview. This mirrors the logic in app/dashboard/page.tsx (Overview) so the
// two dashboards show consistent numbers — but lives separately so Overview
// itself is never touched by this feature.

import { createClient } from "@/lib/supabase/server";
import { computeStreakStats, todayKey } from "@/lib/utils";
import type { Achievement } from "@/components/dashboard/Achievements";
import type { Goal, JournalEntry, Note, Profile, Streak, StreakLog } from "@/lib/types";

export type StreakStats = { current: number; longest: number; total: number };

export type DashboardData = {
  profile: Profile | null;
  bestCurrent: number;
  bestLongest: number;
  momentum: number;
  momentumVibe: string;
  activeGoals: Goal[];
  completedGoalsCount: number;
  topStreak: Streak | null;
  topGoals: Goal[];
  allStreaks: Streak[];
  loggedTodayIds: string[];
  streakStatsById: Record<string, StreakStats>;
  recentNotes: Note[];
  notesCount: number;
  journalCount: number;
  recentJournal: JournalEntry[];
  achievements: Achievement[];
};

export async function getDashboardData(): Promise<DashboardData> {
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

  const streakStatsById: Record<string, StreakStats> = {};
  for (const s of allStreaks) {
    const keys = new Set(allLogs.filter((l) => l.streak_id === s.id).map((l) => l.log_date));
    streakStatsById[s.id] = computeStreakStats(keys);
  }
  const bestCurrent = Math.max(0, ...allStreaks.map((s) => streakStatsById[s.id]?.current ?? 0));
  const bestLongest = Math.max(0, ...allStreaks.map((s) => streakStatsById[s.id]?.longest ?? 0));

  const topStreak = allStreaks.reduce<Streak | null>((top, s) => {
    const cur = streakStatsById[s.id]?.current ?? 0;
    const topCur = top ? streakStatsById[top.id]?.current ?? 0 : -1;
    return cur > topCur ? s : top;
  }, null);

  const topGoals = [...activeGoals]
    .sort((a, b) => {
      const pr = { high: 0, medium: 1, low: 2 };
      return pr[a.priority] - pr[b.priority] || b.progress - a.progress;
    })
    .slice(0, 4);

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

  return {
    profile,
    bestCurrent,
    bestLongest,
    momentum,
    momentumVibe,
    activeGoals,
    completedGoalsCount: completedGoals.length,
    topStreak,
    topGoals,
    allStreaks,
    loggedTodayIds: Array.from(loggedToday),
    streakStatsById,
    recentNotes,
    notesCount,
    journalCount,
    recentJournal,
    achievements,
  };
}
