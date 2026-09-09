"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import type { Note } from "@/lib/types";

// Single-line note capture, no dialog/navigation — for jotting something
// down from the page everyone lands on without breaking flow.
export function QuickNoteAdd({ onAdd }: { onAdd: (note: Note) => void }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function submit() {
    if (!value.trim() || saving) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("notes")
      .insert({ title: value.trim(), content: "", user_id: user?.id, color: "violet" })
      .select()
      .single();
    if (!error && data) {
      onAdd(data as Note);
      setValue("");
    }
    setSaving(false);
  }

  return (
    <div className="mb-3 flex items-center gap-2">
      <Input
        placeholder="Quick note…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="h-8 text-sm"
      />
      <button
        onClick={submit}
        disabled={saving || !value.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-150 hover:bg-primary/20 disabled:pointer-events-none disabled:opacity-40 active:scale-90"
        title="Add note"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
