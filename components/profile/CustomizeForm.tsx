"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
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
    <div className="max-w-2xl space-y-6">
      {/* Banner + avatar preview */}
      <Card className="overflow-hidden p-0">
        <div
          className="relative flex h-36 items-end bg-gradient-to-br from-violet-950 via-ink-900 to-ink-950 bg-cover bg-center px-6 pb-4"
          style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative flex items-center gap-4">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full object-cover ring-4 ring-ink-950"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-500 text-xl font-semibold text-white ring-4 ring-ink-950">
                {(profile.display_name || profile.username).trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          <label className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.08]">
            {bgUploading ? "Uploading…" : "Change background"}
            <input
              type="file"
              accept="image/*"
              disabled={bgUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadTo(file, "background", setBgUploading, setBackgroundUrl);
              }}
              className="hidden"
            />
          </label>
          {backgroundUrl && (
            <button
              type="button"
              onClick={() => setBackgroundUrl("")}
              className="rounded-lg border border-white/10 px-3.5 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-red-300"
            >
              Remove background
            </button>
          )}
          <label className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.08]">
            {avatarUploading ? "Uploading…" : "Change profile picture"}
            <input
              type="file"
              accept="image/*"
              disabled={avatarUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) uploadTo(file, "avatar", setAvatarUploading, setAvatarUrl);
              }}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      {/* Description + location */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-white">About</h2>
        <div className="space-y-4">
          <div>
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
              <p className="text-xs text-zinc-500">
                Goals completed, active streaks, check-ins — aggregate counts only.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-white/5 accent-violet-500"
            />
          </label>

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
