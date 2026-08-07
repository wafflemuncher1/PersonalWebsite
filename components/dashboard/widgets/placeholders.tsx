// Static, read-only "wireframe" versions of every dashboard widget, used only
// inside the Dashboard Builder canvas. They show no real account data and
// contain no working links or buttons — purely structural placeholders so
// the layout can be arranged without the noise (or risk) of live content.

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { WIDGET_BY_KEY } from "@/lib/dashboard-widgets";
import type { PointerEvent as ReactPointerEvent } from "react";

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn("rounded bg-white/[0.06]", className)} />;
}

function PlaceholderHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-medium text-white">{title}</h2>
      <span className="text-xs text-zinc-600">view all →</span>
    </div>
  );
}

export function StatPlaceholderBox({ widgetKey }: { widgetKey: string }) {
  const def = WIDGET_BY_KEY[widgetKey];
  if (!def) return null;
  return (
    <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-950/70 to-violet-900/20 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-300">{def.label}</span>
        <span className="text-zinc-500">{def.icon}</span>
      </div>
      <SkeletonBar className="h-6 w-14" />
      <SkeletonBar className="mt-2 h-2.5 w-20 bg-white/[0.04]" />
    </div>
  );
}

export function AccountStatisticsPlaceholder({
  nestedStats,
  isDropTarget,
  isHovering,
  onRemoveStat,
  onStatPointerDown,
  dropZoneRef,
}: {
  nestedStats: string[];
  isDropTarget: boolean;
  isHovering: boolean;
  onRemoveStat: (key: string) => void;
  onStatPointerDown: (key: string, e: ReactPointerEvent) => void;
  dropZoneRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <Card className="h-full p-6">
      <h2 className="mb-4 text-sm font-medium text-white">Account Statistics</h2>
      <div
        ref={dropZoneRef}
        data-dropzone={isDropTarget ? "account-stats" : undefined}
        className={cn(
          "grid grid-cols-2 gap-3 rounded-xl p-1.5 transition",
          isDropTarget && "border-2 border-dashed",
          isHovering
            ? "border-violet-400 bg-violet-500/10"
            : isDropTarget
              ? "border-violet-500/30"
              : "border-transparent"
        )}
      >
        {isDropTarget && nestedStats.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center rounded-lg py-3 text-center">
            <span className="text-lg">🧲</span>
            <p className="mt-1 text-xs font-medium text-violet-300">Drop stats here</p>
          </div>
        )}

        {!isDropTarget && nestedStats.length === 0 && (
          <>
            <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-3 w-10 bg-white/[0.04]" />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-3 w-10 bg-white/[0.04]" />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-3 w-10 bg-white/[0.04]" />
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-3 w-10 bg-white/[0.04]" />
            </div>
          </>
        )}

        {nestedStats.map((key) => {
          const def = WIDGET_BY_KEY[key];
          if (!def) return null;
          return (
            <div
              key={key}
              onPointerDown={(e) => onStatPointerDown(key, e)}
              className="group relative flex cursor-grab flex-col gap-1 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 active:cursor-grabbing"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveStat(key);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/60 text-[10px] text-white opacity-0 transition hover:bg-red-500/80 group-hover:opacity-100"
                aria-label={`Remove ${def.label}`}
              >
                ✕
              </button>
              <span className="text-xs text-zinc-400">
                {def.icon} {def.label}
              </span>
              <SkeletonBar className="h-3 w-10 bg-white/[0.05]" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function ManageAccountPlaceholder() {
  const items = ["Customize Profile", "Manage Links", "Browse Templates", "Account Settings"];
  return (
    <Card className="h-full p-6">
      <h2 className="text-sm font-medium text-white">Manage your account</h2>
      <p className="mb-4 mt-1 text-xs text-zinc-500">Customize your page, links, and account.</p>
      <div className="space-y-2">
        {items.map((label) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-400"
          >
            <span className="text-zinc-600">▢</span>
            {label}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AchievementsPlaceholder() {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Achievements</h2>
        <span className="font-mono text-xs text-zinc-600">-/-</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-center opacity-40 grayscale"
          >
            <span className="text-xl leading-none">🏅</span>
            <SkeletonBar className="h-1.5 w-10" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TodaysStreaksPlaceholder() {
  return (
    <Card className="h-full p-6">
      <PlaceholderHeader title="Today's streaks" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-40">🔥</span>
              <div className="space-y-1.5">
                <SkeletonBar className="h-2.5 w-16" />
                <SkeletonBar className="h-2 w-10 bg-white/[0.04]" />
              </div>
            </div>
            <div className="h-6 w-6 rounded-full border border-white/10" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ListPlaceholder({ title }: { title: string }) {
  return (
    <Card className="h-full p-6">
      <PlaceholderHeader title={title} />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <SkeletonBar className="h-2.5 w-24" />
            <SkeletonBar className="mt-2 h-2 w-full bg-white/[0.03]" />
            <SkeletonBar className="mt-1.5 h-2 w-2/3 bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function JournalPlaceholder() {
  return <ListPlaceholder title="Journal" />;
}

export function RecentNotesPlaceholder() {
  return <ListPlaceholder title="Recent notes" />;
}

export function PriorityGoalsPlaceholder() {
  return <ListPlaceholder title="Priority goals" />;
}

function makeStatPlaceholder(key: string) {
  return function StatPlaceholder() {
    return <StatPlaceholderBox widgetKey={key} />;
  };
}

// Every widget key EXCEPT "account_statistics" — that one needs live drag
// state passed in, so it's rendered directly by DashboardBuilder instead.
export const WIDGET_PLACEHOLDERS: Record<string, () => JSX.Element> = {
  hero_best_streak: makeStatPlaceholder("hero_best_streak"),
  hero_profile_views: makeStatPlaceholder("hero_profile_views"),
  hero_momentum: makeStatPlaceholder("hero_momentum"),
  hero_active_goals: makeStatPlaceholder("hero_active_goals"),
  manage_account: ManageAccountPlaceholder,
  achievements: AchievementsPlaceholder,
  todays_streaks: TodaysStreaksPlaceholder,
  journal_preview: JournalPlaceholder,
  recent_notes: RecentNotesPlaceholder,
  priority_goals: PriorityGoalsPlaceholder,
};
