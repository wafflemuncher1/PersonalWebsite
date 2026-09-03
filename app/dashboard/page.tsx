import Link from "next/link";
import { Flame, Eye, Target, NotebookPen, BookOpen, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { StatTile } from "@/components/dashboard/StatTile";
import { ManageAccountCard } from "@/components/dashboard/ManageAccountCard";
import { Achievements, type Achievement } from "@/components/dashboard/Achievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { TodayStreaks } from "@/components/streaks/TodayStreaks";
import { Heatmap } from "@/components/streaks/Heatmap";
import { Gauge } from "@/components/charts/gauge";
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
        <h1 className="font-display text-3xl font-semibold tracking-tight">Account overview</h1>
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

      <h2 className="font-display text-lg font-semibold">Account statistics</h2>

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

      <Achievements achievements={achievements} />

      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your activity</h2>

      <RevealGroup className="grid gap-6 lg:grid-cols-3" stagger={0.08}>
        {/* Today's streaks */}
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

        {/* Journal preview */}
        <RevealItem>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Journal</CardTitle>
              <Link href="/dashboard/journal" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
                view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentJournal.length === 0 ? (
                <EmptyState message="No entries yet." href="/dashboard/journal" cta="Write one" />
              ) : (
                <RevealGroup className="space-y-3" stagger={0.06}>
                  {recentJournal.map((e) => (
                    <RevealItem key={e.id}>
                      <Link
                        href="/dashboard/journal"
                        className="glass-inset glass-inset-hover block rounded-lg p-3 transition-all duration-200 ease-premium hover:translate-x-0.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">{MOOD_EMOJI[e.mood] ?? "😐"}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{relativeTime(e.created_at)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.entry}</p>
                      </Link>
                    </RevealItem>
                  ))}
                </RevealGroup>
              )}
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>

      {/* Recent notes + priority goals */}
      <RevealGroup className="grid gap-6 lg:grid-cols-2" stagger={0.08}>
        <RevealItem>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recent notes</CardTitle>
              <Link href="/dashboard/notes" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
                view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <EmptyState message="No notes yet." href="/dashboard/notes" cta="Write one" />
              ) : (
                <div className="space-y-3">
                  {recentNotes.map((n) => (
                    <Link
                      key={n.id}
                      href="/dashboard/notes"
                      className="glass-inset glass-inset-hover block rounded-lg p-3 transition-all duration-200 ease-premium hover:translate-x-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">{n.title || "Untitled"}</p>
                        {n.pinned && <span className="text-xs text-primary">★</span>}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content || "Empty note"}</p>
                      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">{relativeTime(n.updated_at)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </RevealItem>

        <RevealItem>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Priority goals</CardTitle>
              <Link href="/dashboard/goals" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
                view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {topGoals.length === 0 ? (
                <EmptyState message="No active goals yet." href="/dashboard/goals" cta="Set a goal" />
              ) : (
                <div className="space-y-3">
                  {topGoals.map((g) => (
                    <div key={g.id} className="glass-inset rounded-lg p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{g.title}</p>
                        <Badge variant={g.priority === "high" ? "destructive" : g.priority === "medium" ? "secondary" : "outline"}>
                          {g.priority}
                        </Badge>
                      </div>
                      <Progress value={g.progress} />
                      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">{g.progress}% complete</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>
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
