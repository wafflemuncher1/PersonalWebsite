"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { badgeIcon } from "@/lib/badge-icons";

export type EquippedBadge = { key: string; name: string; icon: string };

export function ProfileBadges({ badges, className }: { badges: EquippedBadge[]; className?: string }) {
  if (!badges.length) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {badges.map((b) => (
        <BadgeIcon key={b.key} badge={b} />
      ))}
    </div>
  );
}

function BadgeIcon({ badge }: { badge: EquippedBadge }) {
  const [hovered, setHovered] = useState(false);
  const Icon = badgeIcon(badge.icon);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/5 text-violet-300">
        <Icon className="h-3.5 w-3.5" />
      </div>

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
