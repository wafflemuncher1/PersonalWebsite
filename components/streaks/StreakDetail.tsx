"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleRow } from "@/components/shared/controls";
import { Heatmap } from "@/components/streaks/Heatmap";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { computeStreakStats, toDateKey, addDays, cn } from "@/lib/utils";
import type { Streak, StreakLog } from "@/lib/types";

const EMOJIS = ["🔥", "💪", "📚", "🧘", "🏃", "💧", "🎯", "🎸", "🧑‍💻", "🌱", "😴", "🥗"];
const COLORS = ["amber", "violet", "emerald", "blue", "pink"];

const COLOR_DOT: Record<string, string> = {
  amber: "bg-amber-500",
  violet: "bg-primary",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  pink: "bg-pink-500",
};

export function StreakDetail({ streak, initialLogs }: { streak: Streak; initialLogs: StreakLog[] }) {
  const [logs, setLogs] = useState<StreakLog[]>(initialLogs);
  const [meta, setMeta] = useState(streak);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: meta.name,
    emoji: meta.emoji,
    color: meta.color,
    goal_per_week: meta.goal_per_week,
    show_on_profile: meta.show_on_profile,
  });
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
    const patch = {
      name: form.name || meta.name,
      emoji: form.emoji,
      color: form.color,
      goal_per_week: form.goal_per_week,
      show_on_profile: form.show_on_profile,
    };
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
      <Link href="/dashboard/streaks" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> all streaks
      </Link>

      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{meta.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold">{meta.name}</h2>
                {meta.show_on_profile && (
                  <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Globe className="h-2.5 w-2.5" /> on profile
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                started {new Date(meta.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={doneToday ? "secondary" : "default"}
              onClick={() => toggleDay(today)}
              className={cn("active:scale-[0.97]", !doneToday && "bg-amber-500 text-background hover:bg-amber-500/80")}
            >
              {doneToday ? "✓ done today" : "Mark today complete"}
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={deleteStreak}>
              Delete
            </Button>
          </div>
        </div>
      </Reveal>

      <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4" stagger={0.06}>
        <RevealItem>
          <Card className="p-5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-elevate-hover">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Current streak</span>
            <div className="font-display mt-2 text-2xl font-semibold text-amber-400">{stats.current}d</div>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="p-5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-elevate-hover">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Longest streak</span>
            <div className="font-display mt-2 text-2xl font-semibold">{stats.longest}d</div>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="p-5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-elevate-hover">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Last 30 days</span>
            <div className="font-display mt-2 text-2xl font-semibold">{last30}/30</div>
          </Card>
        </RevealItem>
        <RevealItem>
          <Card className="p-5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-elevate-hover">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">All-time total</span>
            <div className="font-display mt-2 text-2xl font-semibold">{stats.total}</div>
          </Card>
        </RevealItem>
      </RevealGroup>

      <Reveal delay={0.1}>
        <Card className="overflow-x-auto p-6">
          <h3 className="mb-4 text-sm font-medium">Activity — tap a day to toggle</h3>
          <Heatmap loggedDates={dateSet} weeksCount={53} size="md" showMonths onDayClick={toggleDay} />
        </Card>
      </Reveal>

      <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit streak</DialogTitle>
          </DialogHeader>
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
                    form.emoji === e ? "border-primary/60 bg-primary/10" : "hover:border-foreground/25"
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
                    COLOR_DOT[c],
                    form.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/60" : "opacity-60"
                  )}
                />
              ))}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Weekly goal — {form.goal_per_week}x / week
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={form.goal_per_week}
                onChange={(e) => setForm((f) => ({ ...f, goal_per_week: Number(e.target.value) }))}
                className="w-full accent-amber-500"
              />
            </div>
            <ToggleRow
              label="Show on Public Profile"
              sub="Feature this streak's heatmap on your profile's Streak page."
              checked={form.show_on_profile}
              onChange={(v) => setForm((f) => ({ ...f, show_on_profile: v }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveMeta} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
