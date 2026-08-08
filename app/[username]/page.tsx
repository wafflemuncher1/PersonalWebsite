import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { Eye, MapPin } from "lucide-react";
import { cn, hexToRgba } from "@/lib/utils";
import { AnimatedName } from "@/components/profile/AnimatedName";
import { GsapNameAnimation } from "@/components/profile/GsapNameAnimation";
import { NameHover } from "@/components/profile/NameHover";
import { InteractiveCard } from "@/components/profile/InteractiveCard";
import { CursorTrail } from "@/components/customizer2/CursorTrail";
import type { Profile } from "@/lib/types";

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
  const initial = (p.display_name || p.username).trim().charAt(0).toUpperCase() || "?";
  const isSide = p.layout === "side";
  const name = p.display_name || p.username;

  const mainStyle =
    p.bg_type === "gradient"
      ? { backgroundImage: `linear-gradient(135deg, ${p.bg_color}, ${p.bg_color_2})` }
      : p.bg_type === "image" && p.background_url
        ? {
            backgroundColor: p.bg_color,
            backgroundImage: `url(${p.background_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: p.bg_color };

  const showLocationOnCard = p.show_location && p.location_position === "card" && p.location;
  const showLocationCorner =
    p.show_location && p.location_position !== "card" && p.location;

  const nameStyle: React.CSSProperties = {
    color: p.name_color,
    fontSize: `${p.name_font_size}px`,
    fontWeight: p.name_bold ? 700 : 400,
    fontStyle: p.name_italic ? "italic" : "normal",
  };
  const descriptionStyle: React.CSSProperties = {
    fontSize: `${p.description_font_size}px`,
    fontWeight: p.description_bold ? 700 : 400,
    fontStyle: p.description_italic ? "italic" : "normal",
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6" style={mainStyle}>
      {p.bg_type === "video" && p.background_video_url && (
        <video
          className="fixed inset-0 z-0 h-full w-full object-cover"
          src={p.background_video_url}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {p.cursor_animation !== "none" && <CursorTrail effect={p.cursor_animation} color={p.cursor_color} />}

      <InteractiveCard
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-2xl p-11 shadow-xl",
          isSide ? "flex items-center gap-6" : "flex flex-col items-center text-center"
        )}
        style={{
          backgroundColor: hexToRgba(p.card_color, p.card_opacity),
          border: p.card_outline_enabled
            ? `${p.card_outline_width}px solid ${p.card_border_color}`
            : "none",
        }}
      >
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full ring-2 ring-black/5">
          {p.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.avatar_url}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 text-2xl font-semibold text-white">
              {initial}
            </div>
          )}
        </div>

        <div className={isSide ? "" : "mt-4"}>
          <NameHover username={p.username}>
            {p.name_animation === "typewriter" ? (
              <AnimatedName text={name} style={nameStyle} />
            ) : p.name_animation === "scramble" || p.name_animation === "wave" ? (
              <GsapNameAnimation text={name} variant={p.name_animation} style={nameStyle} />
            ) : (
              <h1 style={nameStyle}>{name}</h1>
            )}
          </NameHover>
          {p.bio && (
            <p
              className={cn("mt-1.5 max-w-sm text-zinc-500", isSide ? "" : "mx-auto")}
              style={descriptionStyle}
            >
              {p.bio}
            </p>
          )}
        </div>

        {showLocationOnCard && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-zinc-300 backdrop-blur">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {p.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {p.location}
            </span>
          </div>
        )}
      </InteractiveCard>

      {showLocationCorner && (
        <div
          className={cn(
            "fixed bottom-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur",
            p.location_position === "bottom-left" ? "left-4" : "right-4"
          )}
        >
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {p.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {p.location}
          </span>
        </div>
      )}
    </main>
  );
}
