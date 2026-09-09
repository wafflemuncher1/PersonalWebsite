"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/lib/types";

function dueLabel(dueDate: string | null): { text: string; tone: "overdue" | "today" | "soon" | "future" | "none" } {
  if (!dueDate) return { text: "No due date", tone: "none" };
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const dayDiff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000);

  if (dayDiff < 0) return { text: `Overdue · ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, tone: "overdue" };
  if (dayDiff === 0) return { text: "Due today", tone: "today" };
  if (dayDiff === 1) return { text: "Due tomorrow", tone: "soon" };
  if (dayDiff <= 6) return { text: `Due ${due.toLocaleDateString("en-US", { weekday: "long" })}`, tone: "soon" };
  return { text: `Due ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, tone: "future" };
}

const TONE_CLASS: Record<string, string> = {
  overdue: "text-red-400",
  today: "text-amber-400",
  soon: "text-primary",
  future: "text-muted-foreground",
  none: "text-muted-foreground",
};

// Overview's action card for Reminders — shows what's due and lets you add
// or knock one out without opening the Reminders page.
export function QuickRemindersCard({ initialReminders }: { initialReminders: Reminder[] }) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const visible = useMemo(() => {
    const open = reminders.filter((r) => !r.completed);
    return [...open]
      .sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .slice(0, 5);
  }, [reminders]);

  async function addReminder() {
    if (!title.trim() || saving) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        title: title.trim(),
        due_date: due ? new Date(due + "T09:00").toISOString() : null,
        user_id: user?.id,
      })
      .select()
      .single();
    if (!error && data) {
      setReminders((prev) => [data as Reminder, ...prev]);
      setTitle("");
      setDue("");
    }
    setSaving(false);
  }

  async function complete(r: Reminder) {
    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, completed: true } : x)));
    await supabase.from("reminders").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", r.id);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Reminders</CardTitle>
        <Link href="/dashboard/reminders" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
          view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-2">
          <Input
            placeholder="Remind me to…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addReminder()}
            className="h-8 flex-1 text-sm"
          />
          <Input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="h-8 w-[132px] text-sm"
          />
          <button
            onClick={addReminder}
            disabled={saving || !title.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-150 hover:bg-primary/20 disabled:pointer-events-none disabled:opacity-40 active:scale-90"
            title="Add reminder"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">Nothing due — add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((r) => {
              const meta = dueLabel(r.due_date);
              return (
                <div
                  key={r.id}
                  className="glass-inset flex items-center gap-3 rounded-lg p-3 transition-all duration-200 ease-premium"
                >
                  <button
                    onClick={() => complete(r)}
                    title="Mark complete"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-input text-transparent transition-all duration-150 hover:border-primary hover:text-primary active:scale-90"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className={cn("font-mono text-[10px]", TONE_CLASS[meta.tone])}>{meta.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
