"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn, relativeTime, formatDateTime } from "@/lib/utils";
import type { JournalEntry, Mood } from "@/lib/types";

const MOODS: { id: Mood; emoji: string; label: string; dot: string }[] = [
  { id: "great", emoji: "🤩", label: "Great", dot: "bg-emerald-500" },
  { id: "good", emoji: "🙂", label: "Good", dot: "bg-violet-500" },
  { id: "neutral", emoji: "😐", label: "Neutral", dot: "bg-zinc-500" },
  { id: "low", emoji: "😕", label: "Low", dot: "bg-amber-500" },
  { id: "rough", emoji: "😣", label: "Rough", dot: "bg-red-500" },
];

const moodMeta = (id: Mood) => MOODS.find((m) => m.id === id) ?? MOODS[2];

export function JournalBoard({ initialEntries }: { initialEntries: JournalEntry[] }) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [mood, setMood] = useState<Mood>("good");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const supabase = createClient();

  const trend = useMemo(() => entries.slice(0, 21).reverse(), [entries]);

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

  return (
    <div className="mx-auto max-w-2xl">
      {/* Mood trend strip */}
      {trend.length > 1 && (
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <span className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-wide text-zinc-600">
            trend
          </span>
          {trend.map((e) => (
            <span
              key={e.id}
              title={`${moodMeta(e.mood).label} · ${formatDateTime(e.created_at)}`}
              className={cn("h-2.5 w-2.5 shrink-0 rounded-full", moodMeta(e.mood).dot)}
            />
          ))}
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
