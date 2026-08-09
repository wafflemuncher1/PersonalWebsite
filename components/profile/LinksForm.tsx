"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook } from "react-icons/fa6";
import { ArrowLeft, Link2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ColorField, Slider, ToggleRow } from "@/components/customizer2/controls";
import {
  PLATFORMS,
  validatePlatformUrl,
  type Platform,
  type KnownPlatform,
} from "@/lib/link-validation";
import type { Profile, ProfileLinkItem } from "@/lib/types";

const TOTAL_LIMIT = 12;
const ACTIVE_LIMIT = 8;

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
  const [creating, setCreating] = useState(false);
  const [editingLink, setEditingLink] = useState<ProfileLinkItem | null>(null);
  const [toggleError, setToggleError] = useState("");

  const activeCount = links.filter((l) => l.is_active).length;

  function handleCreated(link: ProfileLinkItem) {
    setLinks((prev) => [...prev, link]);
    setCreating(false);
  }

  function handleUpdated(updated: ProfileLinkItem) {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setEditingLink(null);
  }

  async function handleToggleActive(link: ProfileLinkItem) {
    setToggleError("");
    const turningOn = !link.is_active;
    if (turningOn && activeCount >= ACTIVE_LIMIT) {
      setToggleError(`You already have ${ACTIVE_LIMIT} active links. Turn one off first.`);
      return;
    }
    const { data, error } = await supabase
      .from("profile_links")
      .update({ is_active: turningOn })
      .eq("id", link.id)
      .select()
      .single();
    if (error) {
      setToggleError(error.message);
      return;
    }
    setLinks((prev) => prev.map((l) => (l.id === link.id ? (data as ProfileLinkItem) : l)));
  }

  async function handleDelete(link: ProfileLinkItem) {
    const { error } = await supabase.from("profile_links").delete().eq("id", link.id);
    if (error) {
      setToggleError(error.message);
      return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Links</h1>
      <p className="-mt-4 text-sm text-zinc-500">
        Up to {TOTAL_LIMIT} links total — {ACTIVE_LIMIT} can be active on your public page at once.
      </p>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">Your links</h2>
            <p className="text-xs text-zinc-500">
              {activeCount}/{ACTIVE_LIMIT} active · {links.length}/{TOTAL_LIMIT} total
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={links.length >= TOTAL_LIMIT}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Create a link
          </button>
        </div>

        {toggleError && <p className="mb-3 text-xs text-red-400">{toggleError}</p>}

        {links.length === 0 ? (
          <p className="text-sm text-zinc-600">No links yet.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <LinkListRow
                key={link.id}
                link={link}
                onToggle={() => handleToggleActive(link)}
                onEdit={() => setEditingLink(link)}
                onDelete={() => handleDelete(link)}
              />
            ))}
          </div>
        )}

        {links.length >= TOTAL_LIMIT && (
          <p className="mt-3 text-xs text-zinc-600">You&apos;ve reached the {TOTAL_LIMIT} link limit.</p>
        )}
      </Card>

      <AnimatePresence>
        {creating && (
          <CreateLinkModal
            profile={profile}
            activeCount={activeCount}
            sortOrder={links.length}
            onClose={() => setCreating(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingLink && (
          <EditLinkModal
            profileId={profile.id}
            link={editingLink}
            onClose={() => setEditingLink(null)}
            onSaved={handleUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkListRow({
  link,
  onToggle,
  onEdit,
  onDelete,
}: {
  link: ProfileLinkItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isCustom = link.platform === "custom";
  const Icon = link.icon_choice
    ? PLATFORM_ICONS[link.icon_choice]
    : !isCustom
      ? PLATFORM_ICONS[link.platform as KnownPlatform]
      : null;
  const color = link.custom_color || (isCustom ? PLATFORMS.custom.brandColor : PLATFORMS[link.platform].brandColor);
  const label = isCustom ? link.label?.trim() || "Custom Link" : PLATFORMS[link.platform].label;
  const hasCustomImage = link.is_custom_logo && !!link.custom_icon_url;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition ${
        link.is_active ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"
      }`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5"
        style={link.glow_enabled ? { boxShadow: `0 0 ${4 + (link.glow_strength / 100) * 16}px ${link.glow_color}` } : undefined}
      >
        {hasCustomImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={link.custom_icon_url ?? ""} alt="" className="h-full w-full object-cover" />
        ) : Icon ? (
          <Icon size={18} color={color} />
        ) : (
          <Link2 size={18} color={color} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-300">{label}</p>
        <p className="truncate text-[11px] text-zinc-600">{link.url}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={link.is_active}
        onClick={onToggle}
        aria-label={link.is_active ? "Turn off" : "Turn on"}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          link.is_active ? "bg-violet-500" : "bg-white/10"
        }`}
      >
        <span
          className="h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: link.is_active ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
        aria-label="Edit link"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-300"
        aria-label="Delete link"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ModalShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-ink-950 p-5 shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function PlatformPickerIcon({ platform, onClick }: { platform: Platform; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        type="button"
        onClick={onClick}
        aria-label={PLATFORMS[platform].label}
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
      >
        {platform === "custom" ? (
          <Link2 size={24} color={PLATFORMS.custom.brandColor} />
        ) : (
          (() => {
            const Icon = PLATFORM_ICONS[platform];
            return <Icon size={24} color={PLATFORMS[platform].brandColor} />;
          })()
        )}
      </button>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[11px] text-white backdrop-blur"
          >
            {PLATFORMS[platform].label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shared field set used by both the create flow's step 2 and the edit
// modal — same options either way, just a different platform picker (or
// none) around it.
function LinkFormFields({
  platform,
  url,
  setUrl,
  label,
  setLabel,
  color,
  setColor,
  useCustomIcon,
  setUseCustomIcon,
  customIconUrl,
  onIconUpload,
  onRemoveIcon,
  iconUploading,
  glowEnabled,
  setGlowEnabled,
  glowStrength,
  setGlowStrength,
  glowColor,
  setGlowColor,
}: {
  platform: Platform;
  url: string;
  setUrl: (v: string) => void;
  label: string;
  setLabel: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  useCustomIcon: boolean;
  setUseCustomIcon: (v: boolean) => void;
  customIconUrl: string;
  onIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveIcon: () => void;
  iconUploading: boolean;
  glowEnabled: boolean;
  setGlowEnabled: (v: boolean) => void;
  glowStrength: number;
  setGlowStrength: (v: number) => void;
  glowColor: string;
  setGlowColor: (v: string) => void;
}) {
  const isCustom = platform === "custom";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02]">
          {useCustomIcon && customIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
          ) : isCustom ? (
            <Link2 size={20} color={color} />
          ) : (
            (() => {
              const Icon = PLATFORM_ICONS[platform as KnownPlatform];
              return <Icon size={20} color={color} />;
            })()
          )}
        </div>
        <input
          autoFocus
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={PLATFORMS[platform].hint}
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
        />
      </div>

      {isCustom && (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Name (shown on hover) — optional"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
        />
      )}

      <ColorField label="Logo Color" value={color} onChange={setColor} disabled={useCustomIcon && !!customIconUrl} />

      <ToggleRow
        label="Custom Icon"
        sub="Upload your own image instead of the logo above."
        checked={useCustomIcon}
        onChange={setUseCustomIcon}
      />
      {useCustomIcon && (
        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.02]">
            {customIconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={customIconUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Upload className="h-4 w-4 text-zinc-600" />
            )}
          </div>
          <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
            {iconUploading ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" className="hidden" onChange={onIconUpload} disabled={iconUploading} />
          </label>
          {customIconUrl && (
            <button
              type="button"
              onClick={onRemoveIcon}
              className="rounded-lg border border-white/10 p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300"
              aria-label="Remove custom icon"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <ToggleRow label="Glow" checked={glowEnabled} onChange={setGlowEnabled} />
      {glowEnabled && (
        <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
          <Slider label="Glow Strength" value={glowStrength} onChange={setGlowStrength} min={0} max={100} unit="%" />
          <ColorField label="Glow Color" value={glowColor} onChange={setGlowColor} />
        </div>
      )}
    </div>
  );
}

function CreateLinkModal({
  profile,
  activeCount,
  sortOrder,
  onClose,
  onCreated,
}: {
  profile: Profile;
  activeCount: number;
  sortOrder: number;
  onClose: () => void;
  onCreated: (link: ProfileLinkItem) => void;
}) {
  const supabase = createClient();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  const [useCustomIcon, setUseCustomIcon] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState("");
  const [iconUploading, setIconUploading] = useState(false);
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [glowStrength, setGlowStrength] = useState(50);
  const [glowColor, setGlowColor] = useState("#8b5cf6");
  const [linkId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function selectPlatform(p: Platform) {
    setPlatform(p);
    setColor(PLATFORMS[p].brandColor);
  }

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
    const path = `${profile.id}/link-icon-${linkId}.${ext}`;
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

  async function handleDone() {
    if (!platform) return;
    const problem = validatePlatformUrl(platform, url);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("profile_links")
      .insert({
        id: linkId,
        profile_id: profile.id,
        platform,
        url: url.trim(),
        label: platform === "custom" ? label.trim() || null : null,
        custom_color: color,
        is_custom_logo: useCustomIcon && !!customIconUrl,
        custom_icon_url: useCustomIcon && customIconUrl ? customIconUrl : null,
        icon_choice: null,
        glow_enabled: glowEnabled,
        glow_strength: glowStrength,
        glow_color: glowColor,
        is_active: activeCount < ACTIVE_LIMIT,
        sort_order: sortOrder,
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onCreated(data as ProfileLinkItem);
  }

  return (
    <ModalShell onClose={onClose}>
      {!platform ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Choose a platform</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {(Object.keys(PLATFORMS) as Platform[]).map((key) => (
              <PlatformPickerIcon key={key} platform={key} onClick={() => selectPlatform(key)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPlatform(null)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <LinkFormFields
            platform={platform}
            url={url}
            setUrl={setUrl}
            label={label}
            setLabel={setLabel}
            color={color}
            setColor={setColor}
            useCustomIcon={useCustomIcon}
            setUseCustomIcon={setUseCustomIcon}
            customIconUrl={customIconUrl}
            onIconUpload={handleIconUpload}
            onRemoveIcon={() => setCustomIconUrl("")}
            iconUploading={iconUploading}
            glowEnabled={glowEnabled}
            setGlowEnabled={setGlowEnabled}
            glowStrength={glowStrength}
            setGlowStrength={setGlowStrength}
            glowColor={glowColor}
            setGlowColor={setGlowColor}
          />

          {activeCount >= ACTIVE_LIMIT && (
            <p className="mt-3 text-[11px] text-amber-400">
              You already have {ACTIVE_LIMIT} active links — this one will save as off. Turn another off to
              activate it.
            </p>
          )}
          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          <Button className="mt-4 w-full" onClick={handleDone} disabled={saving}>
            {saving ? "Saving…" : "Done"}
          </Button>
        </>
      )}
    </ModalShell>
  );
}

function EditLinkModal({
  profileId,
  link,
  onClose,
  onSaved,
}: {
  profileId: string;
  link: ProfileLinkItem;
  onClose: () => void;
  onSaved: (l: ProfileLinkItem) => void;
}) {
  const supabase = createClient();
  const [url, setUrl] = useState(link.url);
  const [label, setLabel] = useState(link.label ?? "");
  const [color, setColor] = useState(link.custom_color || PLATFORMS[link.platform].brandColor);
  const [useCustomIcon, setUseCustomIcon] = useState(link.is_custom_logo && !!link.custom_icon_url);
  const [customIconUrl, setCustomIconUrl] = useState(link.custom_icon_url ?? "");
  const [iconUploading, setIconUploading] = useState(false);
  const [glowEnabled, setGlowEnabled] = useState(link.glow_enabled);
  const [glowStrength, setGlowStrength] = useState(link.glow_strength);
  const [glowColor, setGlowColor] = useState(link.glow_color);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    const problem = validatePlatformUrl(link.platform, url);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("profile_links")
      .update({
        url: url.trim(),
        label: link.platform === "custom" ? label.trim() || null : null,
        custom_color: color,
        is_custom_logo: useCustomIcon && !!customIconUrl,
        custom_icon_url: useCustomIcon && customIconUrl ? customIconUrl : null,
        icon_choice: null,
        glow_enabled: glowEnabled,
        glow_strength: glowStrength,
        glow_color: glowColor,
      })
      .eq("id", link.id)
      .select()
      .single();
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onSaved(data as ProfileLinkItem);
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Edit link</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <LinkFormFields
        platform={link.platform}
        url={url}
        setUrl={setUrl}
        label={label}
        setLabel={setLabel}
        color={color}
        setColor={setColor}
        useCustomIcon={useCustomIcon}
        setUseCustomIcon={setUseCustomIcon}
        customIconUrl={customIconUrl}
        onIconUpload={handleIconUpload}
        onRemoveIcon={() => setCustomIconUrl("")}
        iconUploading={iconUploading}
        glowEnabled={glowEnabled}
        setGlowEnabled={setGlowEnabled}
        glowStrength={glowStrength}
        setGlowStrength={setGlowStrength}
        glowColor={glowColor}
        setGlowColor={setGlowColor}
      />

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      <Button className="mt-4 w-full" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </ModalShell>
  );
}
