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
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
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
  const glowShadow = link.glow_enabled
    ? `0 0 ${4 + (link.glow_strength / 100) * 16}px ${link.glow_color}, 0 0 ${10 + (link.glow_strength / 100) * 36}px ${link.glow_color}`
    : undefined;

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
        className="flex items-center justify-center overflow-hidden rounded-full bg-white/5 transition hover:scale-105"
        style={{ width: size, height: size, boxShadow: glowShadow }}
      >
        {link.is_custom_logo && link.custom_icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.custom_icon_url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <Icon size={size * 0.5} color={color} />
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
