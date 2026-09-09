"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { JournalEntry, Mood } from "@/lib/types";

const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: "great", emoji: "🤩", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "neutral", emoji: "😐", label: "Neutral" },
  { id: "low", emoji: "😕", label: "Low" },
  { id: "rough", emoji: "😣", label: "Rough" },
];

// One-tap mood log for the Overview page — the lowest-friction possible
// journal interaction, so checking in daily doesn't require opening the
// Journal page. Once logged for today, taps are inert (edit via Journal).
export function QuickMoodCheckin({ initialEntry }: { initialEntry: JournalEntry | null }) {
  const [entry, setEntry] = useState<JournalEntry | null>(initialEntry);
  const [saving, setSaving] = useState<Mood | null>(null);
  const supabase = createClient();

  async function pick(mood: Mood) {
    if (entry || saving) return;
    setSaving(mood);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ mood, entry: "", user_id: user?.id })
      .select()
      .single();
    if (!error && data) setEntry(data as JournalEntry);
    setSaving(null);
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        {MOODS.map((m) => {
          const active = entry?.mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => pick(m.id)}
              disabled={!!entry || saving !== null}
              title={m.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all duration-200 ease-premium active:scale-90",
                active
                  ? "scale-110 bg-primary/15 shadow-glow-signal ring-2 ring-primary/60"
                  : entry
                    ? "opacity-30 grayscale"
                    : saving === m.id
                      ? "scale-110 bg-primary/10 opacity-70"
                      : "bg-muted/40 hover:scale-110 hover:bg-muted/70"
              )}
            >
              {m.emoji}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">
        {entry ? "Checked in for today — nice." : "Tap to check in — takes two seconds."}
      </p>
    </div>
  );
}
