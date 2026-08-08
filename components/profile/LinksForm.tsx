"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa6";
import { Plus, Trash2, Pencil, Upload, X, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ColorField, Slider, ToggleRow } from "@/components/customizer2/controls";
import { PLATFORMS, KNOWN_PLATFORMS, validatePlatformUrl, type Platform, type KnownPlatform } from "@/lib/link-validation";
import type { Profile, ProfileLinkItem } from "@/lib/types";

const LINK_LIMIT = 8;

const PLATFORM_ICONS: Record<KnownPlatform, IconType> = {
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
  const [newLabel, setNewLabel] = useState("");
  const [newIconChoice, setNewIconChoice] = useState<KnownPlatform | null>(null);
  const [newCustomIconUrl, setNewCustomIconUrl] = useState("");
  const [newIconUploading, setNewIconUploading] = useState(false);
  const [newLinkId, setNewLinkId] = useState<string | null>(null);
  const [newError, setNewError] = useState("");
  const [creating, setCreating] = useState(false);

  function backToPlatformGrid() {
    setNewPlatform(null);
    setNewUrl("");
    setNewError("");
    setNewLabel("");
    setNewIconChoice(null);
    setNewCustomIconUrl("");
    setNewLinkId(null);
  }

  function resetPicker() {
    setPicking(false);
    backToPlatformGrid();
  }

  async function handleNewIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile || !newLinkId) return;
    const problem = validateImage(file);
    if (problem) {
      setNewError(problem);
      return;
    }
    setNewIconUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${profile.id}/link-icon-${newLinkId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setNewError(uploadError.message);
      setNewIconUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setNewCustomIconUrl(`${data.publicUrl}?t=${Date.now()}`);
    setNewIconChoice(null);
    setNewIconUploading(false);
  }

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
    if (newPlatform === "custom" && !newCustomIconUrl && !newIconChoice) {
      setNewError("Pick a logo — upload your own or choose a standard one.");
      return;
    }
    setNewError("");
    setCreating(true);
    const { data, error } = await supabase
      .from("profile_links")
      .insert({
        ...(newPlatform === "custom" && newLinkId ? { id: newLinkId } : {}),
        profile_id: profile.id,
        platform: newPlatform,
        url: newUrl.trim(),
        sort_order: links.length,
        label: newPlatform === "custom" ? newLabel.trim() || null : null,
        icon_choice: newPlatform === "custom" ? newIconChoice : null,
        custom_icon_url: newPlatform === "custom" ? newCustomIconUrl || null : null,
        is_custom_logo: newPlatform === "custom",
      })
      .select()
      .single();
    setCreating(false);
    if (error) {
      setNewError(error.message);
      return;
    }
    setLinks((prev) => [...prev, data as ProfileLinkItem]);
    resetPicker();
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
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(PLATFORMS) as Platform[]).map((key) => {
                    const Icon = key === "custom" ? Link2 : PLATFORM_ICONS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setNewPlatform(key);
                          if (key === "custom") setNewLinkId(crypto.randomUUID());
                        }}
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
            ) : newPlatform === "custom" ? (
              <>
                <div className="flex items-center gap-3">
                  <Link2 size={26} color={PLATFORMS.custom.brandColor} />
                  <input
                    autoFocus
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder={PLATFORMS.custom.hint}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                  />
                </div>

                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label (shown on hover) — e.g. My Website"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                />

                <div>
                  <p className="mb-1.5 text-xs font-medium text-zinc-400">Logo</p>
                  <p className="mb-2 text-[11px] text-zinc-600">
                    Upload your own image, or pick one of the standard icons.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02]">
                      {newCustomIconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={newCustomIconUrl} alt="" className="h-full w-full object-cover" />
                      ) : newIconChoice ? (
                        (() => {
                          const ChosenIcon = PLATFORM_ICONS[newIconChoice];
                          return <ChosenIcon size={18} color={PLATFORMS[newIconChoice].brandColor} />;
                        })()
                      ) : (
                        <Upload className="h-4 w-4 text-zinc-600" />
                      )}
                    </div>
                    <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
                      {newIconUploading ? "Uploading…" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleNewIconUpload}
                        disabled={newIconUploading}
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {KNOWN_PLATFORMS.map((key) => {
                      const StdIcon = PLATFORM_ICONS[key];
                      const active = newIconChoice === key && !newCustomIconUrl;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setNewIconChoice(key);
                            setNewCustomIconUrl("");
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                            active
                              ? "border-violet-500/60 bg-violet-500/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/25"
                          }`}
                          aria-label={`Use ${PLATFORMS[key].label} icon`}
                        >
                          <StdIcon size={16} color={PLATFORMS[key].brandColor} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {newError && <p className="text-xs text-red-400">{newError}</p>}
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? "Saving…" : "Save link"}
                  </Button>
                  <button
                    type="button"
                    onClick={backToPlatformGrid}
                    className="rounded-lg border border-white/10 px-3 text-sm text-zinc-400 hover:bg-white/5"
                  >
                    Back
                  </button>
                </div>
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
                    onClick={backToPlatformGrid}
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
  const isCustomPlatform = link.platform === "custom";
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState(link.url);
  const [label, setLabel] = useState(link.label ?? "");
  const [isCustomLogo, setIsCustomLogo] = useState(link.is_custom_logo);
  const [customColor, setCustomColor] = useState(link.custom_color ?? PLATFORMS[link.platform].brandColor);
  const [iconChoice, setIconChoice] = useState<KnownPlatform | null>(link.icon_choice);
  const [glowEnabled, setGlowEnabled] = useState(link.glow_enabled);
  const [glowStrength, setGlowStrength] = useState(link.glow_strength);
  const [glowColor, setGlowColor] = useState(link.glow_color);
  const [customIconUrl, setCustomIconUrl] = useState(link.custom_icon_url ?? "");
  const [iconUploading, setIconUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  const PreviewIcon = isCustomPlatform
    ? iconChoice
      ? PLATFORM_ICONS[iconChoice]
      : null
    : PLATFORM_ICONS[link.platform as KnownPlatform];
  const displayColor = isCustomLogo || isCustomPlatform ? customColor : PLATFORMS[link.platform].brandColor;
  const rowLabel = isCustomPlatform ? link.label?.trim() || "Custom Link" : PLATFORMS[link.platform].label;

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
    if (isCustomPlatform) setIconChoice(null);
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
    if (isCustomPlatform && !customIconUrl && !iconChoice) {
      setStatus("error");
      setError("Pick a logo — upload your own or choose a standard one.");
      return;
    }
    setStatus("saving");
    const { data, error: updateError } = await supabase
      .from("profile_links")
      .update({
        url: url.trim(),
        label: isCustomPlatform ? label.trim() || null : null,
        is_custom_logo: isCustomPlatform ? true : isCustomLogo,
        custom_color: isCustomPlatform || isCustomLogo ? customColor : null,
        icon_choice: isCustomPlatform ? iconChoice : null,
        glow_enabled: glowEnabled,
        glow_strength: glowStrength,
        glow_color: glowColor,
        custom_icon_url: isCustomPlatform || isCustomLogo ? customIconUrl.trim() || null : null,
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
          {customIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
          ) : PreviewIcon ? (
            <PreviewIcon size={18} color={displayColor} />
          ) : (
            <Link2 size={18} color={displayColor} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-300">{rowLabel}</p>
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
          {isCustomPlatform && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Label</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Shown when someone hovers this icon"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Link URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
            />
          </div>

          {isCustomPlatform ? (
            <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Logo</label>
                <p className="mb-2 text-[11px] text-zinc-600">
                  Upload your own image, or pick one of the standard icons.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02]">
                    {customIconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
                    ) : iconChoice ? (
                      (() => {
                        const ChosenIcon = PLATFORM_ICONS[iconChoice];
                        return <ChosenIcon size={18} color={customColor} />;
                      })()
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
                <div className="mt-2 flex gap-2">
                  {KNOWN_PLATFORMS.map((key) => {
                    const StdIcon = PLATFORM_ICONS[key];
                    const active = iconChoice === key && !customIconUrl;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setIconChoice(key);
                          setCustomIconUrl("");
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                          active
                            ? "border-violet-500/60 bg-violet-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/25"
                        }`}
                        aria-label={`Use ${PLATFORMS[key].label} icon`}
                      >
                        <StdIcon size={16} color={PLATFORMS[key].brandColor} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {iconChoice && !customIconUrl && (
                <ColorField label="Logo Color" value={customColor} onChange={setCustomColor} />
              )}

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
            </div>
          ) : (
            <>
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
            </>
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
