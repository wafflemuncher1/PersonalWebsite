"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/profile/ui/Card";
import { Input, Textarea } from "@/components/profile/ui/Input";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { Reveal } from "@/components/ui/Reveal";
import { AudioDropzone, ColorField, Slider, ToggleRow } from "@/components/shared/controls";
import { firstProfaneField } from "@/lib/profanity";
import { FONT_OPTIONS, type FontKey } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Must be an image.";
  if (file.size > 5 * 1024 * 1024) return "Must be under 5MB.";
  return null;
}

function validateVideo(file: File): string | null {
  if (!file.type.startsWith("video/")) return "Must be a video (MP4 recommended).";
  if (file.size > 30 * 1024 * 1024) return "Must be under 30MB.";
  return null;
}

function validateAudio(file: File): string | null {
  if (!file.type.startsWith("audio/")) return "Must be an audio file (MP3, WAV, OGG, etc).";
  if (file.size > 15 * 1024 * 1024) return "Must be under 15MB.";
  return null;
}

// Sidebar-style expand/collapse — keeps the page from being one giant wall
// of controls. Each logical group (Profile, Description, Audio, etc.) gets
// its own section that starts closed.
function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-300 hover:shadow-elevate">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition duration-200 ease-premium hover:bg-white/[0.025]"
      >
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
        </div>
        <span
          className={`shrink-0 text-zinc-500 transition-transform duration-300 ease-premium ${open ? "rotate-180 text-violet-400" : ""}`}
        >
          ⌄
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE_PREMIUM }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-white/5 px-6 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function CustomizeForm({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [backgroundUrl, setBackgroundUrl] = useState(profile?.background_url ?? "");
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(profile?.background_video_url ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [aboutMeEnabled, setAboutMeEnabled] = useState(profile?.about_me_enabled ?? true);
  const [aboutMe, setAboutMe] = useState(profile?.about_me ?? "");
  const [aboutTextColor, setAboutTextColor] = useState(profile?.about_text_color ?? "#e4e4e7");
  const [aboutTextFontSize, setAboutTextFontSize] = useState(profile?.about_text_font_size ?? 16);
  const [aboutTextBold, setAboutTextBold] = useState(profile?.about_text_bold ?? false);
  const [aboutTextFont, setAboutTextFont] = useState<FontKey>((profile?.about_text_font as FontKey) ?? "default");
  const [aboutGlowEnabled, setAboutGlowEnabled] = useState(profile?.about_glow_enabled ?? false);
  const [aboutGlowStrength, setAboutGlowStrength] = useState(profile?.about_glow_strength ?? 50);
  const [aboutGlowColor, setAboutGlowColor] = useState(profile?.about_glow_color ?? "#8b5cf6");
  const [aboutBoxColor, setAboutBoxColor] = useState(profile?.about_box_color ?? "#ffffff");
  const [aboutBoxOpacity, setAboutBoxOpacity] = useState(profile?.about_box_opacity ?? 100);
  const [aboutBoxOutlineEnabled, setAboutBoxOutlineEnabled] = useState(profile?.about_box_outline_enabled ?? true);
  const [aboutBoxOutlineWidth, setAboutBoxOutlineWidth] = useState(profile?.about_box_outline_width ?? 1);
  const [aboutBoxBorderColor, setAboutBoxBorderColor] = useState(profile?.about_box_border_color ?? "#e5e7eb");
  const [secondaryBoxColor, setSecondaryBoxColor] = useState(profile?.secondary_box_color ?? "#ffffff");
  const [secondaryBoxOpacity, setSecondaryBoxOpacity] = useState(profile?.secondary_box_opacity ?? 100);
  const [secondaryBoxOutlineEnabled, setSecondaryBoxOutlineEnabled] = useState(
    profile?.secondary_box_outline_enabled ?? true
  );
  const [secondaryBoxOutlineWidth, setSecondaryBoxOutlineWidth] = useState(
    profile?.secondary_box_outline_width ?? 1
  );
  const [secondaryBoxBorderColor, setSecondaryBoxBorderColor] = useState(
    profile?.secondary_box_border_color ?? "#e5e7eb"
  );
  const [location, setLocation] = useState(profile?.location ?? "");
  const [showStats, setShowStats] = useState(profile?.show_stats ?? false);
  const [layout, setLayout] = useState<"top" | "side">(profile?.layout ?? "top");
  const [bgType, setBgType] = useState<"solid" | "gradient" | "image" | "video">(profile?.bg_type ?? "solid");
  const [bgColor, setBgColor] = useState(profile?.bg_color ?? "#000000");
  const [bgColor2, setBgColor2] = useState(profile?.bg_color_2 ?? "#4c1d95");
  const [nameColor, setNameColor] = useState(profile?.name_color ?? "#111111");
  const [nameAnimation, setNameAnimation] = useState<
    "none" | "typewriter" | "scramble" | "wave" | "bounce" | "shimmer" | "glitch"
  >(profile?.name_animation ?? "none");
  const [nameFontSize, setNameFontSize] = useState(profile?.name_font_size ?? 24);
  const [nameBold, setNameBold] = useState(profile?.name_bold ?? true);
  const [nameItalic, setNameItalic] = useState(profile?.name_italic ?? false);
  const [nameFont, setNameFont] = useState<FontKey>((profile?.name_font as FontKey) ?? "default");
  const [descriptionFontSize, setDescriptionFontSize] = useState(profile?.description_font_size ?? 14);
  const [descriptionBold, setDescriptionBold] = useState(profile?.description_bold ?? false);
  const [descriptionItalic, setDescriptionItalic] = useState(profile?.description_italic ?? false);
  const [descriptionColor, setDescriptionColor] = useState(profile?.description_color ?? "#a1a1aa");
  const [descriptionAnimation, setDescriptionAnimation] = useState<"none" | "typewriter" | "scramble">(
    profile?.description_animation ?? "none"
  );
  const [descriptionFont, setDescriptionFont] = useState<FontKey>(
    (profile?.description_font as FontKey) ?? "default"
  );
  const [nameGlowEnabled, setNameGlowEnabled] = useState(profile?.name_glow_enabled ?? false);
  const [nameGlowStrength, setNameGlowStrength] = useState(profile?.name_glow_strength ?? 50);
  const [nameGlowColor, setNameGlowColor] = useState(profile?.name_glow_color ?? "#8b5cf6");
  const [profileEffect, setProfileEffect] = useState<"none" | "spin" | "pulse" | "rainbow" | "sparkle">(
    profile?.profile_effect ?? "none"
  );
  const [cardColor, setCardColor] = useState(profile?.card_color ?? "#ffffff");
  const [cardOpacity, setCardOpacity] = useState(profile?.card_opacity ?? 100);
  const [cardBorderColor, setCardBorderColor] = useState(profile?.card_border_color ?? "#e5e7eb");
  const [outlineEnabled, setOutlineEnabled] = useState(profile?.card_outline_enabled ?? true);
  const [outlineWidth, setOutlineWidth] = useState(profile?.card_outline_width ?? 1);
  const [showLocationTag, setShowLocationTag] = useState(profile?.show_location ?? false);
  const [locationPosition, setLocationPosition] = useState<"bottom-left" | "bottom-right" | "card">(
    profile?.location_position ?? "card"
  );
  const [linkWidgetSize, setLinkWidgetSize] = useState(profile?.link_widget_size ?? 28);
  const [cursorAnimation, setCursorAnimation] = useState<
    "none" | "sparkle" | "glow" | "rainbow" | "bubble" | "fire" | "snow" | "confetti" | "emoji" | "trail"
  >(profile?.cursor_animation ?? "none");
  const [cursorColor, setCursorColor] = useState(profile?.cursor_color ?? "#8b5cf6");
  const [cursorEmoji, setCursorEmoji] = useState(profile?.cursor_emoji ?? "✨");
  const [audioUrl, setAudioUrl] = useState(profile?.audio_url ?? "");
  const [audioTitle, setAudioTitle] = useState(profile?.audio_title ?? "");
  const [audioCoverUrl, setAudioCoverUrl] = useState(profile?.audio_cover_url ?? "");
  const [audioNameColor, setAudioNameColor] = useState(profile?.audio_name_color ?? "#ffffff");
  const [audioNameFontSize, setAudioNameFontSize] = useState(profile?.audio_name_font_size ?? 14);
  const [audioNameBold, setAudioNameBold] = useState(profile?.audio_name_bold ?? false);
  const [audioNameFont, setAudioNameFont] = useState<FontKey>((profile?.audio_name_font as FontKey) ?? "default");
  const [audioGlowEnabled, setAudioGlowEnabled] = useState(profile?.audio_glow_enabled ?? false);
  const [audioGlowStrength, setAudioGlowStrength] = useState(profile?.audio_glow_strength ?? 50);
  const [audioGlowColor, setAudioGlowColor] = useState(profile?.audio_glow_color ?? "#8b5cf6");
  const [introText, setIntroText] = useState(profile?.intro_text ?? "Click to enter");
  const [introTextColor, setIntroTextColor] = useState(profile?.intro_text_color ?? "#ffffff");
  const [introFontSize, setIntroFontSize] = useState(profile?.intro_text_font_size ?? 20);
  const [introGlowEnabled, setIntroGlowEnabled] = useState(profile?.intro_glow_enabled ?? false);
  const [introGlowStrength, setIntroGlowStrength] = useState(profile?.intro_glow_strength ?? 50);
  const [introGlowColor, setIntroGlowColor] = useState(profile?.intro_glow_color ?? "#8b5cf6");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [bgVideoUploading, setBgVideoUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioCoverUploading, setAudioCoverUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function uploadTo(
    file: File,
    kind: "avatar" | "background" | "background-video" | "audio-track" | "audio-cover",
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void
  ) {
    if (!profile) return;
    const problem =
      kind === "background-video"
        ? validateVideo(file)
        : kind === "audio-track"
          ? validateAudio(file)
          : validateImage(file);
    if (problem) {
      setStatus("error");
      setError(problem);
      return;
    }
    setError("");
    setUploading(true);
    const ext =
      file.name.split(".").pop() ||
      (kind === "background-video" ? "mp4" : kind === "audio-track" ? "mp3" : "jpg");
    const path = `${profile.id}/${kind}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  async function handleSave() {
    setError("");
    const cleanBio = bio.trim();
    const cleanLocation = location.trim();
    const cleanAboutMe = aboutMe.trim();

    const badField = firstProfaneField({ bio: cleanBio, location: cleanLocation, "about me": cleanAboutMe });
    if (badField) {
      setStatus("error");
      setError(`Let's keep it clean — please revise the ${badField}.`);
      return;
    }

    setStatus("saving");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl.trim() || null,
        background_url: backgroundUrl.trim() || null,
        background_video_url: backgroundVideoUrl.trim(),
        bio: cleanBio,
        about_me: cleanAboutMe,
        about_me_enabled: aboutMeEnabled,
        about_text_color: aboutTextColor,
        about_text_font_size: aboutTextFontSize,
        about_text_bold: aboutTextBold,
        about_text_font: aboutTextFont,
        about_glow_enabled: aboutGlowEnabled,
        about_glow_strength: aboutGlowStrength,
        about_glow_color: aboutGlowColor,
        about_box_color: aboutBoxColor,
        about_box_opacity: aboutBoxOpacity,
        about_box_outline_enabled: aboutBoxOutlineEnabled,
        about_box_outline_width: aboutBoxOutlineWidth,
        about_box_border_color: aboutBoxBorderColor,
        secondary_box_color: secondaryBoxColor,
        secondary_box_opacity: secondaryBoxOpacity,
        secondary_box_outline_enabled: secondaryBoxOutlineEnabled,
        secondary_box_outline_width: secondaryBoxOutlineWidth,
        secondary_box_border_color: secondaryBoxBorderColor,
        location: cleanLocation,
        show_stats: showStats,
        layout,
        bg_type: bgType,
        bg_color: bgColor,
        bg_color_2: bgColor2,
        name_color: nameColor,
        name_animation: nameAnimation,
        name_font_size: nameFontSize,
        name_bold: nameBold,
        name_italic: nameItalic,
        name_font: nameFont,
        description_font_size: descriptionFontSize,
        description_bold: descriptionBold,
        description_italic: descriptionItalic,
        description_color: descriptionColor,
        description_animation: descriptionAnimation,
        description_font: descriptionFont,
        name_glow_enabled: nameGlowEnabled,
        name_glow_strength: nameGlowStrength,
        name_glow_color: nameGlowColor,
        profile_effect: profileEffect,
        card_color: cardColor,
        card_opacity: cardOpacity,
        card_border_color: cardBorderColor,
        card_outline_enabled: outlineEnabled,
        card_outline_width: outlineWidth,
        show_location: showLocationTag,
        location_position: locationPosition,
        link_widget_size: linkWidgetSize,
        cursor_animation: cursorAnimation,
        cursor_color: cursorColor,
        cursor_emoji: cursorEmoji,
        audio_url: audioUrl.trim(),
        audio_title: audioTitle.trim(),
        audio_cover_url: audioCoverUrl.trim(),
        audio_name_color: audioNameColor,
        audio_name_font_size: audioNameFontSize,
        audio_name_bold: audioNameBold,
        audio_name_font: audioNameFont,
        audio_glow_enabled: audioGlowEnabled,
        audio_glow_strength: audioGlowStrength,
        audio_glow_color: audioGlowColor,
        intro_text: introText.trim() || "Click to enter",
        intro_text_color: introTextColor,
        intro_text_font_size: introFontSize,
        intro_glow_enabled: introGlowEnabled,
        intro_glow_strength: introGlowStrength,
        intro_glow_color: introGlowColor,
      })
      .eq("id", profile?.id);

    if (updateError) {
      setStatus("error");
      setError(
        updateError.message.includes("not allowed")
          ? "That contains language that isn't allowed. Please revise."
          : updateError.message
      );
      return;
    }

    setStatus("done");
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Customize</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <ProfileCompletionCard profile={profile} />
      </Reveal>

      <div className="space-y-3">
        <CollapsibleSection title="Assets" description="Your avatar and backgrounds." defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AssetTile
              label="Background"
              hint="Image or GIF"
              previewUrl={backgroundUrl}
              uploading={bgUploading}
              onUpload={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadTo(file, "background", setBgUploading, setBackgroundUrl);
              }}
              onRemove={() => setBackgroundUrl("")}
            />
            <AssetTile
              label="Background Video"
              hint="MP4, up to 30MB"
              kind="video"
              previewUrl={backgroundVideoUrl}
              uploading={bgVideoUploading}
              onUpload={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadTo(file, "background-video", setBgVideoUploading, setBackgroundVideoUrl);
              }}
              onRemove={() => setBackgroundVideoUrl("")}
            />
            <AssetTile
              label="Profile Avatar"
              previewUrl={avatarUrl}
              uploading={avatarUploading}
              onUpload={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadTo(file, "avatar", setAvatarUploading, setAvatarUrl);
              }}
              onRemove={() => setAvatarUrl("")}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Profile" description="Layout and public stats.">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Profile Layout</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLayout("top")}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  layout === "top"
                    ? "border-violet-500/50 bg-violet-500/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25"
                }`}
              >
                <p className="font-medium">Top</p>
                <p className="text-xs text-zinc-500">Picture centered above your name.</p>
              </button>
              <button
                type="button"
                onClick={() => setLayout("side")}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  layout === "side"
                    ? "border-violet-500/50 bg-violet-500/10 text-white"
                    : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25"
                }`}
              >
                <p className="font-medium">Side</p>
                <p className="text-xs text-zinc-500">Picture on the left, name beside it.</p>
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
            <div>
              <p className="text-sm text-zinc-200">Show public stats</p>
              <p className="text-xs text-zinc-500">Aggregate counts only.</p>
            </div>
            <input
              type="checkbox"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-white/20 bg-white/5 accent-violet-500"
            />
          </label>
        </CollapsibleSection>

        <CollapsibleSection title="Description" description="The line under your name, and how it looks.">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Text</label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="A line or two about you."
              maxLength={150}
            />
            <p className="mt-1 text-right text-[11px] text-zinc-600">{bio.length}/150</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Font</label>
            <select
              value={descriptionFont}
              onChange={(e) => setDescriptionFont(e.target.value as FontKey)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.key} value={f.key} className={cn("bg-ink-950", f.className)}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <ColorField label="Description Color" value={descriptionColor} onChange={setDescriptionColor} />
          <Slider
            label="Description Size"
            value={descriptionFontSize}
            onChange={setDescriptionFontSize}
            min={10}
            max={28}
            unit="px"
          />
          <div className="grid grid-cols-2 gap-3">
            <ToggleRow label="Bold" checked={descriptionBold} onChange={setDescriptionBold} />
            <ToggleRow label="Italic" checked={descriptionItalic} onChange={setDescriptionItalic} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description Animation</label>
            <select
              value={descriptionAnimation}
              onChange={(e) => setDescriptionAnimation(e.target.value as "none" | "typewriter" | "scramble")}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              <option value="none" className="bg-ink-950">None</option>
              <option value="typewriter" className="bg-ink-950">Typewriter</option>
              <option value="scramble" className="bg-ink-950">Scramble (GSAP)</option>
            </select>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Display Name" description="Font, color, animation, size, and glow.">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Font</label>
            <select
              value={nameFont}
              onChange={(e) => setNameFont(e.target.value as FontKey)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.key} value={f.key} className={cn("bg-ink-950", f.className)}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <ColorField label="Display Name Color" value={nameColor} onChange={setNameColor} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name Animation</label>
            <select
              value={nameAnimation}
              onChange={(e) =>
                setNameAnimation(
                  e.target.value as "none" | "typewriter" | "scramble" | "wave" | "bounce" | "shimmer" | "glitch"
                )
              }
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              <option value="none" className="bg-ink-950">None</option>
              <option value="typewriter" className="bg-ink-950">Typewriter</option>
              <option value="scramble" className="bg-ink-950">Scramble (GSAP)</option>
              <option value="wave" className="bg-ink-950">Wave</option>
              <option value="bounce" className="bg-ink-950">Bounce</option>
              <option value="shimmer" className="bg-ink-950">Shimmer</option>
              <option value="glitch" className="bg-ink-950">Glitch</option>
            </select>
          </div>
          <Slider label="Name Size" value={nameFontSize} onChange={setNameFontSize} min={14} max={56} unit="px" />
          <div className="grid grid-cols-2 gap-3">
            <ToggleRow label="Bold" checked={nameBold} onChange={setNameBold} />
            <ToggleRow label="Italic" checked={nameItalic} onChange={setNameItalic} />
          </div>
          <ToggleRow
            label="Name Glow"
            sub="A soft glow around your display name."
            checked={nameGlowEnabled}
            onChange={setNameGlowEnabled}
          />
          {nameGlowEnabled && (
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
              <Slider
                label="Glow Strength"
                value={nameGlowStrength}
                onChange={setNameGlowStrength}
                min={0}
                max={100}
                unit="%"
              />
              <ColorField label="Glow Color" value={nameGlowColor} onChange={setNameGlowColor} />
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Location" description="What shows and where.">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country — optional"
              maxLength={50}
            />
          </div>
          <ToggleRow
            label="Show Location on Profile"
            sub="Display the location above on your public page."
            checked={showLocationTag}
            onChange={setShowLocationTag}
          />
          {showLocationTag && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Location Position</label>
              <select
                value={locationPosition}
                onChange={(e) => setLocationPosition(e.target.value as "bottom-left" | "bottom-right" | "card")}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
              >
                <option value="card" className="bg-ink-950">On Card</option>
                <option value="bottom-left" className="bg-ink-950">Bottom Left</option>
                <option value="bottom-right" className="bg-ink-950">Bottom Right</option>
              </select>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Background" description="Solid color, gradient, image, or video.">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Background Type</label>
            <select
              value={bgType}
              onChange={(e) => setBgType(e.target.value as "solid" | "gradient" | "image" | "video")}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              <option value="solid" className="bg-ink-950">Solid Color</option>
              <option value="gradient" className="bg-ink-950">Gradient</option>
              <option value="image" className="bg-ink-950">Image / GIF</option>
              <option value="video" className="bg-ink-950">Video (MP4)</option>
            </select>
            {bgType === "image" && (
              <p className="mt-1.5 text-[11px] text-zinc-600">
                Uses the Background image set in Assets above — upload one there if you haven&apos;t. Animated GIFs work too.
              </p>
            )}
            {bgType === "video" && (
              <p className="mt-1.5 text-[11px] text-zinc-600">
                Uses the Background Video set in Assets above — it&apos;ll autoplay, loop, and stay muted for visitors.
              </p>
            )}
          </div>
          {bgType !== "image" && bgType !== "video" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Background Color" value={bgColor} onChange={setBgColor} />
              <ColorField
                label="Background Color 2"
                value={bgColor2}
                onChange={setBgColor2}
                disabled={bgType !== "gradient"}
              />
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Profile Picture Effect" description="Animates around the edge of your avatar.">
          <select
            value={profileEffect}
            onChange={(e) => setProfileEffect(e.target.value as "none" | "spin" | "pulse" | "rainbow" | "sparkle")}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
          >
            <option value="none" className="bg-ink-950">None</option>
            <option value="spin" className="bg-ink-950">Spinning Ring</option>
            <option value="pulse" className="bg-ink-950">Pulse Ring</option>
            <option value="rainbow" className="bg-ink-950">Rainbow Ring</option>
            <option value="sparkle" className="bg-ink-950">Sparkle Ring</option>
          </select>
        </CollapsibleSection>

        <CollapsibleSection title="Profile Box" description="Color, transparency, and outline.">
          <ColorField label="Box Color" value={cardColor} onChange={setCardColor} />
          <div>
            <Slider label="Box Transparency" value={cardOpacity} onChange={setCardOpacity} min={0} max={100} unit="%" />
            <p className="mt-1.5 text-[11px] text-zinc-600">Only the box fill fades — your picture and name stay fully visible.</p>
          </div>
          <ToggleRow
            label="Box Outline"
            sub="Turn off for a completely borderless box."
            checked={outlineEnabled}
            onChange={setOutlineEnabled}
          />
          {outlineEnabled && (
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
              <Slider label="Outline Thickness" value={outlineWidth} onChange={setOutlineWidth} min={1} max={8} unit="px" />
              <ColorField label="Outline Color" value={cardBorderColor} onChange={setCardBorderColor} />
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Links" description="How big your link icons show up.">
          <Slider label="Link Icon Size" value={linkWidgetSize} onChange={setLinkWidgetSize} min={16} max={48} unit="px" />
          <p className="text-[11px] text-zinc-600">
            Controls how big your link icons show up on your public page, right under your description.
          </p>
        </CollapsibleSection>

        <CollapsibleSection title="Cursor" description="A trail that follows visitors' cursors.">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Cursor Animation</label>
            <select
              value={cursorAnimation}
              onChange={(e) =>
                setCursorAnimation(
                  e.target.value as
                    | "none"
                    | "sparkle"
                    | "glow"
                    | "rainbow"
                    | "bubble"
                    | "fire"
                    | "snow"
                    | "confetti"
                    | "emoji"
                    | "trail"
                )
              }
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              <option value="none" className="bg-ink-950">None</option>
              <option value="sparkle" className="bg-ink-950">Sparkle Trail</option>
              <option value="glow" className="bg-ink-950">Glow Trail</option>
              <option value="rainbow" className="bg-ink-950">Rainbow Trail</option>
              <option value="bubble" className="bg-ink-950">Bubble Trail</option>
              <option value="fire" className="bg-ink-950">Fire Trail</option>
              <option value="snow" className="bg-ink-950">Snow Trail</option>
              <option value="confetti" className="bg-ink-950">Confetti Trail</option>
              <option value="emoji" className="bg-ink-950">Emoji Trail</option>
              <option value="trail" className="bg-ink-950">Cursor Trail</option>
            </select>
            <p className="mt-1.5 text-[11px] text-zinc-600">
              A trail follows the cursor for anyone visiting your page — not just you.
            </p>
          </div>
          {["sparkle", "glow", "bubble", "trail"].includes(cursorAnimation) && (
            <div className="sm:w-64">
              <ColorField label="Cursor Trail Color" value={cursorColor} onChange={setCursorColor} />
            </div>
          )}
          {cursorAnimation === "emoji" && (
            <div className="sm:w-64">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Trail Emoji</label>
              <input
                value={cursorEmoji}
                onChange={(e) => setCursorEmoji(e.target.value.slice(0, 4))}
                maxLength={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-lg text-white outline-none focus:border-violet-500/50"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["✨", "🔥", "❤️", "😂", "💀", "👑", "⭐", "🎉", "💜", "⚡"].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setCursorEmoji(e)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border text-base transition ${
                      cursorEmoji === e
                        ? "border-violet-500/60 bg-violet-500/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Audio & Enter Screen" description="A track that plays when someone opens your page.">
          <AudioDropzone
            hasFile={!!audioUrl}
            uploading={audioUploading}
            hint="MP3, WAV, or OGG — up to 15MB. Visitors get a mute button to control it."
            onUpload={(file) => uploadTo(file, "audio-track", setAudioUploading, setAudioUrl)}
          />
          {audioUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <audio controls src={audioUrl} className="h-9 flex-1" />
              <button
                type="button"
                onClick={() => setAudioUrl("")}
                className="shrink-0 rounded-md bg-red-500/80 px-2 py-1 text-[10px] text-white transition hover:bg-red-500"
              >
                Remove
              </button>
            </div>
          )}

          {audioUrl && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="w-32">
                  <AssetTile
                    label="Cover Art"
                    hint="optional"
                    previewUrl={audioCoverUrl}
                    uploading={audioCoverUploading}
                    onUpload={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) uploadTo(file, "audio-cover", setAudioCoverUploading, setAudioCoverUrl);
                    }}
                    onRemove={() => setAudioCoverUrl("")}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Track Name</label>
                  <Input
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    placeholder="e.g. my favorite song"
                    maxLength={60}
                  />
                  <div className="mt-3">
                    <ColorField label="Track Name Color" value={audioNameColor} onChange={setAudioNameColor} />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Track Name Font</label>
                <select
                  value={audioNameFont}
                  onChange={(e) => setAudioNameFont(e.target.value as FontKey)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.key} value={f.key} className={cn("bg-ink-950", f.className)}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <Slider
                label="Track Name Size"
                value={audioNameFontSize}
                onChange={setAudioNameFontSize}
                min={10}
                max={28}
                unit="px"
              />

              <ToggleRow label="Bold" checked={audioNameBold} onChange={setAudioNameBold} />

              <ToggleRow
                label="Track Name Glow"
                sub="A soft glow around the track name."
                checked={audioGlowEnabled}
                onChange={setAudioGlowEnabled}
              />
              {audioGlowEnabled && (
                <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
                  <Slider
                    label="Glow Strength"
                    value={audioGlowStrength}
                    onChange={setAudioGlowStrength}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <ColorField label="Glow Color" value={audioGlowColor} onChange={setAudioGlowColor} />
                </div>
              )}

              <div className="border-t border-white/5 pt-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Enter Screen</p>
                <p className="mb-3 text-[11px] text-zinc-600">
                  Visitors see this over a blurred preview of your page — clicking it is what starts your
                  audio, since browsers only allow sound to start from a real click.
                </p>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Text</label>
                <Input
                  value={introText}
                  onChange={(e) => setIntroText(e.target.value)}
                  placeholder="Click to enter"
                  maxLength={60}
                />
                <div className="mt-3">
                  <ColorField label="Text Color" value={introTextColor} onChange={setIntroTextColor} />
                </div>
                <div className="mt-4">
                  <Slider
                    label="Text Size"
                    value={introFontSize}
                    onChange={setIntroFontSize}
                    min={12}
                    max={40}
                    unit="px"
                  />
                </div>
                <div className="mt-3">
                  <ToggleRow label="Glow" checked={introGlowEnabled} onChange={setIntroGlowEnabled} />
                </div>
                {introGlowEnabled && (
                  <div className="mt-3 space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
                    <Slider
                      label="Glow Strength"
                      value={introGlowStrength}
                      onChange={setIntroGlowStrength}
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <ColorField label="Glow Color" value={introGlowColor} onChange={setIntroGlowColor} />
                  </div>
                )}
              </div>
            </>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="About Me" description="A second page visitors can scroll down to see.">
          <ToggleRow
            label="Show About Me Page"
            sub="Turn this off to remove the About Me page from your public profile entirely."
            checked={aboutMeEnabled}
            onChange={setAboutMeEnabled}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Text</label>
            <Textarea
              rows={6}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value.slice(0, 1000))}
              placeholder="Write a longer bit about yourself here — this shows on its own page when someone scrolls down on your profile."
              maxLength={1000}
            />
            <p className="mt-1 text-right text-[11px] text-zinc-600">{aboutMe.length}/1000</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Font</label>
            <select
              value={aboutTextFont}
              onChange={(e) => setAboutTextFont(e.target.value as FontKey)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.key} value={f.key} className={cn("bg-ink-950", f.className)}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <ColorField label="Text Color" value={aboutTextColor} onChange={setAboutTextColor} />
          <Slider
            label="Text Size"
            value={aboutTextFontSize}
            onChange={setAboutTextFontSize}
            min={12}
            max={28}
            unit="px"
          />
          <ToggleRow label="Bold" checked={aboutTextBold} onChange={setAboutTextBold} />

          <ToggleRow
            label="Text Glow"
            sub="A soft glow around the About Me text."
            checked={aboutGlowEnabled}
            onChange={setAboutGlowEnabled}
          />
          {aboutGlowEnabled && (
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
              <Slider
                label="Glow Strength"
                value={aboutGlowStrength}
                onChange={setAboutGlowStrength}
                min={0}
                max={100}
                unit="%"
              />
              <ColorField label="Glow Color" value={aboutGlowColor} onChange={setAboutGlowColor} />
            </div>
          )}

          <div className="border-t border-white/5 pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">About Me Box</p>
            <ColorField label="Box Color" value={aboutBoxColor} onChange={setAboutBoxColor} />
            <div className="mt-4">
              <Slider
                label="Box Transparency"
                value={aboutBoxOpacity}
                onChange={setAboutBoxOpacity}
                min={0}
                max={100}
                unit="%"
              />
            </div>
            <div className="mt-4">
              <ToggleRow
                label="Box Outline"
                sub="Turn off for a completely borderless box."
                checked={aboutBoxOutlineEnabled}
                onChange={setAboutBoxOutlineEnabled}
              />
            </div>
            {aboutBoxOutlineEnabled && (
              <div className="mt-3 space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
                <Slider
                  label="Outline Thickness"
                  value={aboutBoxOutlineWidth}
                  onChange={setAboutBoxOutlineWidth}
                  min={1}
                  max={8}
                  unit="px"
                />
                <ColorField label="Outline Color" value={aboutBoxBorderColor} onChange={setAboutBoxBorderColor} />
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="More Info Boxes"
          description="Two extra boxes on the About Me page — reserved for now, styling only."
        >
          <p className="text-[11px] text-zinc-600">
            These two boxes show up under About Me on your profile. They&apos;re empty for now — content for
            them is coming later — but you can style how they&apos;ll look ahead of time.
          </p>
          <ColorField label="Box Color" value={secondaryBoxColor} onChange={setSecondaryBoxColor} />
          <Slider
            label="Box Transparency"
            value={secondaryBoxOpacity}
            onChange={setSecondaryBoxOpacity}
            min={0}
            max={100}
            unit="%"
          />
          <ToggleRow
            label="Box Outline"
            sub="Turn off for a completely borderless box."
            checked={secondaryBoxOutlineEnabled}
            onChange={setSecondaryBoxOutlineEnabled}
          />
          {secondaryBoxOutlineEnabled && (
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
              <Slider
                label="Outline Thickness"
                value={secondaryBoxOutlineWidth}
                onChange={setSecondaryBoxOutlineWidth}
                min={1}
                max={8}
                unit="px"
              />
              <ColorField label="Outline Color" value={secondaryBoxBorderColor} onChange={setSecondaryBoxBorderColor} />
            </div>
          )}
        </CollapsibleSection>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-ink-925/90 px-4 py-3 shadow-elevate-lg backdrop-blur-md">
        <Button onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save changes"}
        </Button>
        <AnimatePresence mode="wait">
          {status === "error" && (
            <motion.p
              key="err"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
          {status === "done" && (
            <motion.p
              key="ok"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-emerald-400"
            >
              Saved.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AssetTile({
  label,
  hint,
  kind = "image",
  previewUrl,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  hint?: string;
  kind?: "image" | "video";
  previewUrl: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const ext = previewUrl.split("?")[0].split(".").pop();

  return (
    <div>
      <p className="mb-2 text-sm text-zinc-300">
        {label}
        {hint && <span className="ml-1.5 text-xs text-zinc-600">({hint})</span>}
      </p>
      <div className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition duration-200 ease-premium hover:border-violet-500/30 hover:shadow-elevate">
        <label className="flex h-full w-full cursor-pointer items-center justify-center transition duration-200 group-hover:bg-white/[0.035]">
          {previewUrl ? (
            kind === "video" ? (
              <video src={previewUrl} className="h-full w-full object-cover" muted loop autoPlay playsInline />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <span className="text-2xl">+</span>
              <span className="text-xs">Click to upload</span>
            </div>
          )}
          <input
            type="file"
            accept={kind === "video" ? "video/*" : "image/*"}
            className="hidden"
            onChange={onUpload}
            disabled={uploading}
          />
        </label>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
            Uploading…
          </div>
        )}

        {previewUrl && !uploading && (
          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5">
            {ext && (
              <span className="pointer-events-auto rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase text-zinc-300">
                .{ext}
              </span>
            )}
            <button
              type="button"
              onClick={onRemove}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-md bg-red-500/80 text-[10px] text-white transition hover:bg-red-500"
              aria-label={`Remove ${label.toLowerCase()}`}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
