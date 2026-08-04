"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Heatmap } from "@/components/streaks/Heatmap";
import { computeStreakStats, todayKey, cn } from "@/lib/utils";
import type { Streak, StreakLog } from "@/lib/types";

const EMOJIS = ["🔥", "💪", "📚", "🧘", "🏃", "💧", "🎯", "🎸", "🧑‍💻", "🌱", "😴", "🥗"];
const COLORS = ["amber", "violet", "emerald", "blue", "pink"];

export function StreaksGrid({
  initialStreaks,
  initialLogs,
}: {
  initialStreaks: Streak[];
  initialLogs: StreakLog[];
}) {
  const [streaks, setStreaks] = useState<Streak[]>(initialStreaks);
  const [logs, setLogs] = useState<StreakLog[]>(initialLogs);
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", emoji: "🔥", color: "amber", goal_per_week: 7 });
  const supabase = createClient();
  const router = useRouter();

  const logsByStreak = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of logs) {
      if (!map.has(l.streak_id)) map.set(l.streak_id, new Set());
      map.get(l.streak_id)!.add(l.log_date);
    }
    return map;
  }, [logs]);

  const visible = streaks.filter((s) => (showArchived ? s.archived : !s.archived));
  const today = todayKey();

  async function toggleToday(s: Streak, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const has = logsByStreak.get(s.id)?.has(today);
    if (has) {
      setLogs((prev) => prev.filter((l) => !(l.streak_id === s.id && l.log_date === today)));
      await supabase.from("streak_logs").delete().eq("streak_id", s.id).eq("log_date", today);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("streak_logs")
        .insert({ streak_id: s.id, log_date: today, user_id: user?.id })
        .select()
        .single();
      if (data) setLogs((prev) => [...prev, data as StreakLog]);
    }
  }

  async function createStreak() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("streaks")
      .insert({
        name: form.name || "New streak",
        emoji: form.emoji,
        color: form.color,
        goal_per_week: form.goal_per_week,
        user_id: user?.id,
      })
      .select()
      .single();
    if (!error && data) {
      setStreaks((prev) => [...prev, data as Streak]);
    }
    setSaving(false);
    setModalOpen(false);
    setForm({ name: "", emoji: "🔥", color: "amber", goal_per_week: 7 });
  }

  async function toggleArchive(s: Streak, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStreaks((prev) => prev.map((x) => (x.id === s.id ? { ...x, archived: !x.archived } : x)));
    await supabase.from("streaks").update({ archived: !s.archived }).eq("id", s.id);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => setShowArchived(false)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              !showArchived ? "bg-violet-500/20 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Active
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              showArchived ? "bg-violet-500/20 text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Archived
          </button>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          + New streak
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-sm text-zinc-500">
          {showArchived ? "No archived streaks." : "No streaks yet — start building momentum."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => {
            const dateSet = logsByStreak.get(s.id) ?? new Set<string>();
            const stats = computeStreakStats(dateSet);
            const doneToday = dateSet.has(today);
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/streaks/${s.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/dashboard/streaks/${s.id}`);
                }}
                className="glass glass-hover flex cursor-pointer flex-col rounded-xl p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{s.name}</p>
                      <p className="font-mono text-[11px] text-zinc-500">
                        {stats.current} current · {stats.longest} best
                      </p>
                    </div>
                  </div>
                  {!showArchived && (
                    <button
                      onClick={(e) => toggleToday(s, e)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-sm transition",
                        doneToday
                          ? "border-amber-400 bg-amber-400 text-ink-950"
                          : "border-white/15 text-transparent hover:border-amber-400/50"
                      )}
                    >
                      ✓
                    </button>
                  )}
                </div>
                <Heatmap loggedDates={dateSet} weeksCount={16} size="sm" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-600">{stats.total} total days</span>
                  <button
                    onClick={(e) => toggleArchive(s, e)}
                    className="font-mono text-[10px] text-zinc-600 hover:text-zinc-300"
                  >
                    {s.archived ? "unarchive" : "archive"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New streak">
        <div className="space-y-3">
          <Input
            placeholder="e.g. Read, Gym, Meditate"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition",
                    form.emoji === e ? "border-violet-500/60 bg-violet-500/10" : "border-white/10 hover:border-white/25"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    "h-6 w-6 rounded-full transition",
                    {
                      amber: "bg-amber-500",
                      violet: "bg-violet-500",
                      emerald: "bg-emerald-500",
                      blue: "bg-blue-500",
                      pink: "bg-pink-500",
                    }[c],
                    form.color === c ? "ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900" : "opacity-60"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="amber" onClick={createStreak} disabled={saving}>
              {saving ? "Creating…" : "Create streak"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
