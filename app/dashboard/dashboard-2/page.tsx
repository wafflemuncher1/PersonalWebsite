import { getDashboardData } from "@/lib/dashboard-data";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/dashboard/StatTile";
import { Achievements } from "@/components/dashboard/Achievements";

export const dynamic = "force-dynamic";

// A clean sandbox for trying out new dashboard ideas — separate from
// Overview so nothing here risks breaking the page every user actually
// depends on. Replaced the old drag-and-drop Dashboard Builder system,
// which added a lot of moving parts (a widget registry, a saved layout
// column, a whole builder UI) for something that's really just meant to be
// a scratchpad. Starts pre-wired to real account data via
// getDashboardData — the same fetcher Overview uses — so there's always
// something real to look at while trying things out.
export default async function Dashboard2Page() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard 2</h1>
        <p className="mt-1 text-sm text-zinc-500">
          A sandbox for trying out new dashboard ideas before they go anywhere permanent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon="🔥"
          title="Best Streak"
          value={`${data.bestCurrent} days`}
          sub={`Longest ever: ${data.bestLongest} days`}
          href="/dashboard/streaks"
        />
        <StatTile
          icon="🎯"
          title="Active Goals"
          value={data.activeGoals.length}
          sub={`${data.completedGoalsCount} completed`}
          href="/dashboard/goals"
        />
        <StatTile
          icon="📓"
          title="Journal Entries"
          value={data.journalCount}
          sub={data.recentJournal[0] ? "Last entry recently" : "No entries yet"}
          href="/dashboard/journal"
        />
        <StatTile
          icon="⚡"
          title="Momentum"
          value={`${data.momentum}%`}
          sub={data.momentumVibe}
          href="/dashboard"
        />
      </div>

      <Achievements achievements={data.achievements} />

      <Card className="border-dashed p-10 text-center">
        <p className="text-sm font-medium text-zinc-300">More coming as you test things</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
          This page is intentionally plain — the tiles above show it&apos;s wired up to real data,
          and everything else is open space to try new widgets or layouts.
        </p>
      </Card>
    </div>
  );
}
