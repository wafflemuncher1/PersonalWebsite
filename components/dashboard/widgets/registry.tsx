import Link from "next/link";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { StatTile } from "@/components/dashboard/StatTile";
import { ManageAccountCard } from "@/components/dashboard/ManageAccountCard";
import { Achievements } from "@/components/dashboard/Achievements";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { TodayStreaks } from "@/components/streaks/TodayStreaks";
import { relativeTime } from "@/lib/utils";
import type { DashboardData } from "@/lib/dashboard-data";
import type { WidgetKey } from "@/lib/dashboard-widgets";

const MOOD_EMOJI: Record<string, string> = {
  great: "🤩",
  good: "🙂",
  neutral: "😐",
  low: "😕",
  rough: "😣",
};

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

function HeroBestStreak({ data }: { data: DashboardData }) {
  return (
    <HeroStat
      label="Best streak"
      value={data.bestCurrent}
      sub={data.bestCurrent === 1 ? "day running" : "days running"}
      icon="🔥"
    />
  );
}

function HeroProfileViews({ data }: { data: DashboardData }) {
  return (
    <HeroStat
      label="Profile views"
      value={(data.profile?.view_count ?? 0).toLocaleString()}
      sub="all time"
      icon="👁"
    />
  );
}

function HeroMomentum({ data }: { data: DashboardData }) {
  return <HeroStat label="Momentum" value={data.momentum} sub={data.momentumVibe} icon="⚡" />;
}

function HeroActiveGoals({ data }: { data: DashboardData }) {
  return (
    <HeroStat
      label="Active goals"
      value={data.activeGoals.length}
      sub={`${data.completedGoalsCount} completed`}
      icon="◎"
    />
  );
}

function AccountStatisticsWidget({ data }: { data: DashboardData }) {
  return (
    <Card className="h-full p-6">
      <h2 className="mb-4 text-sm font-medium text-white">Account Statistics</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon="🔥"
          title="Top streak"
          value={data.topStreak ? `${data.topStreak.emoji} ${data.topStreak.name}` : "No streaks yet"}
          sub={data.topStreak ? `${data.bestCurrent} day${data.bestCurrent === 1 ? "" : "s"}` : undefined}
          href="/dashboard/streaks"
        />
        <StatTile
          icon="◎"
          title="Top goal"
          value={data.topGoals[0]?.title ?? "No goals yet"}
          sub={data.topGoals[0] ? `${data.topGoals[0].progress}% complete` : undefined}
          href="/dashboard/goals"
        />
        <StatTile
          icon="✎"
          title="Recent note"
          value={data.recentNotes[0] ? data.recentNotes[0].title || "Untitled" : "No notes yet"}
          sub={data.recentNotes[0]?.content}
          href="/dashboard/notes"
        />
        <StatTile
          icon="📓"
          title="Journal"
          value={`${data.journalCount} ${data.journalCount === 1 ? "entry" : "entries"}`}
          sub={data.recentJournal[0]?.entry}
          href="/dashboard/journal"
        />
      </div>
    </Card>
  );
}

function ManageAccountWidget() {
  return <ManageAccountCard />;
}

function AchievementsWidget({ data }: { data: DashboardData }) {
  return <Achievements achievements={data.achievements} />;
}

function TodaysStreaksWidget({ data }: { data: DashboardData }) {
  return (
    <Card className="h-full p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Today&apos;s streaks</h2>
        <Link href="/dashboard/streaks" className="text-xs text-violet-400 hover:text-violet-300">
          view all →
        </Link>
      </div>
      {data.allStreaks.length === 0 ? (
        <EmptyState message="No streaks yet. Start one to build momentum." href="/dashboard/streaks" cta="Create a streak" />
      ) : (
        <TodayStreaks
          streaks={data.allStreaks}
          loggedTodayIds={data.loggedTodayIds}
          statsById={data.streakStatsById}
        />
      )}
    </Card>
  );
}

function JournalPreviewWidget({ data }: { data: DashboardData }) {
  return (
    <Card className="h-full p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Journal</h2>
        <Link href="/dashboard/journal" className="text-xs text-violet-400 hover:text-violet-300">
          view all →
        </Link>
      </div>
      {data.recentJournal.length === 0 ? (
        <EmptyState message="No entries yet." href="/dashboard/journal" cta="Write one" />
      ) : (
        <div className="space-y-3">
          {data.recentJournal.map((e) => (
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
  );
}

function RecentNotesWidget({ data }: { data: DashboardData }) {
  return (
    <Card className="h-full p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Recent notes</h2>
        <Link href="/dashboard/notes" className="text-xs text-violet-400 hover:text-violet-300">
          view all →
        </Link>
      </div>
      {data.recentNotes.length === 0 ? (
        <EmptyState message="No notes yet." href="/dashboard/notes" cta="Write one" />
      ) : (
        <div className="space-y-3">
          {data.recentNotes.map((n) => (
            <Link
              key={n.id}
              href="/dashboard/notes"
              className="block rounded-lg border border-white/5 bg-white/[0.02] p-3 transition hover:border-violet-500/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-zinc-200">{n.title || "Untitled"}</p>
                {n.pinned && <span className="text-xs text-amber-400">★</span>}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{n.content || "Empty note"}</p>
              <p className="mt-1.5 font-mono text-[10px] text-zinc-600">{relativeTime(n.updated_at)}</p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function PriorityGoalsWidget({ data }: { data: DashboardData }) {
  return (
    <Card className="h-full p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Priority goals</h2>
        <Link href="/dashboard/goals" className="text-xs text-violet-400 hover:text-violet-300">
          view all →
        </Link>
      </div>
      {data.topGoals.length === 0 ? (
        <EmptyState message="No active goals yet." href="/dashboard/goals" cta="Set a goal" />
      ) : (
        <div className="space-y-3">
          {data.topGoals.map((g) => (
            <div key={g.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-zinc-200">{g.title}</p>
                <Badge color={g.priority === "high" ? "red" : g.priority === "medium" ? "amber" : "zinc"}>
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
  );
}

export const WIDGET_COMPONENTS: Record<WidgetKey, (props: { data: DashboardData }) => JSX.Element> = {
  hero_best_streak: HeroBestStreak,
  hero_profile_views: HeroProfileViews,
  hero_momentum: HeroMomentum,
  hero_active_goals: HeroActiveGoals,
  account_statistics: AccountStatisticsWidget,
  manage_account: ManageAccountWidget,
  achievements: AchievementsWidget,
  todays_streaks: TodaysStreaksWidget,
  journal_preview: JournalPreviewWidget,
  recent_notes: RecentNotesWidget,
  priority_goals: PriorityGoalsWidget,
};
