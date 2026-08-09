"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { badgeIcon } from "@/lib/badge-icons";

export type EquippedBadge = {
  key: string;
  name: string;
  icon: string;
  color: string | null;
  size: number;
  glow_enabled: boolean;
  glow_strength: number;
  glow_color: string;
};

// One shared rounded box holds the whole row of badges (guns.lol-style),
// rather than each badge getting its own separate pill.
export function ProfileBadges({ badges, className }: { badges: EquippedBadge[]; className?: string }) {
  if (!badges.length) return null;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur ${className ?? ""}`}
    >
      {badges.map((b) => (
        <BadgeIcon key={b.key} badge={b} />
      ))}
    </div>
  );
}

function BadgeIcon({ badge }: { badge: EquippedBadge }) {
  const [hovered, setHovered] = useState(false);
  const Icon = badgeIcon(badge.icon);
  const color = badge.color || "#e4e4e7";
  const glowFilter = badge.glow_enabled
    ? `drop-shadow(0 0 ${3 + (badge.glow_strength / 100) * 6}px ${badge.glow_color}) drop-shadow(0 0 ${8 + (badge.glow_strength / 100) * 16}px ${badge.glow_color})`
    : undefined;

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Icon size={badge.size} color={color} style={{ filter: glowFilter }} />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px] text-white backdrop-blur"
          >
            {badge.name}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
