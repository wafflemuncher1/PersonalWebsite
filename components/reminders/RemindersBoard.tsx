"use client";

import { useMemo, useState } from "react";
import { AlarmClock, BellRing, Check, Repeat, Undo2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HeroStat } from "@/components/dashboard/HeroStat";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { Reminder, ReminderPriority, ReminderRepeat } from "@/lib/types";

const PRIORITY_BADGE: Record<ReminderPriority, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const REPEAT_LABEL: Record<NonNullable<ReminderRepeat>, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function dueMeta(dueDate: string | null): { label: string; tone: "overdue" | "today" | "soon" | "future" | "none" } {
  if (!dueDate) return { label: "No due date", tone: "none" };
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const dayDiff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000);

  const time = due.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const hasTime = due.getHours() !== 0 || due.getMinutes() !== 0;

  if (dayDiff < 0) {
    return { label: `Overdue · ${due.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, tone: "overdue" };
  }
  if (dayDiff === 0) {
    return { label: hasTime ? `Today · ${time}` : "Today", tone: due < now ? "overdue" : "today" };
  }
  if (dayDiff === 1) {
    return { label: hasTime ? `Tomorrow · ${time}` : "Tomorrow", tone: "soon" };
  }
  if (dayDiff <= 6) {
    return {
      label: due.toLocaleDateString("en-US", { weekday: "long" }) + (hasTime ? ` · ${time}` : ""),
      tone: "soon",
    };
  }
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + (hasTime ? ` · ${time}` : ""),
    tone: "future",
  };
}

const DUE_TONE_CLASS: Record<string, string> = {
  overdue: "text-red-400",
  today: "text-amber-400",
  soon: "text-primary",
  future: "text-muted-foreground",
  none: "text-muted-foreground",
};

function nextDueDate(due: Date, repeat: NonNullable<ReminderRepeat>): Date {
  const next = new Date(due);
  if (repeat === "daily") next.setDate(next.getDate() + 1);
  if (repeat === "weekly") next.setDate(next.getDate() + 7);
  if (repeat === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

type FormState = {
  title: string;
  notes: string;
  due: string;
  priority: ReminderPriority;
  repeat: ReminderRepeat;
};

const EMPTY_FORM: FormState = { title: "", notes: "", due: "", priority: "medium", repeat: null };

export function RemindersBoard({ initialReminders }: { initialReminders: Reminder[] }) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [showCompleted, setShowCompleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const { overdue, today, upcoming, noDate, completed } = useMemo(() => {
    const open = reminders.filter((r) => !r.completed);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000);

    const overdue: Reminder[] = [];
    const today: Reminder[] = [];
    const upcoming: Reminder[] = [];
    const noDate: Reminder[] = [];

    for (const r of open) {
      if (!r.due_date) {
        noDate.push(r);
        continue;
      }
      const due = new Date(r.due_date);
      if (due < startOfToday) overdue.push(r);
      else if (due < endOfToday) today.push(r);
      else upcoming.push(r);
    }
    const sortByDue = (a: Reminder, b: Reminder) => new Date(a.due_date ?? 0).getTime() - new Date(b.due_date ?? 0).getTime();
    overdue.sort(sortByDue);
    today.sort(sortByDue);
    upcoming.sort(sortByDue);

    const completed = reminders
      .filter((r) => r.completed)
      .sort((a, b) => new Date(b.completed_at ?? b.updated_at).getTime() - new Date(a.completed_at ?? a.updated_at).getTime());

    return { overdue, today, upcoming, noDate, completed };
  }, [reminders]);

  const openCount = overdue.length + today.length + upcoming.length + noDate.length;

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(r: Reminder) {
    setEditing(r);
    setForm({
      title: r.title,
      notes: r.notes,
      due: toLocalInputValue(r.due_date),
      priority: r.priority,
      repeat: r.repeat,
    });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      title: form.title || "Untitled reminder",
      notes: form.notes,
      due_date: fromLocalInputValue(form.due),
      priority: form.priority,
      repeat: form.repeat,
    };

    if (editing) {
      const { data, error } = await supabase.from("reminders").update(payload).eq("id", editing.id).select().single();
      if (!error && data) {
        setReminders((prev) => prev.map((r) => (r.id === editing.id ? (data as Reminder) : r)));
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reminders")
        .insert({ ...payload, user_id: user?.id })
        .select()
        .single();
      if (!error && data) {
        setReminders((prev) => [data as Reminder, ...prev]);
      }
    }
    setSaving(false);
    setModalOpen(false);
  }

  async function complete(r: Reminder) {
    if (r.repeat && r.due_date) {
      const patch = { due_date: nextDueDate(new Date(r.due_date), r.repeat).toISOString() };
      setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
      await supabase.from("reminders").update(patch).eq("id", r.id);
      return;
    }
    const patch = { completed: true, completed_at: new Date().toISOString() };
    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    await supabase.from("reminders").update(patch).eq("id", r.id);
  }

  async function uncomplete(r: Reminder) {
    const patch = { completed: false, completed_at: null };
    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    await supabase.from("reminders").update(patch).eq("id", r.id);
  }

  async function remove(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("reminders").delete().eq("id", id);
  }

  return (
    <div>
      <Reveal>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Reminders</h1>
            <p className="mt-1 text-sm text-muted-foreground">Things with a deadline — one-off or recurring.</p>
          </div>
          <Button onClick={openNew}>+ Reminder</Button>
        </div>
      </Reveal>

      {reminders.length > 0 && (
        <RevealGroup className="mb-6 grid grid-cols-3 gap-3" stagger={0.07}>
          <RevealItem>
            <HeroStat icon={<AlarmClock className="h-4 w-4" />} label="Overdue" value={overdue.length} />
          </RevealItem>
          <RevealItem>
            <HeroStat icon={<BellRing className="h-4 w-4" />} label="Due today" value={today.length} />
          </RevealItem>
          <RevealItem>
            <HeroStat icon={<Check className="h-4 w-4" />} label="Open" value={openCount} />
          </RevealItem>
        </RevealGroup>
      )}

      {reminders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No reminders yet — add one before you forget.
        </div>
      ) : (
        <div className="space-y-6">
          <ReminderGroup title="Overdue" tone="text-red-400" items={overdue} onComplete={complete} onEdit={openEdit} onDelete={remove} />
          <ReminderGroup title="Today" tone="text-amber-400" items={today} onComplete={complete} onEdit={openEdit} onDelete={remove} />
          <ReminderGroup title="Upcoming" items={upcoming} onComplete={complete} onEdit={openEdit} onDelete={remove} />
          <ReminderGroup title="No due date" items={noDate} onComplete={complete} onEdit={openEdit} onDelete={remove} />

          {completed.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted((v) => !v)}
                className="mb-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {showCompleted ? "Hide" : "Show"} completed ({completed.length})
              </button>
              {showCompleted && (
                <RevealGroup className="space-y-2" stagger={0.04}>
                  {completed.map((r) => (
                    <RevealItem key={r.id}>
                      <Card className="flex items-center justify-between gap-3 p-3.5 opacity-60">
                        <p className="truncate text-sm text-muted-foreground line-through">{r.title}</p>
                        <button
                          onClick={() => uncomplete(r)}
                          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Undo2 className="h-3 w-3" /> undo
                        </button>
                      </Card>
                    </RevealItem>
                  ))}
                </RevealGroup>
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(v) => !v && setModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit reminder" : "New reminder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Reminder title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
            />
            <Textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Due date &amp; time</label>
              <Input
                type="datetime-local"
                value={form.due}
                onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as ReminderPriority }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low priority</SelectItem>
                  <SelectItem value="medium">Medium priority</SelectItem>
                  <SelectItem value="high">High priority</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={form.repeat ?? "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, repeat: v === "none" ? null : (v as NonNullable<ReminderRepeat>) }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Doesn't repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Doesn&apos;t repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? "Saving…" : "Save reminder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReminderGroup({
  title,
  tone,
  items,
  onComplete,
  onEdit,
  onDelete,
}: {
  title: string;
  tone?: string;
  items: Reminder[];
  onComplete: (r: Reminder) => void;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className={cn("text-sm font-semibold", tone)}>{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <RevealGroup className="space-y-2" stagger={0.04}>
        {items.map((r) => {
          const meta = dueMeta(r.due_date);
          return (
            <RevealItem key={r.id}>
              <Card className="flex items-center gap-3 p-3.5 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:border-primary/25">
                <button
                  onClick={() => onComplete(r)}
                  title={r.repeat ? "Complete & reschedule" : "Mark complete"}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-input text-transparent transition-all duration-150 hover:border-primary hover:text-primary active:scale-90"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <Badge variant={PRIORITY_BADGE[r.priority]}>{r.priority}</Badge>
                    {r.repeat && (
                      <span className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
                        <Repeat className="h-2.5 w-2.5" /> {REPEAT_LABEL[r.repeat]}
                      </span>
                    )}
                  </div>
                  {r.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.notes}</p>}
                  <p className={cn("mt-1 font-mono text-[10px]", DUE_TONE_CLASS[meta.tone])}>{meta.label}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                  <button onClick={() => onEdit(r)} className="text-muted-foreground hover:text-primary">
                    edit
                  </button>
                  <button onClick={() => onDelete(r.id)} className="text-muted-foreground hover:text-destructive">
                    delete
                  </button>
                </div>
              </Card>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
