"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ArrowDown, Pencil, Plus, ShoppingBag, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/profile/ui/Card";
import { Input, Textarea } from "@/components/profile/ui/Input";
import { ColorField, Slider, ToggleRow } from "@/components/customizer2/controls";
import { Reveal } from "@/components/ui/Reveal";
import { validatePlatformUrl } from "@/lib/link-validation";
import { FONT_OPTIONS, type FontKey } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Profile, ShopItem } from "@/lib/types";

const TOTAL_LIMIT = 20;
const NAME_MAX = 40;
const DESC_MAX = 150;

function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Must be an image.";
  if (file.size > 5 * 1024 * 1024) return "Must be under 5MB.";
  return null;
}

export function ShopForm({
  profile,
  initialItems,
}: {
  profile: Profile | null;
  initialItems: ShopItem[];
}) {
  const supabase = createClient();
  const [items, setItems] = useState<ShopItem[]>(initialItems);
  const [creating, setCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [listError, setListError] = useState("");

  // Style fields — saved independently from the item list via their own
  // button, same pattern as the About Me box controls in CustomizeForm.
  const [shopEnabled, setShopEnabled] = useState(profile?.shop_enabled ?? true);
  const [shopTitle, setShopTitle] = useState(profile?.shop_title ?? "Shop");
  const [boxColor, setBoxColor] = useState(profile?.shop_box_color ?? "#ffffff");
  const [boxOpacity, setBoxOpacity] = useState(profile?.shop_box_opacity ?? 100);
  const [outlineEnabled, setOutlineEnabled] = useState(profile?.shop_box_outline_enabled ?? true);
  const [outlineWidth, setOutlineWidth] = useState(profile?.shop_box_outline_width ?? 1);
  const [borderColor, setBorderColor] = useState(profile?.shop_box_border_color ?? "#e5e7eb");
  const [nameColor, setNameColor] = useState(profile?.shop_name_color ?? "#ffffff");
  const [descColor, setDescColor] = useState(profile?.shop_desc_color ?? "#a1a1aa");
  const [textFont, setTextFont] = useState<FontKey>((profile?.shop_text_font as FontKey) ?? "default");
  const [styleStatus, setStyleStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [styleError, setStyleError] = useState("");

  function handleCreated(item: ShopItem) {
    setItems((prev) => [...prev, item]);
    setCreating(false);
  }

  function handleUpdated(updated: ShopItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
  }

  async function handleToggleActive(item: ShopItem) {
    setListError("");
    const { data, error } = await supabase
      .from("profile_shop_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id)
      .select()
      .single();
    if (error) {
      setListError(error.message);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? (data as ShopItem) : i)));
  }

  async function handleDelete(item: ShopItem) {
    const { error } = await supabase.from("profile_shop_items").delete().eq("id", item.id);
    if (error) {
      setListError(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function handleReorder(item: ShopItem, direction: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    setListError("");
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profile_shop_items").update({ sort_order: other.sort_order }).eq("id", item.id),
      supabase.from("profile_shop_items").update({ sort_order: item.sort_order }).eq("id", other.id),
    ]);
    if (e1 || e2) {
      setListError((e1 ?? e2)?.message ?? "Couldn't reorder.");
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) return { ...i, sort_order: other.sort_order };
        if (i.id === other.id) return { ...i, sort_order: item.sort_order };
        return i;
      })
    );
  }

  async function handleSaveStyle() {
    if (!profile) return;
    setStyleStatus("saving");
    setStyleError("");
    const { error } = await supabase
      .from("profiles")
      .update({
        shop_enabled: shopEnabled,
        shop_title: shopTitle.trim() || "Shop",
        shop_box_color: boxColor,
        shop_box_opacity: boxOpacity,
        shop_box_outline_enabled: outlineEnabled,
        shop_box_outline_width: outlineWidth,
        shop_box_border_color: borderColor,
        shop_name_color: nameColor,
        shop_desc_color: descColor,
        shop_text_font: textFont,
      })
      .eq("id", profile.id);
    if (error) {
      setStyleStatus("error");
      setStyleError(error.message);
      return;
    }
    setStyleStatus("done");
    setTimeout(() => setStyleStatus("idle"), 2000);
  }

  if (!profile) return null;

  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Shop</h1>
        <p className="mt-1 text-sm text-zinc-500">
          A linktree-style row of items visitors can browse and click through to buy — shown as its own page
          when someone scrolls down on your profile.
        </p>
      </Reveal>

      <Card className="space-y-4 p-6">
        <h2 className="text-sm font-medium text-white">Style</h2>
        <ToggleRow
          label="Show Shop on Public Profile"
          sub="Turn this off to remove the Shop page from your public profile entirely."
          checked={shopEnabled}
          onChange={setShopEnabled}
        />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Page Title</label>
          <Input
            value={shopTitle}
            onChange={(e) => setShopTitle(e.target.value)}
            placeholder="Shop"
            maxLength={40}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Font</label>
          <select
            value={textFont}
            onChange={(e) => setTextFont(e.target.value as FontKey)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/50 sm:w-64"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key} className={cn("bg-ink-950", f.className)}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <ColorField label="Item Name Color" value={nameColor} onChange={setNameColor} />
        <ColorField label="Item Description Color" value={descColor} onChange={setDescColor} />
        <div className="border-t border-white/5 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Item Box</p>
          <div className="space-y-4">
            <ColorField label="Box Color" value={boxColor} onChange={setBoxColor} />
            <Slider label="Box Transparency" value={boxOpacity} onChange={setBoxOpacity} min={0} max={100} unit="%" />
            <ToggleRow label="Box Outline" checked={outlineEnabled} onChange={setOutlineEnabled} />
            {outlineEnabled && (
              <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
                <Slider
                  label="Outline Width"
                  value={outlineWidth}
                  onChange={setOutlineWidth}
                  min={1}
                  max={8}
                  unit="px"
                />
                <ColorField label="Outline Color" value={borderColor} onChange={setBorderColor} />
              </div>
            )}
          </div>
        </div>
        {styleStatus === "error" && <p className="text-xs text-red-400">{styleError}</p>}
        {styleStatus === "done" && <p className="text-xs text-emerald-400">Saved.</p>}
        <Button onClick={handleSaveStyle} disabled={styleStatus === "saving"}>
          {styleStatus === "saving" ? "Saving…" : "Save style"}
        </Button>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">Your items</h2>
            <p className="text-xs text-zinc-500">{items.length}/{TOTAL_LIMIT} items</p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={items.length >= TOTAL_LIMIT}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 transition duration-200 ease-premium hover:bg-violet-500/20 hover:shadow-[0_0_12px_-4px_rgba(212,169,79,0.6)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        {listError && <p className="mb-3 text-xs text-red-400">{listError}</p>}

        {sortedItems.length === 0 ? (
          <p className="text-sm text-zinc-600">No items yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((item, idx) => (
              <ShopItemRow
                key={item.id}
                item={item}
                canMoveUp={idx > 0}
                canMoveDown={idx < sortedItems.length - 1}
                onMove={(dir) => handleReorder(item, dir)}
                onToggle={() => handleToggleActive(item)}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )}

        {items.length >= TOTAL_LIMIT && (
          <p className="mt-3 text-xs text-zinc-600">You&apos;ve reached the {TOTAL_LIMIT} item limit.</p>
        )}
      </Card>

      <AnimatePresence>
        {creating && (
          <CreateShopItemModal
            profile={profile}
            sortOrder={items.length}
            onClose={() => setCreating(false)}
            onCreated={handleCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingItem && (
          <EditShopItemModal
            profileId={profile.id}
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSaved={handleUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ShopItemRow({
  item,
  canMoveUp,
  canMoveDown,
  onMove,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ShopItem;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (dir: -1 | 1) => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-elevate-hover ${
        item.is_active ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-60"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ShoppingBag className="h-4 w-4 text-zinc-600" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-zinc-300">{item.name || "Untitled item"}</p>
        <p className="truncate text-[11px] text-zinc-600">{item.link_url}</p>
      </div>

      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={!canMoveUp}
          className="rounded p-0.5 text-zinc-600 transition duration-150 hover:scale-110 hover:text-zinc-300 disabled:opacity-20 disabled:hover:scale-100"
          aria-label="Move up"
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={!canMoveDown}
          className="rounded p-0.5 text-zinc-600 transition duration-150 hover:scale-110 hover:text-zinc-300 disabled:opacity-20 disabled:hover:scale-100"
          aria-label="Move down"
        >
          <ArrowDown className="h-3 w-3" />
        </button>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={item.is_active}
        onClick={onToggle}
        aria-label={item.is_active ? "Turn off" : "Turn on"}
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 active:scale-95 ${
          item.is_active ? "bg-violet-500 shadow-[0_0_8px_-1px_rgba(212,169,79,0.7)]" : "bg-white/10"
        }`}
      >
        <span
          className="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-premium"
          style={{ transform: item.is_active ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-md p-1.5 text-zinc-500 transition duration-150 hover:scale-110 hover:bg-white/5 hover:text-zinc-300 active:scale-95"
        aria-label="Edit item"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded-md p-1.5 text-zinc-500 transition duration-150 hover:scale-110 hover:bg-red-500/10 hover:text-red-300 active:scale-95"
        aria-label="Delete item"
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

// Shared field set used by both create and edit modals.
function ShopItemFields({
  imageUrl,
  onImageUpload,
  onRemoveImage,
  imageUploading,
  name,
  setName,
  description,
  setDescription,
  linkUrl,
  setLinkUrl,
}: {
  imageUrl: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  imageUploading: boolean;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  linkUrl: string;
  setLinkUrl: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Upload className="h-4 w-4 text-zinc-600" />
          )}
        </div>
        <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
          {imageUploading ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} disabled={imageUploading} />
        </label>
        {imageUrl && (
          <button
            type="button"
            onClick={onRemoveImage}
            className="rounded-lg border border-white/10 p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Signed poster" maxLength={NAME_MAX} />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
          placeholder="A short line about this item."
          maxLength={DESC_MAX}
        />
        <p className="mt-1 text-right text-[11px] text-zinc-600">{description.length}/{DESC_MAX}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Link</label>
        <Input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://your-store.com/item"
        />
      </div>
    </div>
  );
}

function CreateShopItemModal({
  profile,
  sortOrder,
  onClose,
  onCreated,
}: {
  profile: Profile;
  sortOrder: number;
  onClose: () => void;
  onCreated: (item: ShopItem) => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [itemId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }
    setImageUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${profile.id}/shop-item-${itemId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setError(uploadError.message);
      setImageUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setImageUrl(`${data.publicUrl}?t=${Date.now()}`);
    setImageUploading(false);
  }

  async function handleDone() {
    const problem = validatePlatformUrl("custom", linkUrl);
    if (problem) {
      setError(problem);
      return;
    }
    if (!name.trim()) {
      setError("Give this item a name.");
      return;
    }
    setError("");
    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("profile_shop_items")
      .insert({
        id: itemId,
        profile_id: profile.id,
        image_url: imageUrl,
        name: name.trim(),
        description: description.trim(),
        link_url: linkUrl.trim(),
        is_active: true,
        sort_order: sortOrder,
      })
      .select()
      .single();
    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onCreated(data as ShopItem);
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Add shop item</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ShopItemFields
        imageUrl={imageUrl}
        onImageUpload={handleImageUpload}
        onRemoveImage={() => setImageUrl("")}
        imageUploading={imageUploading}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
      />

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      <Button className="mt-4 w-full" onClick={handleDone} disabled={saving}>
        {saving ? "Saving…" : "Add item"}
      </Button>
    </ModalShell>
  );
}

function EditShopItemModal({
  profileId,
  item,
  onClose,
  onSaved,
}: {
  profileId: string;
  item: ShopItem;
  onClose: () => void;
  onSaved: (i: ShopItem) => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [linkUrl, setLinkUrl] = useState(item.link_url);
  const [imageUrl, setImageUrl] = useState(item.image_url);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }
    setImageUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${profileId}/shop-item-${item.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setError(uploadError.message);
      setImageUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setImageUrl(`${data.publicUrl}?t=${Date.now()}`);
    setImageUploading(false);
  }

  async function handleSave() {
    const problem = validatePlatformUrl("custom", linkUrl);
    if (problem) {
      setError(problem);
      return;
    }
    if (!name.trim()) {
      setError("Give this item a name.");
      return;
    }
    setError("");
    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("profile_shop_items")
      .update({
        image_url: imageUrl,
        name: name.trim(),
        description: description.trim(),
        link_url: linkUrl.trim(),
      })
      .eq("id", item.id)
      .select()
      .single();
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onSaved(data as ShopItem);
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Edit item</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ShopItemFields
        imageUrl={imageUrl}
        onImageUpload={handleImageUpload}
        onRemoveImage={() => setImageUrl("")}
        imageUploading={imageUploading}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
      />

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      <Button className="mt-4 w-full" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </ModalShell>
  );
}
