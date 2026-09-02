import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { Eye, MapPin } from "lucide-react";
import { cn, hexToRgba } from "@/lib/utils";
import { fontClassName } from "@/lib/fonts";
import { AnimatedName } from "@/components/profile/AnimatedName";
import { GsapNameAnimation } from "@/components/profile/GsapNameAnimation";
import { NameHover } from "@/components/profile/NameHover";
import { InteractiveCard } from "@/components/profile/InteractiveCard";
import { ProfileEffectRing } from "@/components/profile/ProfileEffectRing";
import { LinkWidgets } from "@/components/profile/LinkWidgets";
import { ProfileExperience } from "@/components/profile/ProfileExperience";
import { ProfileBadges, type EquippedBadge } from "@/components/profile/ProfileBadges";
import { CursorTrail } from "@/components/shared/CursorTrail";
import type { BadgeDef, Profile, ProfileLinkItem, ShopItem, Streak } from "@/lib/types";

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

  if (!profile || (profile as Profile).is_banned) {
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

  const { data: linkRows } = await supabase
    .from("profile_links")
    .select("*")
    .eq("profile_id", p.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const links = (linkRows as ProfileLinkItem[]) ?? [];

  const { data: shopRows } = await supabase
    .from("profile_shop_items")
    .select("*")
    .eq("profile_id", p.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const shopItems = (shopRows as ShopItem[]) ?? [];

  const { data: featuredStreakRows } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", p.id)
    .eq("show_on_profile", true)
    .eq("archived", false)
    .order("created_at", { ascending: true });
  const featuredStreakMeta = (featuredStreakRows as Streak[]) ?? [];
  const featuredStreaks = await Promise.all(
    featuredStreakMeta.map(async (s) => {
      const { data: dates } = await supabase.rpc("get_public_streak_log_dates", { p_streak_id: s.id });
      return { streak: s, dates: (dates as string[]) ?? [] };
    })
  );

  let journalDates: string[] = [];
  if (p.journal_heatmap_enabled) {
    const { data } = await supabase.rpc("get_public_journal_dates", { p_username: username });
    journalDates = (data as string[]) ?? [];
  }

  const { data: badgeRows } = await supabase
    .from("profile_badges")
    .select("badge_key, sort_order, color, size, glow_enabled, glow_strength, glow_color")
    .eq("profile_id", p.id)
    .eq("equipped", true)
    .order("sort_order", { ascending: true })
    .limit(5);

  let equippedBadges: EquippedBadge[] = [];
  if (badgeRows && badgeRows.length > 0) {
    const keys = badgeRows.map((r) => r.badge_key);
    const { data: defRows } = await supabase.from("badge_defs").select("key, name, icon").in("key", keys);
    const defMap = new Map((defRows as Pick<BadgeDef, "key" | "name" | "icon">[] | null ?? []).map((d) => [d.key, d]));
    equippedBadges = badgeRows
      .map((r) => {
        const def = defMap.get(r.badge_key);
        if (!def) return null;
        return {
          key: def.key,
          name: def.name,
          icon: def.icon,
          color: r.color,
          size: r.size,
          glow_enabled: r.glow_enabled,
          glow_strength: r.glow_strength,
          glow_color: r.glow_color,
        };
      })
      .filter((b): b is EquippedBadge => !!b);
  }

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

  const glowStrength = p.name_glow_strength / 100;
  // Multiple stacked shadows read as an actual neon bloom — a single
  // 2-layer shadow (the old approach) stays washed-out looking even at max
  // blur, since browsers don't intensify a single shadow's opacity with size.
  const nameGlowShadow = p.name_glow_enabled
    ? [
        `0 0 ${4 + glowStrength * 16}px ${p.name_glow_color}`,
        `0 0 ${10 + glowStrength * 40}px ${p.name_glow_color}`,
        `0 0 ${20 + glowStrength * 80}px ${p.name_glow_color}`,
        `0 0 ${40 + glowStrength * 160}px ${p.name_glow_color}`,
        `0 0 ${60 + glowStrength * 220}px ${p.name_glow_color}`,
      ].join(", ")
    : undefined;
  const nameStyle: React.CSSProperties = {
    color: p.name_color,
    fontSize: `${p.name_font_size}px`,
    fontWeight: p.name_bold ? 700 : 400,
    fontStyle: p.name_italic ? "italic" : "normal",
    textShadow: nameGlowShadow,
  };
  const descriptionStyle: React.CSSProperties = {
    fontSize: `${p.description_font_size}px`,
    fontWeight: p.description_bold ? 700 : 400,
    fontStyle: p.description_italic ? "italic" : "normal",
    color: p.description_color,
  };

  const aboutGlowStrength = p.about_glow_strength / 100;
  const aboutGlowShadow = p.about_glow_enabled
    ? [
        `0 0 ${4 + aboutGlowStrength * 16}px ${p.about_glow_color}`,
        `0 0 ${10 + aboutGlowStrength * 40}px ${p.about_glow_color}`,
        `0 0 ${20 + aboutGlowStrength * 80}px ${p.about_glow_color}`,
      ].join(", ")
    : undefined;
  const aboutTextStyle: React.CSSProperties = {
    color: p.about_text_color,
    fontSize: `${p.about_text_font_size}px`,
    fontWeight: p.about_text_bold ? 700 : 400,
    textShadow: aboutGlowShadow,
  };
  const aboutFontClass = fontClassName(p.about_text_font);
  const aboutBoxStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(p.about_box_color, p.about_box_opacity),
    border: p.about_box_outline_enabled ? `${p.about_box_outline_width}px solid ${p.about_box_border_color}` : "none",
  };
  const secondaryBoxStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(p.secondary_box_color, p.secondary_box_opacity),
    border: p.secondary_box_outline_enabled
      ? `${p.secondary_box_outline_width}px solid ${p.secondary_box_border_color}`
      : "none",
  };

  const shopFontClass = fontClassName(p.shop_text_font);
  const shopBoxStyle: React.CSSProperties = {
    backgroundColor: hexToRgba(p.shop_box_color, p.shop_box_opacity),
    border: p.shop_box_outline_enabled ? `${p.shop_box_outline_width}px solid ${p.shop_box_border_color}` : "none",
  };
  const shopNameStyle: React.CSSProperties = { color: p.shop_name_color };
  const shopDescStyle: React.CSSProperties = { color: p.shop_desc_color };

  const nameFontClass = fontClassName(p.name_font);
  const nameElement = (
    <NameHover username={p.username}>
      {p.name_animation === "typewriter" ? (
        <AnimatedName text={name} className={nameFontClass} style={nameStyle} />
      ) : p.name_animation === "scramble" || p.name_animation === "wave" || p.name_animation === "bounce" ? (
        <GsapNameAnimation text={name} variant={p.name_animation} className={nameFontClass} style={nameStyle} />
      ) : p.name_animation === "shimmer" ? (
        <h1
          className={cn("name-shimmer", nameFontClass)}
          style={{
            ...nameStyle,
            color: "transparent",
            backgroundImage: `linear-gradient(90deg, ${p.name_color}, #ffffff, ${p.name_color})`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {name}
        </h1>
      ) : p.name_animation === "glitch" ? (
        <h1 className={cn("name-glitch", nameFontClass)} style={nameStyle}>
          {name}
        </h1>
      ) : (
        <h1 className={nameFontClass} style={nameStyle}>
          {name}
        </h1>
      )}
    </NameHover>
  );

  const descriptionFontClass = fontClassName(p.description_font);
  const descriptionClassName = cn("mt-1.5 max-w-sm", isSide ? "" : "mx-auto", descriptionFontClass);
  const descriptionElement = p.bio ? (
    p.description_animation === "typewriter" ? (
      <AnimatedName as="p" text={p.bio} className={descriptionClassName} style={descriptionStyle} />
    ) : p.description_animation === "scramble" ? (
      <GsapNameAnimation as="p" variant="scramble" text={p.bio} className={descriptionClassName} style={descriptionStyle} />
    ) : (
      <p className={descriptionClassName} style={descriptionStyle}>
        {p.bio}
      </p>
    )
  ) : null;

  const cardElement = (
    <InteractiveCard
      className={cn(
        "relative w-full rounded-2xl p-[66px] shadow-xl",
        isSide ? "flex items-center gap-6" : "flex flex-col items-center text-center"
      )}
      style={{
        backgroundColor: hexToRgba(p.card_color, p.card_opacity),
        border: p.card_outline_enabled ? `${p.card_outline_width}px solid ${p.card_border_color}` : "none",
      }}
    >
      <ProfileEffectRing effect={p.profile_effect} size={168} color={p.cursor_color}>
        <div className="h-[168px] w-[168px] shrink-0 overflow-hidden rounded-full ring-2 ring-black/5">
          {p.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.avatar_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 text-4xl font-semibold text-white">
              {initial}
            </div>
          )}
        </div>
      </ProfileEffectRing>

      <div className={isSide ? "" : "mt-4"}>
        {isSide ? (
          <div className="flex flex-wrap items-center gap-2">
            {nameElement}
            <ProfileBadges badges={equippedBadges} />
          </div>
        ) : (
          <>
            {nameElement}
            {equippedBadges.length > 0 && (
              <div className="mt-1.5 flex justify-center">
                <ProfileBadges badges={equippedBadges} />
              </div>
            )}
          </>
        )}
        {descriptionElement}
        <LinkWidgets links={links} size={p.link_widget_size} username={p.username} />
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
  );

  return (
    <main className="relative h-screen overflow-hidden" style={mainStyle}>
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

      {p.cursor_animation !== "none" && (
        <CursorTrail effect={p.cursor_animation} color={p.cursor_color} emoji={p.cursor_emoji} />
      )}

      <ProfileExperience
        audioGateProps={
          p.audio_url
            ? {
                audioSrc: p.audio_url,
                audioTitle: p.audio_title,
                audioCoverUrl: p.audio_cover_url,
                audioNameColor: p.audio_name_color,
                audioNameFontSize: p.audio_name_font_size,
                audioNameBold: p.audio_name_bold,
                audioNameFont: p.audio_name_font,
                audioGlowEnabled: p.audio_glow_enabled,
                audioGlowStrength: p.audio_glow_strength,
                audioGlowColor: p.audio_glow_color,
                introText: p.intro_text,
                introTextColor: p.intro_text_color,
                introFontSize: p.intro_text_font_size,
                introGlowEnabled: p.intro_glow_enabled,
                introGlowStrength: p.intro_glow_strength,
                introGlowColor: p.intro_glow_color,
              }
            : null
        }
        cardElement={cardElement}
        aboutMeEnabled={p.about_me_enabled}
        aboutMeText={p.about_me}
        aboutTextStyle={aboutTextStyle}
        aboutFontClass={aboutFontClass}
        aboutBoxStyle={aboutBoxStyle}
        secondaryBoxStyle={secondaryBoxStyle}
        shopEnabled={p.shop_enabled}
        shopItems={shopItems}
        shopTitle={p.shop_title}
        shopFontClass={shopFontClass}
        shopBoxStyle={shopBoxStyle}
        shopNameStyle={shopNameStyle}
        shopDescStyle={shopDescStyle}
        featuredStreaks={featuredStreaks}
        journalHeatmapEnabled={p.journal_heatmap_enabled}
        journalDates={journalDates}
        username={p.username}
      />

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

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-[11px] font-medium text-zinc-300 backdrop-blur transition hover:bg-black/60 hover:text-white"
      >
        made with <span className="font-semibold text-white">Nocturne</span>
      </a>
    </main>
  );
}
