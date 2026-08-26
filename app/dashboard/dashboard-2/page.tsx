import { getDashboardData } from "@/lib/dashboard-data";
import { Card } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/StatTile";
import { Achievements } from "@/components/dashboard/Achievements";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

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
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard 2</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A sandbox for trying out new dashboard ideas before they go anywhere permanent.
        </p>
      </Reveal>

      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
        <RevealItem>
          <StatTile
            icon="🔥"
            title="Best Streak"
            value={`${data.bestCurrent} days`}
            sub={`Longest ever: ${data.bestLongest} days`}
            href="/dashboard/streaks"
          />
        </RevealItem>
        <RevealItem>
          <StatTile
            icon="🎯"
            title="Active Goals"
            value={data.activeGoals.length}
            sub={`${data.completedGoalsCount} completed`}
            href="/dashboard/goals"
          />
        </RevealItem>
        <RevealItem>
          <StatTile
            icon="📓"
            title="Journal Entries"
            value={data.journalCount}
            sub={data.recentJournal[0] ? "Last entry recently" : "No entries yet"}
            href="/dashboard/journal"
          />
        </RevealItem>
        <RevealItem>
          <StatTile
            icon="⚡"
            title="Momentum"
            value={`${data.momentum}%`}
            sub={data.momentumVibe}
            href="/dashboard"
          />
        </RevealItem>
      </RevealGroup>

      <Reveal delay={0.1}>
        <Achievements achievements={data.achievements} />
      </Reveal>

      <Reveal delay={0.14}>
        <Card className="border-dashed p-10 text-center transition-colors duration-300 hover:border-primary/25">
          <p className="text-sm font-medium">More coming as you test things</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            This page is intentionally plain — the tiles above show it&apos;s wired up to real data,
            and everything else is open space to try new widgets or layouts.
          </p>
        </Card>
      </Reveal>
    </div>
  );
}
