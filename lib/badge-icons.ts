import { Sprout, type LucideIcon } from "lucide-react";

// badge_defs.icon stores a key into this map rather than a component
// reference (can't store a component in Postgres) — add new badges' icons
// here as they're introduced.
const BADGE_ICONS: Record<string, LucideIcon> = {
  Sprout,
};

export function badgeIcon(icon: string): LucideIcon {
  return BADGE_ICONS[icon] ?? Sprout;
}
