// Catalog of components that can be dragged onto Dashboard 2 via the
// Dashboard Builder. Keep this in sync with the WIDGET_COMPONENTS registry
// in components/dashboard/widgets/registry.tsx.

export type WidgetSpan = "quarter" | "half" | "full";

export type WidgetDef = {
  key: string;
  label: string;
  icon: string;
  group: "Hero stats" | "Overview" | "Activity";
  span: WidgetSpan;
};

export const WIDGET_DEFS: WidgetDef[] = [
  { key: "hero_best_streak", label: "Best Streak", icon: "🔥", group: "Hero stats", span: "quarter" },
  { key: "hero_profile_views", label: "Profile Views", icon: "👁", group: "Hero stats", span: "quarter" },
  { key: "hero_momentum", label: "Momentum", icon: "⚡", group: "Hero stats", span: "quarter" },
  { key: "hero_active_goals", label: "Active Goals", icon: "◎", group: "Hero stats", span: "quarter" },
  { key: "account_statistics", label: "Account Statistics", icon: "📋", group: "Overview", span: "half" },
  { key: "manage_account", label: "Manage Account", icon: "⚙", group: "Overview", span: "half" },
  { key: "achievements", label: "Achievements", icon: "🏆", group: "Overview", span: "full" },
  { key: "todays_streaks", label: "Today's Streaks", icon: "🔥", group: "Activity", span: "half" },
  { key: "journal_preview", label: "Journal", icon: "📓", group: "Activity", span: "half" },
  { key: "recent_notes", label: "Recent Notes", icon: "✎", group: "Activity", span: "half" },
  { key: "priority_goals", label: "Priority Goals", icon: "◎", group: "Activity", span: "half" },
];

export type WidgetKey = (typeof WIDGET_DEFS)[number]["key"];

export const WIDGET_BY_KEY: Record<string, WidgetDef> = Object.fromEntries(
  WIDGET_DEFS.map((w) => [w.key, w])
);

export const DEFAULT_LAYOUT: string[] = WIDGET_DEFS.map((w) => w.key);

export const SPAN_CLASS: Record<WidgetSpan, string> = {
  quarter: "col-span-2 md:col-span-1",
  half: "col-span-2 md:col-span-2",
  full: "col-span-2 md:col-span-4",
};

export function isWidgetKey(key: string): boolean {
  return key in WIDGET_BY_KEY;
}
