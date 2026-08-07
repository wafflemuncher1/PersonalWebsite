import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { cn, hexToRgba } from "@/lib/utils";
import { AnimatedName } from "@/components/profile/AnimatedName";
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
      : { backgroundColor: p.bg_color };

  const showLocationOnCard = p.show_location && p.location_position === "card" && p.location;
  const showLocationCorner =
    p.show_location && p.location_position !== "card" && p.location;

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={mainStyle}>
      <div
        className={cn(
          "w-full max-w-xl rounded-2xl border p-10 shadow-xl",
          isSide ? "flex items-center gap-6" : "flex flex-col items-center text-center"
        )}
        style={{
          backgroundColor: hexToRgba(p.card_color, p.card_opacity),
          borderColor: p.card_border_color,
        }}
      >
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-black/5">
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
          {p.name_animation === "typewriter" ? (
            <AnimatedName text={name} className="text-xl font-semibold" style={{ color: p.name_color }} />
          ) : (
            <h1 className="text-xl font-semibold" style={{ color: p.name_color }}>
              {name}
            </h1>
          )}
          <p className="font-mono text-xs text-zinc-500">@{p.username}</p>
          {showLocationOnCard && (
            <p className={cn("mt-1.5 flex items-center gap-1 text-xs text-zinc-500", isSide ? "" : "justify-center")}>
              <span>📍</span>
              {p.location}
            </p>
          )}
        </div>
      </div>

      {showLocationCorner && (
        <div
          className={cn(
            "fixed bottom-4 z-40 flex items-center gap-1 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur",
            p.location_position === "bottom-left" ? "left-4" : "right-4"
          )}
        >
          <span>📍</span>
          {p.location}
        </div>
      )}
    </main>
  );
}
