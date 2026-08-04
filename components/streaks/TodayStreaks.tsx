"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayKey } from "@/lib/utils";
import type { Streak } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TodayStreaks({
  streaks,
  loggedTodayIds,
  statsById,
}: {
  streaks: Streak[];
  loggedTodayIds: string[];
  statsById: Record<string, { current: number; longest: number; total: number }>;
}) {
  const [done, setDone] = useState(new Set(loggedTodayIds));
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  async function toggle(streakId: string) {
    const today = todayKey();
    const isDone = done.has(streakId);
    const next = new Set(done);
    if (isDone) {
      next.delete(streakId);
    } else {
      next.add(streakId);
    }
    setDone(next);

    startTransition(async () => {
      if (isDone) {
        await supabase.from("streak_logs").delete().eq("streak_id", streakId).eq("log_date", today);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        await supabase.from("streak_logs").insert({
          streak_id: streakId,
          log_date: today,
          user_id: user?.id,
        });
      }
    });
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {streaks.map((s) => {
        const isDone = done.has(s.id);
        const stats = statsById[s.id];
        return (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            disabled={pending}
            className={cn(
              "flex items-center justify-between rounded-lg border p-3.5 text-left transition",
              isDone
                ? "border-amber-500/40 bg-amber-500/10 shadow-glow-amber"
                : "border-white/5 bg-white/[0.02] hover:border-white/15"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{s.emoji}</span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{s.name}</p>
                <p className="font-mono text-[11px] text-zinc-500">
                  {stats?.current ?? 0} day{stats?.current === 1 ? "" : "s"} current
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-xs transition",
                isDone
                  ? "border-amber-400 bg-amber-400 text-ink-950"
                  : "border-white/15 text-transparent"
              )}
            >
              ✓
            </div>
          </button>
        );
      })}
    </div>
  );
}
