"use client";

import { useMemo, useState } from "react";
import { BookOpen, Flame, Globe, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { ToggleRow } from "@/components/customizer2/controls";
import { Heatmap } from "@/components/streaks/Heatmap";
import { computeStreakStats, cn, relativeTime, formatDateTime } from "@/lib/utils";
import type { JournalEntry, Mood, Profile } from "@/lib/types";

const MOODS: { id: Mood; emoji: string; label: string; dot: string }[] = [
  { id: "great", emoji: "🤩", label: "Great", dot: "bg-emerald-500" },
  { id: "good", emoji: "🙂", label: "Good", dot: "bg-violet-500" },
  { id: "neutral", emoji: "😐", label: "Neutral", dot: "bg-zinc-500" },
  { id: "low", emoji: "😕", label: "Low", dot: "bg-amber-500" },
  { id: "rough", emoji: "😣", label: "Rough", dot: "bg-red-500" },
];

const moodMeta = (id: Mood) => MOODS.find((m) => m.id === id) ?? MOODS[2];

export function JournalBoard({
  initialEntries,
  profile,
}: {
  initialEntries: JournalEntry[];
  profile: Profile | null;
}) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [mood, setMood] = useState<Mood>("good");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(profile?.journal_heatmap_enabled ?? false);
  const [toggleSaving, setToggleSaving] = useState(false);
  const supabase = createClient();

  // One representative entry per calendar day (the most recent, since
  // entries arrive newest-first) — powers both the activity streak math and
  // the mood-colored heatmap below.
  const entryByDay = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    for (const e of entries) {
      const key = e.created_at.slice(0, 10);
      if (!map.has(key)) map.set(key, e);
    }
    return map;
  }, [entries]);

  const loggedDates = useMemo(() => new Set(entryByDay.keys()), [entryByDay]);
  const journalStats = useMemo(() => computeStreakStats(loggedDates), [loggedDates]);

  const topMood = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const counts = new Map<Mood, number>();
    for (const e of entries) {
      if (new Date(e.created_at) < cutoff) continue;
      counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
    }
    let best: Mood | null = null;
    let bestCount = 0;
    for (const [m, c] of counts) {
      if (c > bestCount) {
        best = m;
        bestCount = c;
      }
    }
    return best;
  }, [entries]);

  function startEdit(entry: JournalEntry) {
    setEditingId(entry.id);
    setMood(entry.mood);
    setText(entry.entry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setMood("good");
    setText("");
  }

  async function save() {
    if (!text.trim()) return;
    setSaving(true);

    if (editingId) {
      const { data, error } = await supabase
        .from("journal_entries")
        .update({ mood, entry: text.trim() })
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setEntries((prev) => prev.map((e) => (e.id === editingId ? (data as JournalEntry) : e)));
      }
      setEditingId(null);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ mood, entry: text.trim(), user_id: user?.id })
        .select()
        .single();
      if (!error && data) {
        setEntries((prev) => [data as JournalEntry, ...prev]);
      }
    }

    setText("");
    setMood("good");
    setSaving(false);
  }

  async function remove(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("journal_entries").delete().eq("id", id);
  }

  async function toggleHeatmapVisibility(next: boolean) {
    if (!profile) return;
    setHeatmapEnabled(next);
    setToggleSaving(true);
    await supabase.from("profiles").update({ journal_heatmap_enabled: next }).eq("id", profile.id);
    setToggleSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Journal</h1>
        <p className="mt-1 text-sm text-zinc-500">A private log of how you're doing, day to day.</p>
      </div>

      {entries.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatTile icon={<Flame className="h-4 w-4 text-amber-400" />} label="Day streak" value={`${journalStats.current}d`} />
          <StatTile icon={<BookOpen className="h-4 w-4 text-violet-400" />} label="Total entries" value={entries.length} />
          <StatTile
            icon={<Sparkles className="h-4 w-4 text-emerald-400" />}
            label="Top mood (30d)"
            value={topMood ? `${moodMeta(topMood).emoji} ${moodMeta(topMood).label}` : "—"}
          />
        </div>
      )}

      {/* Mood & Activity heatmap */}
      {entries.length > 0 && (
        <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Mood history</h2>
            <div className="flex items-center gap-2.5 font-mono text-[9px] text-zinc-600">
              {MOODS.map((m) => (
                <span key={m.id} className="flex items-center gap-1">
                  <span className={cn("h-2 w-2 rounded-[2px]", m.dot)} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Heatmap
              loggedDates={loggedDates}
              weeksCount={20}
              size="sm"
              showMonths
              colorForDate={(key) => {
                const e = entryByDay.get(key);
                return e ? moodMeta(e.mood).dot : null;
              }}
            />
          </div>
          {profile && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <ToggleRow
                label="Show Journal Activity on Public Profile"
                sub="Just the activity pattern (which days you journaled) — never your entries or moods."
                checked={heatmapEnabled}
                onChange={toggleHeatmapVisibility}
              />
              {toggleSaving && <p className="mt-1 text-[10px] text-zinc-600">Saving…</p>}
              {heatmapEnabled && (
                <p className="mt-2 flex items-center gap-1 text-[10px] text-violet-400">
                  <Globe className="h-2.5 w-2.5" /> Visible on your profile's Journal page
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="glass mb-6 rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-lg transition",
                mood === m.id
                  ? "bg-white/10 ring-2 ring-violet-500/50"
                  : "bg-white/[0.03] opacity-60 hover:opacity-100"
              )}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        <Textarea
          placeholder="What's going on today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <div className="mt-3 flex justify-end gap-2">
          {editingId && (
            <Button variant="ghost" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
          <Button onClick={save} disabled={saving || !text.trim()}>
            {saving ? "Saving…" : editingId ? "Update entry" : "Add entry"}
          </Button>
        </div>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-sm text-zinc-500">
          No entries yet — how's today going?
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="glass rounded-xl p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{moodMeta(e.mood).emoji}</span>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {formatDateTime(e.created_at)} · {relativeTime(e.created_at)}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => startEdit(e)} className="text-zinc-500 hover:text-violet-300">
                    edit
                  </button>
                  <button onClick={() => remove(e.id)} className="text-zinc-500 hover:text-red-300">
                    delete
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{e.entry}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass rounded-xl p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5">{icon}<span className="text-[11px] text-zinc-500">{label}</span></div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
