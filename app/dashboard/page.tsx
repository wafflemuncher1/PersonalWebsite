import Link from "next/link";
import { Flame, Eye, Target, NotebookPen, BookOpen, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { StatTile } from "@/components/dashboard/StatTile";
import { ManageAccountCard } from "@/components/dashboard/ManageAccountCard";
import { RecentNotesCard } from "@/components/dashboard/RecentNotesCard";
import { QuickMoodCheckin } from "@/components/dashboard/QuickMoodCheckin";
import { QuickRemindersCard } from "@/components/dashboard/QuickRemindersCard";
import { Achievements, type Achievement } from "@/components/dashboard/Achievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { TodayStreaks } from "@/components/streaks/TodayStreaks";
import { Heatmap } from "@/components/streaks/Heatmap";
import { Gauge } from "@/components/charts/gauge";
import { computeStreakStats, relativeTime, todayKey } from "@/lib/utils";
import type { Goal, JournalEntry, Note, Profile, Reminder, Streak, StreakLog } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    { data: reminders },
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
    supabase.from("reminders").select("*").order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  const notesCount = notesCountRes.count ?? 0;
  const journalCount = journalCountRes.count ?? 0;

  const allGoals = (goals ?? []) as Goal[];
  const allStreaks = (streaks ?? []) as Streak[];
  const allLogs = (logs ?? []) as StreakLog[];
  const recentNotes = (notes ?? []) as Note[];
  const allReminders = (reminders ?? []) as Reminder[];
  const openReminders = allReminders.filter((r) => !r.completed);
  const recentJournal = ((journalEntries ?? []) as JournalEntry[]).slice(0, 3);
  const journalForStats = (journalEntries ?? []) as JournalEntry[];
  const profile = profileData as Profile | null;

  const activeGoals = allGoals.filter((g) => g.status === "active");
  const completedGoals = allGoals.filter((g) => g.status === "completed");

  const today = todayKey();
  const loggedToday = new Set(allLogs.filter((l) => l.log_date === today).map((l) => l.streak_id));
  const todaysJournalEntry = journalForStats.find((e) => e.created_at.slice(0, 10) === today) ?? null;

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Still up" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || profile?.username || "there";

  // Combined activity across every streak — the Overview's own heatmap is a
  // superset of any single streak's, so it can't reuse a per-streak Set.
  const combinedLoggedDates = new Set(allLogs.map((l) => l.log_date));

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

  // Momentum: "did today's stuff get done" — not a blended long-term score,
  // just today's checklist. Each applicable item is an equal share of 100%;
  // an item with nothing to do today (no streaks, no reminders due today)
  // is excluded from the denominator entirely rather than counted as free
  // credit, so momentum only ever reflects things you actually could have
  // done today.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday.getTime() + 86400000);
  const remindersDueToday = allReminders.filter((r) => {
    if (!r.due_date) return false;
    const due = new Date(r.due_date);
    return due >= startOfToday && due < endOfToday;
  });

  const momentumItems = [
    allStreaks.length > 0 ? allStreaks.every((s) => loggedToday.has(s.id)) : null,
    Boolean(todaysJournalEntry), // "write a journal entry today"
    Boolean(todaysJournalEntry), // "log your mood today" — same check-in, same row
    remindersDueToday.length > 0 ? remindersDueToday.every((r) => r.completed) : null,
  ].filter((item): item is boolean => item !== null);

  const momentum = momentumItems.length
    ? Math.round((momentumItems.filter(Boolean).length / momentumItems.length) * 100)
    : 0;
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
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's what's worth doing today.</p>
      </Reveal>

      {/* Hero: momentum gauge + the rest of the top-line stats */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Reveal delay={0.02}>
          <Card className="flex h-full flex-col items-center justify-center gap-1 py-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-primary/30">
            <Gauge
              value={momentum}
              centerValue={momentum}
              defaultLabel="Momentum"
              suffix="%"
              spacing={22}
              inactiveFillOpacity={0.35}
              width={180}
              height={180}
            />
            <p className="text-sm text-muted-foreground">{momentumVibe}</p>
          </Card>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.08}>
          <RevealItem>
            <HeroStat
              label="Best streak"
              value={bestCurrent}
              sub={bestCurrent === 1 ? "day running" : "days running"}
              icon={<Flame className="h-4 w-4" strokeWidth={1.75} />}
            />
          </RevealItem>
          <RevealItem>
            <HeroStat
              label="Profile views"
              value={(profile?.view_count ?? 0).toLocaleString()}
              sub="all time"
              icon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
            />
          </RevealItem>
          <RevealItem>
            <HeroStat
              label="Active goals"
              value={activeGoals.length}
              sub={`${completedGoals.length} completed`}
              icon={<Target className="h-4 w-4" strokeWidth={1.75} />}
            />
          </RevealItem>
        </RevealGroup>
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Today</h2>

      <RevealGroup className="grid gap-6 lg:grid-cols-3" stagger={0.08}>
        {/* Today's streaks — the main daily-action surface, no need to leave this page */}
        <RevealItem className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Today&apos;s streaks</CardTitle>
              <Link href="/dashboard/streaks" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
                view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </RevealItem>

        {/* One-tap mood check-in */}
        <RevealItem>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Mood check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickMoodCheckin initialEntry={todaysJournalEntry} />
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>

      {/* Reminders + recent notes, both quick-editable in place */}
      <RevealGroup className="grid gap-6 lg:grid-cols-2" stagger={0.08}>
        <RevealItem>
          <QuickRemindersCard initialReminders={openReminders} />
        </RevealItem>
        <RevealItem>
          <RecentNotesCard initialNotes={recentNotes} />
        </RevealItem>
      </RevealGroup>

      {/* Combined activity across every streak */}
      <Reveal delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {allStreaks.length === 0 ? (
              <EmptyState
                message="No streaks yet. Start one to see your activity here."
                href="/dashboard/streaks"
                cta="Create a streak"
              />
            ) : (
              <div className="overflow-x-auto pb-1">
                <Heatmap loggedDates={combinedLoggedDates} weeksCount={18} size="sm" showMonths />
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      <Achievements achievements={achievements} />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                icon={<Flame className="h-4 w-4" strokeWidth={1.75} />}
                title="Top streak"
                value={topStreak ? `${topStreak.emoji} ${topStreak.name}` : "No streaks yet"}
                sub={topStreak ? `${bestCurrent} day${bestCurrent === 1 ? "" : "s"}` : undefined}
                href="/dashboard/streaks"
              />
              <StatTile
                icon={<Target className="h-4 w-4" strokeWidth={1.75} />}
                title="Top goal"
                value={topGoals[0]?.title ?? "No goals yet"}
                sub={topGoals[0] ? `${topGoals[0].progress}% complete` : undefined}
                href="/dashboard/goals"
              />
              <StatTile
                icon={<NotebookPen className="h-4 w-4" strokeWidth={1.75} />}
                title="Recent note"
                value={recentNotes[0] ? recentNotes[0].title || "Untitled" : "No notes yet"}
                sub={recentNotes[0]?.content}
                href="/dashboard/notes"
              />
              <StatTile
                icon={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
                title="Journal"
                value={`${journalCount} ${journalCount === 1 ? "entry" : "entries"}`}
                sub={recentJournal[0]?.entry}
                href="/dashboard/journal"
              />
            </div>
          </CardContent>
        </Card>
        <ManageAccountCard />
      </div>
    </div>
  );
}

function EmptyState({ message, href, cta }: { message: string; href: string; cta: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center">
      <p className="mb-3 text-sm text-muted-foreground">{message}</p>
      <Button variant="secondary" size="sm" render={<Link href={href}>{cta} <ArrowRight className="h-3 w-3" /></Link>} />
    </div>
  );
}
