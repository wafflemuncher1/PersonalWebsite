// Catalog of components that can be dragged onto Dashboard 2 via the
// Dashboard Builder. Keep this in sync with the WIDGET_COMPONENTS registry
// in components/dashboard/widgets/registry.tsx and the static placeholder
// registry in components/dashboard/widgets/placeholders.tsx.

import type { Dashboard2Layout } from "@/lib/types";

export type WidgetSpan = "quarter" | "half" | "full";

export type WidgetDef = {
  key: string;
  label: string;
  icon: string;
  group: "Stats" | "Overview" | "Activity";
  span: WidgetSpan;
};

export const WIDGET_DEFS: WidgetDef[] = [
  { key: "hero_best_streak", label: "Best Streak", icon: "🔥", group: "Stats", span: "quarter" },
  { key: "hero_profile_views", label: "Profile Views", icon: "👁", group: "Stats", span: "quarter" },
  { key: "hero_momentum", label: "Momentum", icon: "⚡", group: "Stats", span: "quarter" },
  { key: "hero_active_goals", label: "Active Goals", icon: "◎", group: "Stats", span: "quarter" },
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

export const DEFAULT_DASHBOARD2_LAYOUT: Dashboard2Layout = {
  layout: DEFAULT_LAYOUT,
  accountStats: [],
};

export const SPAN_CLASS: Record<WidgetSpan, string> = {
  quarter: "col-span-2 md:col-span-1",
  half: "col-span-2 md:col-span-2",
  full: "col-span-2 md:col-span-4",
};

export function isWidgetKey(key: string): boolean {
  return key in WIDGET_BY_KEY;
}

// The 4 "Stats" widgets can either stand alone on the canvas as their own
// box, or be nested inside the Account Statistics widget.
export const STAT_KEYS: string[] = WIDGET_DEFS.filter((w) => w.group === "Stats").map((w) => w.key);

export function isStatKey(key: string): boolean {
  return STAT_KEYS.includes(key);
}

// Normalizes whatever is in profiles.dashboard2_layout (null, a legacy plain
// array from an earlier prototype, or the current {layout, accountStats}
// shape) into a safe, well-formed Dashboard2Layout.
export function normalizeDashboard2Layout(raw: unknown): Dashboard2Layout {
  if (Array.isArray(raw)) {
    // legacy shape: a bare array of widget keys
    return { layout: raw.filter((k): k is string => typeof k === "string" && isWidgetKey(k)), accountStats: [] };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Partial<Dashboard2Layout>;
    const layout = Array.isArray(obj.layout) ? obj.layout.filter((k) => isWidgetKey(k)) : DEFAULT_LAYOUT;
    const accountStats = Array.isArray(obj.accountStats) ? obj.accountStats.filter((k) => isStatKey(k)) : [];
    return { layout, accountStats };
  }
  return DEFAULT_DASHBOARD2_LAYOUT;
}
