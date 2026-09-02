"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ColorField, Slider, ToggleRow } from "@/components/shared/controls";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
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
        <p className="text-xs text-muted-foreground">
          {equippedCount}/{EQUIP_LIMIT} equipped
        </p>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
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
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-premium",
                  !isEarned ? "opacity-50" : "hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-center gap-4 px-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-muted/40 transition-shadow duration-300"
                    style={row?.glow_enabled ? { boxShadow: `0 0 ${4 + (row.glow_strength / 100) * 16}px ${row.glow_color}` } : undefined}
                  >
                    <Icon className="h-5 w-5" color={row?.color || "#c4b5fd"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{def.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{def.description}</p>
                    {!isEarned && <p className="mt-1 text-[11px] text-muted-foreground/70">Not yet earned</p>}
                  </div>

                  {row && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingKey(isEditing ? null : def.key)}
                        aria-label="Edit badge appearance"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Switch
                        checked={row.equipped}
                        onCheckedChange={() => toggleEquip(row)}
                        aria-label={row.equipped ? "Unequip badge" : "Equip badge"}
                      />
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
    <div className="mt-4 space-y-4 border-t px-4 pt-4 pb-4">
      <ColorField label="Badge Color" value={color} onChange={setColor} />
      <Slider label="Badge Size" value={size} onChange={setSize} min={16} max={40} unit="px" />

      <ToggleRow label="Glow" checked={glowEnabled} onChange={setGlowEnabled} />
      {glowEnabled && (
        <div className="space-y-4 rounded-lg border bg-muted/20 p-3.5">
          <Slider label="Glow Strength" value={glowStrength} onChange={setGlowStrength} min={0} max={100} unit="%" />
          <ColorField label="Glow Color" value={glowColor} onChange={setGlowColor} />
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
