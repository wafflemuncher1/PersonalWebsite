"use client";

import { useMemo, useState } from "react";
import { Pin, StickyNote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { relativeTime, cn } from "@/lib/utils";
import type { Note } from "@/lib/types";

const COLORS: Record<string, string> = {
  violet: "border-violet-500/30 hover:border-violet-500/50",
  amber: "border-amber-500/30 hover:border-amber-500/50",
  emerald: "border-emerald-500/30 hover:border-emerald-500/50",
  blue: "border-blue-500/30 hover:border-blue-500/50",
  pink: "border-pink-500/30 hover:border-pink-500/50",
  zinc: "border-white/10 hover:border-white/25",
};

const COLOR_DOT: Record<string, string> = {
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  pink: "bg-pink-500",
  zinc: "bg-zinc-500",
};

const COLOR_BAR: Record<string, string> = {
  violet: "bg-violet-500/70",
  amber: "bg-amber-500/70",
  emerald: "bg-emerald-500/70",
  blue: "bg-blue-500/70",
  pink: "bg-pink-500/70",
  zinc: "bg-white/20",
};

export function NotesBoard({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [query, setQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", content: "", color: "violet" });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const filtered = useMemo(() => {
    let result = notes;
    if (colorFilter) result = result.filter((n) => n.color === colorFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, query, colorFilter]);

  const pinnedCount = useMemo(() => notes.filter((n) => n.pinned).length, [notes]);
  const colorsInUse = useMemo(() => {
    const set = new Set(notes.map((n) => n.color));
    return Object.keys(COLOR_DOT).filter((c) => set.has(c));
  }, [notes]);

  function openNew() {
    setEditing(null);
    setForm({ title: "", content: "", color: "violet" });
    setModalOpen(true);
  }

  function openEdit(n: Note) {
    setEditing(n);
    setForm({ title: n.title, content: n.content, color: n.color });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    if (editing) {
      const { data, error } = await supabase
        .from("notes")
        .update({ title: form.title || "Untitled", content: form.content, color: form.color })
        .eq("id", editing.id)
        .select()
        .single();
      if (!error && data) {
        setNotes((prev) => sortNotes(prev.map((n) => (n.id === editing.id ? (data as Note) : n))));
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("notes")
        .insert({
          title: form.title || "Untitled",
          content: form.content,
          color: form.color,
          user_id: user?.id,
        })
        .select()
        .single();
      if (!error && data) {
        setNotes((prev) => sortNotes([data as Note, ...prev]));
      }
    }
    setSaving(false);
    setModalOpen(false);
  }

  async function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  }

  async function togglePin(n: Note) {
    setNotes((prev) => sortNotes(prev.map((x) => (x.id === n.id ? { ...x, pinned: !x.pinned } : x))));
    await supabase.from("notes").update({ pinned: !n.pinned }).eq("id", n.id);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Notes</h1>
          <p className="mt-1 text-sm text-zinc-500">Quick thoughts, saved and searchable.</p>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="glass rounded-xl p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <StickyNote className="h-4 w-4 text-violet-400" />
              <span className="text-[11px] text-zinc-500">Total notes</span>
            </div>
            <p className="text-lg font-semibold text-white">{notes.length}</p>
          </div>
          <div className="glass rounded-xl p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Pin className="h-4 w-4 text-amber-400" />
              <span className="text-[11px] text-zinc-500">Pinned</span>
            </div>
            <p className="text-lg font-semibold text-white">{pinnedCount}</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Input
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          {colorsInUse.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setColorFilter(null)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition",
                  !colorFilter ? "border-white/25 text-white" : "border-white/10 text-zinc-500 hover:text-zinc-300"
                )}
              >
                All
              </button>
              {colorsInUse.map((c) => (
                <button
                  key={c}
                  onClick={() => setColorFilter(colorFilter === c ? null : c)}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full transition",
                    colorFilter === c ? "ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900" : "opacity-70 hover:opacity-100"
                  )}
                  aria-label={`Filter ${c} notes`}
                >
                  <span className={cn("h-3 w-3 rounded-full", COLOR_DOT[c])} />
                </button>
              ))}
            </div>
          )}
        </div>
        <Button onClick={openNew}>+ New note</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-sm text-zinc-500">
          {notes.length === 0 ? "No notes yet — capture your first thought." : "No notes match your search."}
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={cn(
                "glass relative break-inside-avoid overflow-hidden rounded-xl border p-4 pl-5 transition",
                COLORS[n.color] ?? COLORS.zinc
              )}
            >
              <span className={cn("absolute inset-y-0 left-0 w-1", COLOR_BAR[n.color] ?? COLOR_BAR.zinc)} />
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-medium text-zinc-100">{n.title || "Untitled"}</h3>
                <button
                  onClick={() => togglePin(n)}
                  className={cn("shrink-0 text-sm transition", n.pinned ? "text-amber-400" : "text-zinc-700 hover:text-zinc-400")}
                  title={n.pinned ? "Unpin" : "Pin"}
                >
                  <Pin className={cn("h-3.5 w-3.5", n.pinned && "fill-amber-400")} />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{n.content}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-600">{relativeTime(n.updated_at)}</span>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => openEdit(n)} className="text-zinc-500 hover:text-violet-300">
                    edit
                  </button>
                  <button onClick={() => remove(n.id)} className="text-zinc-500 hover:text-red-300">
                    delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit note" : "New note"}>
        <div className="space-y-3">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
          <Textarea
            placeholder="Write something…"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={6}
          />
          <div className="flex items-center gap-2">
            {Object.keys(COLOR_DOT).map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={cn(
                  "h-6 w-6 rounded-full transition",
                  COLOR_DOT[c],
                  form.color === c ? "ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900" : "opacity-60"
                )}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save note"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}
