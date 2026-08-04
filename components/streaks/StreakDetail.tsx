"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Heatmap } from "@/components/streaks/Heatmap";
import { computeStreakStats, toDateKey, addDays, cn } from "@/lib/utils";
import type { Streak, StreakLog } from "@/lib/types";

const EMOJIS = ["🔥", "💪", "📚", "🧘", "🏃", "💧", "🎯", "🎸", "🧑‍💻", "🌱", "😴", "🥗"];
const COLORS = ["amber", "violet", "emerald", "blue", "pink"];

export function StreakDetail({ streak, initialLogs }: { streak: Streak; initialLogs: StreakLog[] }) {
  const [logs, setLogs] = useState<StreakLog[]>(initialLogs);
  const [meta, setMeta] = useState(streak);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: meta.name, emoji: meta.emoji, color: meta.color });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const dateSet = useMemo(() => new Set(logs.map((l) => l.log_date)), [logs]);
  const stats = computeStreakStats(dateSet);

  const last30 = useMemo(() => {
    let count = 0;
    let cursor = new Date();
    for (let i = 0; i < 30; i++) {
      if (dateSet.has(toDateKey(cursor))) count++;
      cursor = addDays(cursor, -1);
    }
    return count;
  }, [dateSet]);

  async function toggleDay(dateKey: string) {
    const has = dateSet.has(dateKey);
    if (has) {
      setLogs((prev) => prev.filter((l) => l.log_date !== dateKey));
      await supabase.from("streak_logs").delete().eq("streak_id", meta.id).eq("log_date", dateKey);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("streak_logs")
        .insert({ streak_id: meta.id, log_date: dateKey, user_id: user?.id })
        .select()
        .single();
      if (data) setLogs((prev) => [...prev, data as StreakLog]);
    }
  }

  async function saveMeta() {
    setSaving(true);
    const patch = { name: form.name || meta.name, emoji: form.emoji, color: form.color };
    const { data, error } = await supabase
      .from("streaks")
      .update(patch)
      .eq("id", meta.id)
      .select()
      .single();
    if (!error && data) setMeta(data as Streak);
    setSaving(false);
    setEditOpen(false);
  }

  async function deleteStreak() {
    if (!confirm(`Delete "${meta.name}" and all its history? This can't be undone.`)) return;
    await supabase.from("streaks").delete().eq("id", meta.id);
    router.push("/dashboard/streaks");
    router.refresh();
  }

  const today = toDateKey(new Date());
  const doneToday = dateSet.has(today);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/streaks" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
        ← all streaks
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.emoji}</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{meta.name}</h2>
            <p className="font-mono text-xs text-zinc-500">
              started {new Date(meta.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={doneToday ? "secondary" : "amber"}
            onClick={() => toggleDay(today)}
          >
            {doneToday ? "✓ done today" : "Mark today complete"}
          </Button>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={deleteStreak}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Current streak</span>
          <div className="mt-2 text-2xl font-semibold text-amber-400">{stats.current}d</div>
        </Card>
        <Card className="p-5">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Longest streak</span>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.longest}d</div>
        </Card>
        <Card className="p-5">
          <span className="text-xs uppercase tracking-wide text-zinc-500">Last 30 days</span>
          <div className="mt-2 text-2xl font-semibold text-white">{last30}/30</div>
        </Card>
        <Card className="p-5">
          <span className="text-xs uppercase tracking-wide text-zinc-500">All-time total</span>
          <div className="mt-2 text-2xl font-semibold text-white">{stats.total}</div>
        </Card>
      </div>

      <Card className="overflow-x-auto p-6">
        <h3 className="mb-4 text-sm font-medium text-white">Activity — tap a day to toggle</h3>
        <Heatmap loggedDates={dateSet} weeksCount={53} size="md" showMonths onDayClick={toggleDay} />
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit streak">
        <div className="space-y-3">
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Streak name"
          />
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMeta} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
