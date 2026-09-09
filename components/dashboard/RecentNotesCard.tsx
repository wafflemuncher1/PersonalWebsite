"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickNoteAdd } from "@/components/notes/QuickNoteAdd";
import { relativeTime } from "@/lib/utils";
import type { Note } from "@/lib/types";

export function RecentNotesCard({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  function addNote(note: Note) {
    setNotes((prev) => [note, ...prev].slice(0, 4));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recent notes</CardTitle>
        <Link href="/dashboard/notes" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
          view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <QuickNoteAdd onAdd={addNote} />
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">No notes yet — jot one down above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <Link
                key={n.id}
                href="/dashboard/notes"
                className="glass-inset glass-inset-hover block rounded-lg p-3 transition-all duration-200 ease-premium hover:translate-x-0.5"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{n.title || "Untitled"}</p>
                  {n.pinned && <span className="text-xs text-primary">★</span>}
                </div>
                {n.content && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.content}</p>}
                <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">{relativeTime(n.updated_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
