"use client";

import { cn } from "@/lib/utils";
import { FRAME_PRESETS } from "@/lib/customizer-presets";
import { BackgroundEffectOverlay, ProfileEffectOverlay } from "@/components/customizer2/EffectOverlays";
import type { Customizer2Settings } from "@/lib/types";

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

  return (
    <div className="sticky top-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Live Preview</p>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-glow"
        style={{
          opacity: settings.opacity / 100,
          backgroundColor: settings.colors.background,
          color: settings.colors.text,
          cursor: settings.cursorUrl ? `url(${settings.cursorUrl}), auto` : undefined,
        }}
      >
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
          <div className={cn("relative h-20 w-20 rounded-full", !isSpinFrame && frame.className)}>
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
          </div>

          <p className="mt-4 text-lg font-semibold" style={settings.glow.username ? glowShadow : undefined}>
            {displayName || username || "Your Name"}
          </p>
          <p className="text-xs opacity-70">@{username || "username"}</p>

          {settings.location && <p className="mt-1 text-xs opacity-60">📍 {settings.location}</p>}
          {settings.description && (
            <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-80">{settings.description}</p>
          )}

          <div className="mt-5 flex gap-2" style={settings.glow.socials ? glowShadow : undefined}>
            {["🔗", "🎮", "🐦"].map((icon, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm"
              >
                {icon}
              </span>
            ))}
          </div>

          <div className="mt-3 flex gap-1.5" style={settings.glow.badges ? glowShadow : undefined}>
            {["🏅", "⭐"].map((icon, i) => (
              <span key={i} className="text-base">
                {icon}
              </span>
            ))}
          </div>
        </div>

        <ProfileEffectOverlay effect={settings.profileEffect} color={settings.colors.accent} />
      </div>
      <p className="mt-2 text-center text-[10px] text-zinc-600">
        Preview only — this test page doesn&apos;t change your real public profile.
      </p>
    </div>
  );
}
