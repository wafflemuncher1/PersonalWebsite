"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FRAME_PRESETS } from "@/lib/customizer-presets";
import { BackgroundEffectOverlay, ProfileEffectOverlay } from "@/components/customizer2/EffectOverlays";
import { CursorTrail } from "@/components/customizer2/CursorTrail";
import type { Customizer2Settings } from "@/lib/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function LivePreview({
  settings,
  displayName,
  username,
}: {
  settings: Customizer2Settings;
  displayName: string;
  username: string;
}) {
  const frame = FRAME_PRESETS.find((f) => f.key === settings.frame) ?? FRAME_PRESETS[0];
  const isSpinFrame = frame.key === "spin";
  const glowShadow = { textShadow: `0 0 12px ${settings.colors.accent}` };
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sticky top-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Live Preview</p>
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-glow"
        style={{
          opacity: settings.opacity / 100,
          backgroundColor: settings.colors.background,
          color: settings.colors.text,
          cursor: settings.cursorUrl ? `url(${settings.cursorUrl}), auto` : undefined,
        }}
      >
        <CursorTrail effect={settings.cursorEffect} color={settings.colors.accent} containerRef={cardRef} />
        {settings.backgroundUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${settings.backgroundUrl})`,
              filter: settings.blur > 0 ? `blur(${settings.blur}px)` : undefined,
              transform: settings.blur > 0 ? "scale(1.15)" : undefined,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />

        <BackgroundEffectOverlay effect={settings.backgroundEffect} color={settings.colors.backgroundEffect} />

        <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4, delay: 0.05 }}
            className={cn("relative h-20 w-20 rounded-full", !isSpinFrame && frame.className)}
          >
            {isSpinFrame && (
              <div
                className="absolute inset-0 animate-spin-slow rounded-full"
                style={{
                  background: `conic-gradient(${settings.colors.primary}, ${settings.colors.secondary}, ${settings.colors.primary})`,
                }}
              />
            )}
            <div
              className={cn(
                "absolute overflow-hidden rounded-full bg-white/10",
                isSpinFrame ? "inset-[3px]" : "inset-0"
              )}
            >
              {settings.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">
                  {(displayName || username || "?").trim().charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 text-lg font-semibold"
            style={{ color: settings.colors.name, ...(settings.glow.username ? glowShadow : {}) }}
          >
            {displayName || username || "Your Name"}
          </motion.p>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4, delay: 0.14 }}
            className="text-xs"
            style={{ color: settings.colors.uid }}
          >
            @{username || "username"}
          </motion.p>

          {settings.location && !settings.toggles.statsCorner && (
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.4, delay: 0.18 }}
              className="mt-1 text-xs"
              style={{ color: settings.colors.location }}
            >
              📍 {settings.location}
            </motion.p>
          )}
          {settings.description && (
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.4, delay: 0.22 }}
              className="mt-3 max-w-xs text-sm leading-relaxed"
              style={{ color: settings.colors.description }}
            >
              {settings.description}
            </motion.p>
          )}
          {settings.audioUrl && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] opacity-70">
              <span>🎵</span> Audio track added
            </p>
          )}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4, delay: 0.28 }}
            className="mt-5 flex gap-2"
            style={settings.glow.socials ? glowShadow : undefined}
          >
            {["🔗", "🎮", "🐦"].map((icon, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm"
              >
                {icon}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mt-3 flex gap-1.5"
            style={settings.glow.badges ? glowShadow : undefined}
          >
            {["🏅", "⭐"].map((icon, i) => (
              <span key={i} className="text-base">
                {icon}
              </span>
            ))}
          </motion.div>
        </div>

        <ProfileEffectOverlay effect={settings.profileEffect} color={settings.colors.accent} />

        {settings.toggles.statsCorner && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] text-zinc-400 backdrop-blur">
            <span className="flex items-center gap-1" title="Views">
              <span>👁</span> 1,204
            </span>
            {settings.location && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1" title="Location">
                  <span>📍</span> {settings.location}
                </span>
              </>
            )}
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-1" title="Likes are live on your real profile">
              <span>🤍</span> 42
            </span>
          </div>
        )}
      </motion.div>
      <p className="mt-2 text-center text-[10px] text-zinc-600">
        Preview only — this test page doesn&apos;t change your real public profile.
      </p>
    </div>
  );
}
