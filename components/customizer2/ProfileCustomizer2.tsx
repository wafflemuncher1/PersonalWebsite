"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { LivePreview } from "@/components/customizer2/LivePreview";
import {
  AudioDropzone,
  ColorField,
  SectionCard,
  Slider,
  ToggleRow,
  UploadTile,
} from "@/components/customizer2/controls";
import {
  BACKGROUND_EFFECTS,
  CURSOR_EFFECTS,
  CUSTOMIZER2_SECTIONS,
  FRAME_PRESETS,
  PROFILE_EFFECTS,
} from "@/lib/customizer-presets";
import type { Customizer2Settings } from "@/lib/types";

function validateImage(file: File, maxMb: number): string | null {
  if (!file.type.startsWith("image/")) return "Must be an image (PNG, JPG, GIF, etc).";
  if (file.size > maxMb * 1024 * 1024) return `Must be under ${maxMb}MB.`;
  return null;
}

function validateAudio(file: File, maxMb: number): string | null {
  if (!file.type.startsWith("audio/")) return "Must be an audio file (MP3, WAV, OGG, etc).";
  if (file.size > maxMb * 1024 * 1024) return `Must be under ${maxMb}MB.`;
  return null;
}

export function ProfileCustomizer2({
  initialSettings,
  profileId,
  displayName,
  username,
}: {
  initialSettings: Customizer2Settings;
  profileId: string | undefined;
  displayName: string;
  username: string;
}) {
  const supabase = createClient();
  const [settings, setSettings] = useState<Customizer2Settings>(initialSettings);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const [cursorUploading, setCursorUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [effectMenuOpen, setEffectMenuOpen] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  function patch(update: Partial<Customizer2Settings>) {
    setSettings((prev) => ({ ...prev, ...update }));
  }
  function patchGlow(update: Partial<Customizer2Settings["glow"]>) {
    setSettings((prev) => ({ ...prev, glow: { ...prev.glow, ...update } }));
  }
  function patchColor(key: keyof Customizer2Settings["colors"], value: string) {
    setSettings((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  }
  function patchToggle(key: keyof Customizer2Settings["toggles"], value: boolean) {
    setSettings((prev) => ({ ...prev, toggles: { ...prev.toggles, [key]: value } }));
  }

  async function uploadTo(
    file: File,
    kind: "avatar" | "background" | "cursor" | "audio",
    setUploading: (v: boolean) => void,
    setUrl: (v: string) => void
  ) {
    if (!profileId) return;
    const problem = kind === "audio" ? validateAudio(file, 15) : validateImage(file, kind === "cursor" ? 1 : 8);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploadError("");
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${profileId}/customizer2-${kind}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  async function handleSave() {
    if (!profileId) return;
    setSaveStatus("saving");
    const { error } = await supabase
      .from("profiles")
      .update({ customizer2_settings: settings })
      .eq("id", profileId);
    setSaveStatus(error ? "error" : "done");
    if (!error) setTimeout(() => setSaveStatus("idle"), 2000);
  }

  const selectedEffect = PROFILE_EFFECTS.find((e) => e.key === settings.profileEffect) ?? PROFILE_EFFECTS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="relative">
        <div className="h-[70vh] rounded-2xl border border-white/10 bg-white/[0.01] p-5 sm:p-6">
          <Swiper
            modules={[Mousewheel, Pagination]}
            direction="vertical"
            mousewheel
            pagination={{
              el: ".c2-pagination",
              clickable: true,
              renderBullet: (index, className) =>
                `<span class="${className}" title="${CUSTOMIZER2_SECTIONS[index] ?? ""}"></span>`,
            }}
            onSlideChange={(s) => setIsEnd(s.isEnd)}
            className="c2-swiper"
          >
            <SwiperSlide>
              <SectionCard title="Background & Avatar" description="GIFs are supported for both.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadTile
                    label="Background"
                    hint="Image or GIF, up to 8MB."
                    previewUrl={settings.backgroundUrl}
                    uploading={backgroundUploading}
                    onUpload={(file) => uploadTo(file, "background", setBackgroundUploading, (v) => patch({ backgroundUrl: v }))}
                    onRemove={() => patch({ backgroundUrl: "" })}
                  />
                  <UploadTile
                    label="Profile Picture"
                    hint="Image or GIF, up to 8MB."
                    previewUrl={settings.avatarUrl}
                    uploading={avatarUploading}
                    onUpload={(file) => uploadTo(file, "avatar", setAvatarUploading, (v) => patch({ avatarUrl: v }))}
                    onRemove={() => patch({ avatarUrl: "" })}
                  />
                </div>
                {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Frame & Cursor">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Profile Frame</label>
                  <select
                    value={settings.frame}
                    onChange={(e) => patch({ frame: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    {FRAME_PRESETS.map((f) => (
                      <option key={f.key} value={f.key} className="bg-ink-950">
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <UploadTile
                  label="Custom Cursor"
                  hint="Small images work best (32–64px). PNG or GIF, up to 1MB. Applies to the preview panel."
                  previewUrl={settings.cursorUrl}
                  uploading={cursorUploading}
                  onUpload={(file) => uploadTo(file, "cursor", setCursorUploading, (v) => patch({ cursorUrl: v }))}
                  onRemove={() => patch({ cursorUrl: "" })}
                />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Cursor Effect</label>
                  <p className="mb-2 text-[11px] text-zinc-600">
                    A trail that follows the mouse — shown to anyone visiting your page, not just you.
                  </p>
                  <select
                    value={settings.cursorEffect}
                    onChange={(e) => patch({ cursorEffect: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    {CURSOR_EFFECTS.map((eff) => (
                      <option key={eff.key} value={eff.key} className="bg-ink-950">
                        {eff.icon} {eff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Opacity, Blur & Effects">
                <Slider label="Profile Opacity" value={settings.opacity} onChange={(v) => patch({ opacity: v })} min={20} max={100} unit="%" />
                <Slider label="Profile Blur" value={settings.blur} onChange={(v) => patch({ blur: v })} min={0} max={20} unit="px" />

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Profile Effect</label>
                  <button
                    type="button"
                    onClick={() => setEffectMenuOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white transition hover:border-violet-500/40"
                  >
                    <span className="flex items-center gap-2">
                      <span>{selectedEffect.icon}</span> {selectedEffect.label}
                    </span>
                    <span className={`text-xs transition-transform duration-200 ${effectMenuOpen ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {effectMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {PROFILE_EFFECTS.map((eff) => (
                            <motion.button
                              key={eff.key}
                              type="button"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                patch({ profileEffect: eff.key });
                                setEffectMenuOpen(false);
                              }}
                              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                                settings.profileEffect === eff.key
                                  ? "border-violet-500/50 bg-violet-500/10"
                                  : "border-white/10 bg-white/[0.02] hover:border-white/25"
                              }`}
                            >
                              <span className="text-xl">{eff.icon}</span>
                              <span className="text-xs font-medium text-zinc-200">{eff.label}</span>
                              <span className="text-[10px] text-zinc-500">{eff.description}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Background Effect</label>
                  <select
                    value={settings.backgroundEffect}
                    onChange={(e) => patch({ backgroundEffect: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50"
                  >
                    {BACKGROUND_EFFECTS.map((eff) => (
                      <option key={eff.key} value={eff.key} className="bg-ink-950">
                        {eff.icon} {eff.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Location & Description">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Location</label>
                  <Input
                    value={settings.location}
                    onChange={(e) => patch({ location: e.target.value })}
                    placeholder="City, country — optional"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
                  <Textarea
                    rows={3}
                    value={settings.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder="A line or two about you."
                  />
                </div>
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Glow Settings" description="Choose what glows using your accent color.">
                <ToggleRow label="Username" checked={settings.glow.username} onChange={(v) => patchGlow({ username: v })} />
                <ToggleRow label="Socials" checked={settings.glow.socials} onChange={(v) => patchGlow({ socials: v })} />
                <ToggleRow label="Badges" checked={settings.glow.badges} onChange={(v) => patchGlow({ badges: v })} />
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Color Customizer">
                <ToggleRow
                  label="Disable Gradients"
                  sub="Use flat Primary/Secondary colors instead of a gradient."
                  checked={settings.disableGradients}
                  onChange={(v) => patch({ disableGradients: v })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ColorField label="Accent Color" value={settings.colors.accent} onChange={(v) => patchColor("accent", v)} />
                  <ColorField label="Text Color" value={settings.colors.text} onChange={(v) => patchColor("text", v)} />
                  <ColorField label="Background Color" value={settings.colors.background} onChange={(v) => patchColor("background", v)} />
                  <ColorField label="Icon Color" value={settings.colors.icon} onChange={(v) => patchColor("icon", v)} />
                  <ColorField
                    label="Background Effect Color"
                    value={settings.colors.backgroundEffect}
                    onChange={(v) => patchColor("backgroundEffect", v)}
                  />
                  <ColorField
                    label="Primary Color"
                    value={settings.colors.primary}
                    onChange={(v) => patchColor("primary", v)}
                    disabled={settings.disableGradients}
                  />
                  <ColorField
                    label="Secondary Color"
                    value={settings.colors.secondary}
                    onChange={(v) => patchColor("secondary", v)}
                    disabled={settings.disableGradients}
                  />
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Per-element text colors
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ColorField label="Name Color" value={settings.colors.name} onChange={(v) => patchColor("name", v)} />
                    <ColorField label="UID Color" value={settings.colors.uid} onChange={(v) => patchColor("uid", v)} />
                    <ColorField
                      label="Location Color"
                      value={settings.colors.location}
                      onChange={(v) => patchColor("location", v)}
                    />
                    <ColorField
                      label="Description Color"
                      value={settings.colors.description}
                      onChange={(v) => patchColor("description", v)}
                    />
                  </div>
                </div>
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Audio" description="Add a track that plays on your profile page.">
                <div>
                  <p className="mb-2 text-sm text-zinc-300">Track</p>
                  <AudioDropzone
                    hint="MP3, WAV, or OGG, up to 15MB."
                    hasFile={!!settings.audioUrl}
                    uploading={audioUploading}
                    onUpload={(file) => uploadTo(file, "audio", setAudioUploading, (v) => patch({ audioUrl: v }))}
                  />
                </div>

                {settings.audioUrl && (
                  <div className="space-y-3">
                    <audio controls src={settings.audioUrl} className="w-full" />
                    <button
                      type="button"
                      onClick={() => patch({ audioUrl: "" })}
                      className="text-xs text-red-400 transition hover:text-red-300"
                    >
                      Remove track
                    </button>
                  </div>
                )}

                <ToggleRow
                  label="Autoplay"
                  sub="Try to play automatically when someone opens your page. Browsers may still block this until they interact with the page."
                  checked={settings.audioAutoplay}
                  onChange={(v) => patch({ audioAutoplay: v })}
                />
                <p className="text-[11px] text-zinc-600">
                  Turn on &quot;Volume Control&quot; in Customization so visitors get a volume slider.
                </p>
              </SectionCard>
            </SwiperSlide>

            <SwiperSlide>
              <SectionCard title="Customization">
                <ToggleRow label="Monochrome Icons" checked={settings.toggles.monochromeIcons} onChange={(v) => patchToggle("monochromeIcons", v)} />
                <ToggleRow label="Animated Title" checked={settings.toggles.animatedTitle} onChange={(v) => patchToggle("animatedTitle", v)} />
                <ToggleRow label="Swap Box Colors" checked={settings.toggles.swapBoxColors} onChange={(v) => patchToggle("swapBoxColors", v)} />
                <ToggleRow label="Volume Control" checked={settings.toggles.volumeControl} onChange={(v) => patchToggle("volumeControl", v)} />
                <ToggleRow
                  label="Use Discord Avatar"
                  sub="Placeholder — Discord isn't connected yet."
                  checked={settings.toggles.useDiscordAvatar}
                  onChange={(v) => patchToggle("useDiscordAvatar", v)}
                />
                <ToggleRow
                  label="Discord Avatar Decoration"
                  sub="Placeholder — Discord isn't connected yet."
                  checked={settings.toggles.discordAvatarDecoration}
                  onChange={(v) => patchToggle("discordAvatarDecoration", v)}
                />
                <ToggleRow
                  label="Show Views & Location"
                  sub="guns.lol style — moves your view count and location into a small corner tag instead of showing location inline."
                  checked={settings.toggles.statsCorner}
                  onChange={(v) => patchToggle("statsCorner", v)}
                />

                <div className="flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    disabled={saveStatus === "saving"}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-60"
                  >
                    {saveStatus === "saving" ? "Saving…" : saveStatus === "done" ? "Saved ✓" : "Save"}
                  </motion.button>
                  {saveStatus === "error" && <p className="text-sm text-red-400">Couldn&apos;t save — try again.</p>}
                </div>
              </SectionCard>
            </SwiperSlide>
          </Swiper>
        </div>

        <div className="c2-pagination pointer-events-none absolute inset-y-0 right-2 z-20 hidden items-center sm:right-3 sm:flex" />

        <AnimatePresence>
          {!isEnd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 6, 0] }}
              exit={{ opacity: 0 }}
              transition={{ y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
              className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center"
            >
              <div className="rounded-full border border-white/10 bg-ink-950/80 px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 backdrop-blur">
                ↓ scroll down for more
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LivePreview settings={settings} displayName={displayName} username={username} />
    </div>
  );
}
