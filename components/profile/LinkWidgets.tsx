"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa6";
import { PLATFORMS, type Platform } from "@/lib/link-validation";
import { TrackedLink } from "@/components/profile/TrackedLink";
import type { ProfileLinkItem } from "@/lib/types";

const PLATFORM_ICONS: Record<Platform, IconType> = {
  youtube: FaYoutube,
  tiktok: FaTiktok,
  instagram: FaInstagram,
  facebook: FaFacebook,
};

// Matches guns.lol's look: bare icon glyphs sitting directly on the card
// with a soft glow, tightly spaced in a row — no background pill/box around
// each one like a typical Linktree button.
export function LinkWidgets({
  links,
  size,
  username,
}: {
  links: ProfileLinkItem[];
  size: number;
  username: string;
}) {
  if (!links.length) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-5">
      {links.map((link) => (
        <LinkWidget key={link.id} link={link} size={size} username={username} />
      ))}
    </div>
  );
}

function LinkWidget({ link, size, username }: { link: ProfileLinkItem; size: number; username: string }) {
  const [hovered, setHovered] = useState(false);
  const Icon = PLATFORM_ICONS[link.platform];
  const label = PLATFORMS[link.platform].label;
  const color = link.is_custom_logo && link.custom_color ? link.custom_color : PLATFORMS[link.platform].brandColor;

  // Every icon gets a faint ambient glow like the reference shots, even
  // without the per-link glow toggle on; enabling it layers a stronger,
  // colored glow on top instead of replacing the ambient one.
  const glowFilter = link.glow_enabled
    ? `drop-shadow(0 0 ${3 + (link.glow_strength / 100) * 5}px ${link.glow_color}) drop-shadow(0 0 ${8 + (link.glow_strength / 100) * 18}px ${link.glow_color})`
    : "drop-shadow(0 0 6px rgba(255,255,255,0.2))";

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TrackedLink
        username={username}
        label={label}
        url={link.url}
        className="flex items-center justify-center transition hover:scale-110"
        style={{ width: size, height: size }}
      >
        {link.is_custom_logo && link.custom_icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.custom_icon_url}
            alt={label}
            className="h-full w-full rounded-full object-cover"
            style={{ filter: glowFilter }}
          />
        ) : (
          <Icon size={size} color={color} style={{ filter: glowFilter }} />
        )}
      </TrackedLink>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px] text-white backdrop-blur"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
