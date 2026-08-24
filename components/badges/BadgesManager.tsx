"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ColorField, Slider, ToggleRow } from "@/components/customizer2/controls";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { badgeIcon } from "@/lib/badge-icons";
import type { BadgeDef, ProfileBadge } from "@/lib/types";

const EQUIP_LIMIT = 5;

export function BadgesManager({ defs, earned: initialEarned }: { defs: BadgeDef[]; earned: ProfileBadge[] }) {
  const supabase = createClient();
  const [earned, setEarned] = useState<ProfileBadge[]>(initialEarned);
  const [error, setError] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const equippedCount = earned.filter((e) => e.equipped).length;
  const earnedMap = new Map(earned.map((e) => [e.badge_key, e]));

  async function toggleEquip(row: ProfileBadge) {
    setError("");
    const turningOn = !row.equipped;
    if (turningOn && equippedCount >= EQUIP_LIMIT) {
      setError(`You can only equip up to ${EQUIP_LIMIT} badges at once.`);
      return;
    }
    const { data, error: updateError } = await supabase
      .from("profile_badges")
      .update({ equipped: turningOn })
      .eq("id", row.id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEarned((prev) => prev.map((e) => (e.id === row.id ? (data as ProfileBadge) : e)));
  }

  function handleSaved(updated: ProfileBadge) {
    setEarned((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingKey(null);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <p className="text-xs text-zinc-500">
          {equippedCount}/{EQUIP_LIMIT} equipped
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </Reveal>

      <RevealGroup className="space-y-3" stagger={0.05}>
        {defs.map((def) => {
          const row = earnedMap.get(def.key);
          const isEarned = !!row;
          const Icon = badgeIcon(def.icon);
          const isEditing = editingKey === def.key;

          return (
            <RevealItem key={def.key}>
              <Card
                className={`overflow-hidden transition duration-200 ease-premium ${!isEarned ? "opacity-50" : "hover:-translate-y-0.5 hover:shadow-elevate-hover"}`}
              >
                <div className="flex items-center gap-4 p-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-shadow duration-300"
                    style={row?.glow_enabled ? { boxShadow: `0 0 ${4 + (row.glow_strength / 100) * 16}px ${row.glow_color}` } : undefined}
                  >
                    <Icon className="h-5 w-5" color={row?.color || "#c4b5fd"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{def.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{def.description}</p>
                    {!isEarned && <p className="mt-1 text-[11px] text-zinc-600">Not yet earned</p>}
                  </div>

                  {row && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingKey(isEditing ? null : def.key)}
                        className="shrink-0 rounded-md p-1.5 text-zinc-500 transition duration-150 hover:scale-110 hover:bg-white/5 hover:text-zinc-300 active:scale-95"
                        aria-label="Edit badge appearance"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.equipped}
                        onClick={() => toggleEquip(row)}
                        aria-label={row.equipped ? "Unequip badge" : "Equip badge"}
                        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 active:scale-95 ${
                          row.equipped ? "bg-violet-500 shadow-[0_0_8px_-1px_rgba(139,92,246,0.7)]" : "bg-white/10"
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-premium"
                          style={{ transform: row.equipped ? "translateX(20px)" : "translateX(0)" }}
                        />
                      </button>
                    </>
                  )}
                </div>

                {isEditing && row && (
                  <BadgeEditPanel row={row} onSaved={handleSaved} onCancel={() => setEditingKey(null)} />
                )}
              </Card>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}

function BadgeEditPanel({
  row,
  onSaved,
  onCancel,
}: {
  row: ProfileBadge;
  onSaved: (updated: ProfileBadge) => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [color, setColor] = useState(row.color || "#c4b5fd");
  const [size, setSize] = useState(row.size);
  const [glowEnabled, setGlowEnabled] = useState(row.glow_enabled);
  const [glowStrength, setGlowStrength] = useState(row.glow_strength);
  const [glowColor, setGlowColor] = useState(row.glow_color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("profile_badges")
      .update({
        color,
        size,
        glow_enabled: glowEnabled,
        glow_strength: glowStrength,
        glow_color: glowColor,
      })
      .eq("id", row.id)
      .select()
      .single();
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    onSaved(data as ProfileBadge);
  }

  return (
    <div className="space-y-4 border-t border-white/5 p-4">
      <ColorField label="Badge Color" value={color} onChange={setColor} />
      <Slider label="Badge Size" value={size} onChange={setSize} min={16} max={40} unit="px" />

      <ToggleRow label="Glow" checked={glowEnabled} onChange={setGlowEnabled} />
      {glowEnabled && (
        <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.015] p-3.5">
          <Slider label="Glow Strength" value={glowStrength} onChange={setGlowStrength} min={0} max={100} unit="%" />
          <ColorField label="Glow Color" value={glowColor} onChange={setGlowColor} />
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-3 text-sm text-zinc-400 hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
