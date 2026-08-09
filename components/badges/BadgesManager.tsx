"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { badgeIcon } from "@/lib/badge-icons";
import type { BadgeDef, ProfileBadge } from "@/lib/types";

const EQUIP_LIMIT = 5;

export function BadgesManager({ defs, earned: initialEarned }: { defs: BadgeDef[]; earned: ProfileBadge[] }) {
  const supabase = createClient();
  const [earned, setEarned] = useState<ProfileBadge[]>(initialEarned);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        {equippedCount}/{EQUIP_LIMIT} equipped
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-3">
        {defs.map((def) => {
          const row = earnedMap.get(def.key);
          const isEarned = !!row;
          const Icon = badgeIcon(def.icon);

          return (
            <Card
              key={def.key}
              className={`flex items-center gap-4 p-4 transition ${!isEarned ? "opacity-50" : ""}`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-violet-300">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{def.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{def.description}</p>
                {!isEarned && <p className="mt-1 text-[11px] text-zinc-600">Not yet earned</p>}
              </div>

              {row && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.equipped}
                  onClick={() => toggleEquip(row)}
                  aria-label={row.equipped ? "Unequip badge" : "Equip badge"}
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                    row.equipped ? "bg-violet-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: row.equipped ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
