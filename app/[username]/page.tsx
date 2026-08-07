import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { TrackedLink } from "@/components/profile/TrackedLink";
import { AudioPlayer } from "@/components/profile/AudioPlayer";
import { LikeButton } from "@/components/profile/LikeButton";
import { CursorTrail } from "@/components/customizer2/CursorTrail";
import { BackgroundEffectOverlay, ProfileEffectOverlay } from "@/components/customizer2/EffectOverlays";
import { FRAME_PRESETS, mergeCustomizer2Settings } from "@/lib/customizer-presets";
import { cn } from "@/lib/utils";
import type { Profile, ProfileLink, PublicStats } from "@/lib/types";

export const dynamic = "force-dynamic";

function detectDevice(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobi|android|iphone/i.test(ua)) return "Mobile";
  return "Desktop";
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const username = params.username.toLowerCase();
  if (isReservedUsername(username)) {
    notFound();
  }

  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // Awaited (not truly fire-and-forget) because a serverless function can
  // terminate the moment the response is sent — an un-awaited call here
  // would sometimes just never run.
  const headerList = headers();
  const country = headerList.get("x-vercel-ip-country");
  const device = detectDevice(headerList.get("user-agent"));
  await supabase.rpc("increment_profile_view", {
    p_username: username,
    p_country: country,
    p_device: device,
  });

  const p = profile as Profile;
  const links = Array.isArray(p.links) ? (p.links as ProfileLink[]) : [];

  let stats: PublicStats | null = null;
  if (p.show_stats) {
    const { data: statsData } = await supabase.rpc("get_public_stats", { p_username: username });
    stats = (statsData as PublicStats | null) ?? null;
  }

  const initial = (p.display_name || p.username).trim().charAt(0).toUpperCase() || "?";

  // Customizer 2 is opt-in: if the person has never saved anything there,
  // this stays null and the page renders exactly as it always has.
  const hasC2 = !!p.customizer2_settings;
  const c2 = mergeCustomizer2Settings(p.customizer2_settings);

  const effectiveAvatar = (hasC2 && c2.avatarUrl) || p.avatar_url;
  const effectiveBackground = (hasC2 && c2.backgroundUrl) || p.background_url;
  const effectiveLocation = (hasC2 && c2.location) || p.location;
  const effectiveDescription = (hasC2 && c2.description) || p.bio;

  const frame = hasC2 ? FRAME_PRESETS.find((f) => f.key === c2.frame) ?? FRAME_PRESETS[0] : FRAME_PRESETS[0];
  const isSpinFrame = hasC2 && frame.key === "spin";

  const nameGlow = hasC2 && c2.glow.username ? { textShadow: `0 0 14px ${c2.colors.accent}` } : undefined;
  const linksGlow = hasC2 && c2.glow.socials ? { textShadow: `0 0 14px ${c2.colors.accent}` } : undefined;

  const animatedTitle = hasC2 && c2.toggles.animatedTitle;
  const useCornerStats = hasC2 && c2.toggles.statsCorner;

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={hasC2 ? { backgroundColor: c2.colors.background } : undefined}
    >
      {hasC2 && c2.cursorEffect !== "none" && <CursorTrail effect={c2.cursorEffect} color={c2.colors.accent} />}

      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      {hasC2 && c2.backgroundEffect !== "none" && (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <BackgroundEffectOverlay effect={c2.backgroundEffect} color={c2.colors.backgroundEffect} />
        </div>
      )}

      {/* Custom background banner — only renders if a background image is set */}
      {effectiveBackground && (
        <div className="absolute inset-x-0 top-0 z-0 h-56 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${effectiveBackground})`,
              filter: hasC2 && c2.blur > 0 ? `blur(${c2.blur}px)` : undefined,
              transform: hasC2 && c2.blur > 0 ? "scale(1.15)" : undefined,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-ink-950" />
        </div>
      )}

      <div
        className={cn(
          "relative z-10 mx-auto max-w-md px-6 pb-16 sm:pt-24",
          effectiveBackground ? "pt-32" : "pt-16"
        )}
        style={hasC2 ? { opacity: c2.opacity / 100 } : undefined}
      >
        {/* Avatar + identity */}
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              "relative h-20 w-20 animate-fade-up rounded-full",
              hasC2 && !isSpinFrame && frame.className
            )}
          >
            {isSpinFrame && (
              <div
                className="absolute inset-0 animate-spin-slow rounded-full"
                style={{ background: `conic-gradient(${c2.colors.primary}, ${c2.colors.secondary}, ${c2.colors.primary})` }}
              />
            )}
            <div
              className={cn(
                "absolute overflow-hidden rounded-full",
                isSpinFrame ? "inset-[3px]" : "inset-0",
                effectiveBackground ? "ring-4 ring-ink-950" : "ring-2 ring-white/10"
              )}
            >
              {effectiveAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={effectiveAvatar}
                  alt={p.display_name || p.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 text-2xl font-semibold text-white shadow-glow">
                  {initial}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            {animatedTitle ? (
              <h1
                className="bg-clip-text text-xl font-semibold text-transparent"
                style={{
                  animation: "fade-up 0.5s ease-out 0.08s both, shimmer 3s linear infinite",
                  backgroundImage: `linear-gradient(90deg, ${c2.colors.primary}, ${c2.colors.secondary}, ${c2.colors.primary})`,
                  backgroundSize: "200% 100%",
                }}
              >
                {p.display_name || p.username}
              </h1>
            ) : (
              <h1
                className="animate-fade-up text-xl font-semibold text-white"
                style={{ animationDelay: "0.08s", color: hasC2 ? c2.colors.name : undefined, ...nameGlow }}
              >
                {p.display_name || p.username}
              </h1>
            )}
            {p.plan === "pro" && (
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-[9px] font-bold text-white shadow-[0_0_8px_1px_rgba(139,92,246,0.6)]"
                title="Pro member"
              >
                ✓
              </span>
            )}
          </div>

          <p
            className="animate-fade-up font-mono text-xs text-zinc-500"
            style={{ animationDelay: "0.14s", color: hasC2 ? c2.colors.uid : undefined }}
          >
            @{p.username}
          </p>

          {effectiveLocation && !useCornerStats && (
            <p
              className="mt-1 flex animate-fade-up items-center gap-1 text-xs text-zinc-500"
              style={{ animationDelay: "0.18s", color: hasC2 ? c2.colors.location : undefined }}
            >
              <span>📍</span>
              {effectiveLocation}
            </p>
          )}
          {effectiveDescription && (
            <p
              className="mt-3 max-w-sm animate-fade-up text-sm leading-relaxed text-zinc-400"
              style={{ animationDelay: "0.22s", color: hasC2 ? c2.colors.description : undefined }}
            >
              {effectiveDescription}
            </p>
          )}
        </div>

        {/* Public stats (opt-in) */}
        {stats && (
          <div className="mt-8 grid animate-fade-up grid-cols-4 gap-2" style={{ animationDelay: "0.28s" }}>
            <StatChip label="goals done" value={stats.goals_completed} />
            <StatChip label="active goals" value={stats.active_goals} />
            <StatChip label="streaks" value={stats.active_streaks} />
            <StatChip label="check-ins" value={stats.total_check_ins} />
          </div>
        )}

        {/* Links */}
        <div className="relative mt-8 space-y-3" style={linksGlow}>
          {links.length === 0 ? (
            <p className="text-center text-sm text-zinc-600">No links yet.</p>
          ) : (
            links.map((link, i) => (
              <TrackedLink
                key={`${link.url}-${i}`}
                username={username}
                label={link.label}
                url={link.url}
                className="glass glass-hover flex animate-fade-up items-center justify-center rounded-xl px-5 py-3.5 text-sm font-medium text-zinc-200 transition"
                style={{ animationDelay: `${0.32 + i * 0.05}s` }}
              >
                {link.label}
              </TrackedLink>
            ))
          )}

          {hasC2 && c2.profileEffect !== "none" && links.length > 0 && (
            <ProfileEffectOverlay effect={c2.profileEffect} color={c2.colors.accent} />
          )}
        </div>

        {/* Footer / growth loop */}
        <footer className="mt-16 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <Link href="/" className="font-mono transition hover:text-violet-400">
            made with NOCTURNE
          </Link>
        </footer>
      </div>

      {hasC2 && c2.audioUrl && (
        <AudioPlayer src={c2.audioUrl} autoplay={c2.audioAutoplay} showVolumeSlider={c2.toggles.volumeControl} />
      )}

      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1.5 text-[11px] text-zinc-400 backdrop-blur">
        {useCornerStats && (
          <>
            <span className="flex items-center gap-1" title="Views">
              <span>👁</span>
              {p.view_count.toLocaleString()}
            </span>
            {effectiveLocation && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1" title="Location">
                  <span>📍</span>
                  {effectiveLocation}
                </span>
              </>
            )}
            <span className="text-zinc-700">·</span>
          </>
        )}
        <LikeButton username={username} />
      </div>
    </main>
  );
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-lg px-2 py-3 text-center">
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
    </div>
  );
}
