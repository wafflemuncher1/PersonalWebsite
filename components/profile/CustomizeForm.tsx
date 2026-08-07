"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { ProfileCompletionCard } from "@/components/dashboard/ProfileCompletionCard";
import { ColorField, Slider, ToggleRow } from "@/components/customizer2/controls";
import { firstProfaneField } from "@/lib/profanity";
import type { Profile } from "@/lib/types";

function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Must be an image.";
  if (file.size > 5 * 1024 * 1024) return "Must be under 5MB.";
  return null;
}

export function CustomizeForm({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [backgroundUrl, setBackgroundUrl] = useState(profile?.background_url ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [showStats, setShowStats] = useState(profile?.show_stats ?? false);
  const [layout, setLayout] = useState<"top" | "side">(profile?.layout ?? "top");
  const [bgType, setBgType] = useState<"solid" | "gradient">(profile?.bg_type ?? "solid");
  const [bgColor, setBgColor] = useState(profile?.bg_color ?? "#000000");
  const [bgColor2, setBgColor2] = useState(profile?.bg_color_2 ?? "#4c1d95");
  const [nameColor, setNameColor] = useState(profile?.name_color ?? "#111111");
  const [nameAnimated, setNameAnimated] = useState(profile?.name_animated ?? false);
  const [cardColor, setCardColor] = useState(profile?.card_color ?? "#ffffff");
  const [cardOpacity, setCardOpacity] = useState(profile?.card_opacity ?? 100);
  const [cardBorderColor, setCardBorderColor] = useState(profile?.card_border_color ?? "#e5e7eb");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function uploadTo(
    file: File,
    kind: "avatar" | "background",
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void
  ) {
    if (!profile) return;
    const problem = validateImage(file);
    if (problem) {
      setStatus("error");
      setError(problem);
      return;
    }
    setError("");
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
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

    const badField = firstProfaneField({ bio: cleanBio, location: cleanLocation });
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
        bio: cleanBio,
        location: cleanLocation,
        show_stats: showStats,
        layout,
        bg_type: bgType,
        bg_color: bgColor,
        bg_color_2: bgColor2,
        name_color: nameColor,
        name_animated: nameAnimated,
        card_color: cardColor,
        card_opacity: cardOpacity,
        card_border_color: cardBorderColor,
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
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Customize</h1>

      <ProfileCompletionCard profile={profile} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Assets</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AssetTile
            label="Background"
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
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">General</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
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

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A line or two about you."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country — optional"
            />
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
        </div>

      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Appearance</h2>

        <div className="space-y-5">
          <ToggleRow
            label="Gradient Background"
            sub="Blend two colors instead of one flat color."
            checked={bgType === "gradient"}
            onChange={(v) => setBgType(v ? "gradient" : "solid")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Background Color" value={bgColor} onChange={setBgColor} />
            <ColorField
              label="Background Color 2"
              value={bgColor2}
              onChange={setBgColor2}
              disabled={bgType !== "gradient"}
            />
          </div>

          <div className="border-t border-white/5 pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Display Name Color" value={nameColor} onChange={setNameColor} />
            </div>
            <div className="mt-3">
              <ToggleRow
                label="Animate Display Name"
                sub="Types itself out in a loop instead of sitting still."
                checked={nameAnimated}
                onChange={setNameAnimated}
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Profile Box</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Box Color" value={cardColor} onChange={setCardColor} />
              <ColorField label="Box Outline Color" value={cardBorderColor} onChange={setCardBorderColor} />
            </div>
            <div className="mt-4">
              <Slider label="Box Transparency" value={cardOpacity} onChange={setCardOpacity} min={0} max={100} unit="%" />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {status === "error" && <p className="text-sm text-red-400">{error}</p>}
          {status === "done" && <p className="text-sm text-emerald-400">Saved.</p>}
          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AssetTile({
  label,
  previewUrl,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  previewUrl: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const ext = previewUrl.split("?")[0].split(".").pop();

  return (
    <div>
      <p className="mb-2 text-sm text-zinc-300">{label}</p>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <label className="flex h-full w-full cursor-pointer items-center justify-center transition hover:bg-white/[0.03]">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <span className="text-2xl">+</span>
              <span className="text-xs">Click to upload</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
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
