"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa6";
import { Plus, Trash2, Pencil, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ColorField, Slider, ToggleRow } from "@/components/customizer2/controls";
import { PLATFORMS, validatePlatformUrl, type Platform } from "@/lib/link-validation";
import type { Profile, ProfileLinkItem } from "@/lib/types";

const LINK_LIMIT = 8;

const PLATFORM_ICONS: Record<Platform, IconType> = {
  youtube: FaYoutube,
  tiktok: FaTiktok,
  instagram: FaInstagram,
  facebook: FaFacebook,
};

function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Must be an image.";
  if (file.size > 5 * 1024 * 1024) return "Must be under 5MB.";
  return null;
}

export function LinksForm({
  profile,
  initialLinks,
}: {
  profile: Profile | null;
  initialLinks: ProfileLinkItem[];
}) {
  const supabase = createClient();
  const [links, setLinks] = useState<ProfileLinkItem[]>(initialLinks);
  const [picking, setPicking] = useState(false);
  const [newPlatform, setNewPlatform] = useState<Platform | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newError, setNewError] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!profile || !newPlatform) return;
    if (links.length >= LINK_LIMIT) {
      setNewError(`You can only have up to ${LINK_LIMIT} links.`);
      return;
    }
    const problem = validatePlatformUrl(newPlatform, newUrl);
    if (problem) {
      setNewError(problem);
      return;
    }
    setNewError("");
    setCreating(true);
    const { data, error } = await supabase
      .from("profile_links")
      .insert({
        profile_id: profile.id,
        platform: newPlatform,
        url: newUrl.trim(),
        sort_order: links.length,
      })
      .select()
      .single();
    setCreating(false);
    if (error) {
      setNewError(error.message);
      return;
    }
    setLinks((prev) => [...prev, data as ProfileLinkItem]);
    setPicking(false);
    setNewPlatform(null);
    setNewUrl("");
  }

  function handleUpdated(updated: ProfileLinkItem) {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  function handleDeleted(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Links</h1>
      <p className="-mt-4 text-sm text-zinc-500">
        These show up on your public page right under your description. Up to {LINK_LIMIT} links.
      </p>

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white">Your links</h2>
        <p className="mb-5 text-xs text-zinc-500">Pick a platform, drop in your link, and customize how it looks.</p>

        {links.length > 0 && (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                profileId={profile.id}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {links.length === 0 && !picking && <p className="mb-4 text-sm text-zinc-600">No links yet.</p>}

        {!picking && links.length < LINK_LIMIT && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300"
          >
            <Plus className="h-3.5 w-3.5" /> Create a link
          </button>
        )}

        {!picking && links.length >= LINK_LIMIT && (
          <p className="mt-3 text-xs text-zinc-600">You&apos;ve reached the {LINK_LIMIT} link limit.</p>
        )}

        {picking && (
          <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
            {!newPlatform ? (
              <>
                <p className="text-xs font-medium text-zinc-400">Choose a platform</p>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(PLATFORMS) as Platform[]).map((key) => {
                    const Icon = PLATFORM_ICONS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewPlatform(key)}
                        className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/25"
                      >
                        <Icon size={22} color={PLATFORMS[key].brandColor} />
                        <span className="text-[11px] text-zinc-400">{PLATFORMS[key].label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setPicking(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = PLATFORM_ICONS[newPlatform];
                    return <Icon size={26} color={PLATFORMS[newPlatform].brandColor} />;
                  })()}
                  <input
                    autoFocus
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder={PLATFORMS[newPlatform].hint}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                  />
                </div>
                {newError && <p className="text-xs text-red-400">{newError}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? "Saving…" : "Save link"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlatform(null);
                      setNewUrl("");
                      setNewError("");
                    }}
                    className="rounded-lg border border-white/10 px-3 text-sm text-zinc-400 hover:bg-white/5"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function LinkRow({
  link,
  profileId,
  onUpdated,
  onDeleted,
}: {
  link: ProfileLinkItem;
  profileId: string;
  onUpdated: (l: ProfileLinkItem) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState(link.url);
  const [isCustomLogo, setIsCustomLogo] = useState(link.is_custom_logo);
  const [customColor, setCustomColor] = useState(link.custom_color ?? PLATFORMS[link.platform].brandColor);
  const [glowEnabled, setGlowEnabled] = useState(link.glow_enabled);
  const [glowStrength, setGlowStrength] = useState(link.glow_strength);
  const [glowColor, setGlowColor] = useState(link.glow_color);
  const [customIconUrl, setCustomIconUrl] = useState(link.custom_icon_url ?? "");
  const [iconUploading, setIconUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  const Icon = PLATFORM_ICONS[link.platform];
  const displayColor = isCustomLogo ? customColor : PLATFORMS[link.platform].brandColor;

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }
    setIconUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${profileId}/link-icon-${link.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setError(uploadError.message);
      setIconUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setCustomIconUrl(`${data.publicUrl}?t=${Date.now()}`);
    setIconUploading(false);
  }

  async function handleSave() {
    setError("");
    const problem = validatePlatformUrl(link.platform, url);
    if (problem) {
      setStatus("error");
      setError(problem);
      return;
    }
    setStatus("saving");
    const { data, error: updateError } = await supabase
      .from("profile_links")
      .update({
        url: url.trim(),
        is_custom_logo: isCustomLogo,
        custom_color: isCustomLogo ? customColor : null,
        glow_enabled: glowEnabled,
        glow_strength: glowStrength,
        glow_color: glowColor,
        custom_icon_url: isCustomLogo ? customIconUrl.trim() || null : null,
      })
      .eq("id", link.id)
      .select()
      .single();
    if (updateError) {
      setStatus("error");
      setError(updateError.message);
      return;
    }
    setStatus("idle");
    onUpdated(data as ProfileLinkItem);
    setExpanded(false);
  }

  async function handleDelete() {
    const { error: deleteError } = await supabase.from("profile_links").delete().eq("id", link.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    onDeleted(link.id);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-3 p-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5"
          style={glowEnabled ? { boxShadow: `0 0 ${4 + (glowStrength / 100) * 16}px ${glowColor}` } : undefined}
        >
          {isCustomLogo && customIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon size={18} color={displayColor} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-300">{PLATFORMS[link.platform].label}</p>
          <p className="truncate text-[11px] text-zinc-600">{link.url}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          aria-label="Edit link"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
          aria-label="Delete link"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-white/5 p-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Link URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
            />
          </div>

          <ToggleRow
            label="Custom Logo"
            sub="Swap the brand color, add a glow, or upload your own icon."
            checked={isCustomLogo}
            onChange={setIsCustomLogo}
          />

          {isCustomLogo && (
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
              <ColorField label="Logo Color" value={customColor} onChange={setCustomColor} />

              <ToggleRow label="Glow" checked={glowEnabled} onChange={setGlowEnabled} />
              {glowEnabled && (
                <>
                  <Slider
                    label="Glow Strength"
                    value={glowStrength}
                    onChange={setGlowStrength}
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <ColorField label="Glow Color" value={glowColor} onChange={setGlowColor} />
                </>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Custom Icon (optional)</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02]">
                    {customIconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
                    {iconUploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconUpload}
                      disabled={iconUploading}
                    />
                  </label>
                  {customIconUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomIconUrl("")}
                      className="rounded-lg border border-white/10 p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300"
                      aria-label="Remove custom icon"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-600">Overrides the platform logo above when set.</p>
              </div>
            </div>
          )}

          {status === "error" && <p className="text-xs text-red-400">{error}</p>}

          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
