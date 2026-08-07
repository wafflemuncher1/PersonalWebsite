import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { cn } from "@/lib/utils";
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

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={mainStyle}>
      <div
        className={cn(
          "w-full max-w-sm rounded-2xl border p-8 shadow-xl",
          isSide ? "flex items-center gap-5" : "flex flex-col items-center text-center"
        )}
        style={{
          backgroundColor: p.card_color,
          borderColor: p.card_border_color,
          opacity: p.card_opacity / 100,
        }}
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-black/5">
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
          {p.name_animated ? (
            <AnimatedName text={name} className="text-xl font-semibold" style={{ color: p.name_color }} />
          ) : (
            <h1 className="text-xl font-semibold" style={{ color: p.name_color }}>
              {name}
            </h1>
          )}
          <p className="font-mono text-xs text-zinc-500">@{p.username}</p>
        </div>
      </div>
    </main>
  );
}
