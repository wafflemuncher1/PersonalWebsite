"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Repeat, Target, TrendingUp, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleRow } from "@/components/shared/controls";
import { StatTile } from "@/components/ui/StatTile";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn, formatDate, toDateKey } from "@/lib/utils";
import type { Goal, GoalCategory, GoalPriority, GoalStatus } from "@/lib/types";

const CATEGORY_COLORS = ["violet", "amber", "emerald", "blue", "pink", "zinc"];

const PRIORITY_COLOR: Record<GoalPriority, string> = {
  high: "red",
  medium: "amber",
  low: "zinc",
};

const COLOR_BADGE: Record<string, string> = {
  violet: "border-primary/30 bg-primary/10 text-primary",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  pink: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  red: "border-destructive/30 bg-destructive/10 text-destructive",
  zinc: "border-border bg-muted text-muted-foreground",
};

const COLOR_SWATCH: Record<string, string> = {
  violet: "bg-primary",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  pink: "bg-pink-500",
  zinc: "bg-zinc-500",
};

const FILTERS: { key: GoalStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

// Monday of the week containing `d`, as a YYYY-MM-DD key — the anchor for
// lazily resetting recurring weekly goals (no cron needed: we just compare
// against "today's" Monday whenever the board loads).
function mondayOf(d: Date): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toDateKey(date);
}

export function GoalsBoard({
  initialCategories,
  initialGoals,
}: {
  initialCategories: GoalCategory[];
  initialGoals: Goal[];
}) {
  const [categories, setCategories] = useState<GoalCategory[]>(initialCategories);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [filter, setFilter] = useState<GoalStatus | "all">("active");

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "medium" as GoalPriority,
    progress: 0,
    target_date: "",
    is_recurring: false,
  });

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", color: "violet" });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const didReset = useRef(false);

  // Lazily "roll over" recurring weekly goals: if a goal's tracked period is
  // behind the current week, reset its progress/status and bump the period
  // forward. Runs once on mount instead of needing a cron/edge function.
  useEffect(() => {
    if (didReset.current) return;
    didReset.current = true;
    const currentMonday = mondayOf(new Date());
    const stale = goals.filter((g) => g.is_recurring && g.period_start < currentMonday);
    if (stale.length === 0) return;
    (async () => {
      const updates = await Promise.all(
        stale.map((g) =>
          supabase
            .from("goals")
            .update({ progress: 0, status: "active", completed_at: null, period_start: currentMonday })
            .eq("id", g.id)
            .select()
            .single()
        )
      );
      setGoals((prev) =>
        prev.map((g) => {
          const updated = updates.find((u) => u.data && (u.data as Goal).id === g.id);
          return updated?.data ? (updated.data as Goal) : g;
        })
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGoals = useMemo(
    () => (filter === "all" ? goals : goals.filter((g) => g.status === filter)),
    [goals, filter]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Goal[]>();
    for (const g of filteredGoals) {
      const key = g.category_id ?? "uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    }
    return map;
  }, [filteredGoals]);

  const overview = useMemo(() => {
    const active = goals.filter((g) => g.status === "active");
    const now = new Date();
    const completedThisMonth = goals.filter(
      (g) =>
        g.status === "completed" &&
        g.completed_at &&
        new Date(g.completed_at).getMonth() === now.getMonth() &&
        new Date(g.completed_at).getFullYear() === now.getFullYear()
    ).length;
    const avgProgress = active.length
      ? Math.round(active.reduce((sum, g) => sum + g.progress, 0) / active.length)
      : 0;
    const recurringCount = goals.filter((g) => g.is_recurring && g.status !== "archived").length;
    return { activeCount: active.length, completedThisMonth, avgProgress, recurringCount };
  }, [goals]);

  function openNewGoal(categoryId?: string) {
    setEditingGoal(null);
    setGoalForm({
      title: "",
      description: "",
      category_id: categoryId ?? "",
      priority: "medium",
      progress: 0,
      target_date: "",
      is_recurring: false,
    });
    setGoalModalOpen(true);
  }

  function openEditGoal(g: Goal) {
    setEditingGoal(g);
    setGoalForm({
      title: g.title,
      description: g.description,
      category_id: g.category_id ?? "",
      priority: g.priority,
      progress: g.progress,
      target_date: g.target_date ?? "",
      is_recurring: g.is_recurring,
    });
    setGoalModalOpen(true);
  }

  async function saveGoal() {
    setSaving(true);
    const payload = {
      title: goalForm.title || "Untitled goal",
      description: goalForm.description,
      category_id: goalForm.category_id || null,
      priority: goalForm.priority,
      progress: goalForm.progress,
      target_date: goalForm.target_date || null,
      is_recurring: goalForm.is_recurring,
      recurrence: goalForm.is_recurring ? "weekly" : null,
      ...(goalForm.is_recurring && !editingGoal ? { period_start: mondayOf(new Date()) } : {}),
    };

    if (editingGoal) {
      const { data, error } = await supabase
        .from("goals")
        .update(payload)
        .eq("id", editingGoal.id)
        .select()
        .single();
      if (!error && data) {
        setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? (data as Goal) : g)));
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("goals")
        .insert({ ...payload, user_id: user?.id })
        .select()
        .single();
      if (!error && data) {
        setGoals((prev) => [data as Goal, ...prev]);
      }
    }
    setSaving(false);
    setGoalModalOpen(false);
  }

  async function setStatus(g: Goal, status: GoalStatus) {
    const patch: Partial<Goal> = {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      progress: status === "completed" ? 100 : g.progress,
    };
    setGoals((prev) => prev.map((x) => (x.id === g.id ? { ...x, ...patch } : x)));
    await supabase.from("goals").update(patch).eq("id", g.id);
  }

  async function removeGoal(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await supabase.from("goals").delete().eq("id", id);
  }

  async function saveCategory() {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("goal_categories")
      .insert({ name: catForm.name || "New category", color: catForm.color, user_id: user?.id })
      .select()
      .single();
    if (!error && data) {
      setCategories((prev) => [...prev, data as GoalCategory]);
    }
    setSaving(false);
    setCatModalOpen(false);
    setCatForm({ name: "", color: "violet" });
  }

  async function removeCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setGoals((prev) => prev.map((g) => (g.category_id === id ? { ...g, category_id: null } : g)));
    await supabase.from("goal_categories").delete().eq("id", id);
  }

  return (
    <div>
      <Reveal>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track what you're working toward — one-off or every week.</p>
        </div>
      </Reveal>

      {goals.length > 0 && (
        <RevealGroup className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.06}>
          <RevealItem>
            <StatTile icon={<Target className="h-4 w-4" />} label="Active" value={overview.activeCount} accent="violet" />
          </RevealItem>
          <RevealItem>
            <StatTile
              icon={<TrendingUp className="h-4 w-4" />}
              label="Avg. progress"
              value={`${overview.avgProgress}%`}
              accent="blue"
            />
          </RevealItem>
          <RevealItem>
            <StatTile
              icon={<Trophy className="h-4 w-4" />}
              label="Completed this month"
              value={overview.completedThisMonth}
              accent="emerald"
            />
          </RevealItem>
          <RevealItem>
            <StatTile icon={<Repeat className="h-4 w-4" />} label="Weekly goals" value={overview.recurringCount} accent="amber" />
          </RevealItem>
        </RevealGroup>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as GoalStatus | "all")}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCatModalOpen(true)}>
            + Category
          </Button>
          <Button size="sm" onClick={() => openNewGoal()}>
            + Goal
          </Button>
        </div>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Nothing here yet.
        </div>
      ) : (
        <div className="space-y-6">
          {categories
            .filter((c) => grouped.has(c.id))
            .map((cat) => (
              <GoalGroup
                key={cat.id}
                title={cat.name}
                color={cat.color}
                goals={grouped.get(cat.id) ?? []}
                onEdit={openEditGoal}
                onDelete={removeGoal}
                onSetStatus={setStatus}
                onAdd={() => openNewGoal(cat.id)}
                onDeleteCategory={() => removeCategory(cat.id)}
              />
            ))}
          {grouped.has("uncategorized") && (
            <GoalGroup
              title="Uncategorized"
              color="zinc"
              goals={grouped.get("uncategorized") ?? []}
              onEdit={openEditGoal}
              onDelete={removeGoal}
              onSetStatus={setStatus}
              onAdd={() => openNewGoal()}
            />
          )}
        </div>
      )}

      <Dialog open={goalModalOpen} onOpenChange={(v) => !v && setGoalModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit goal" : "New goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Goal title"
              value={goalForm.title}
              onChange={(e) => setGoalForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)"
              value={goalForm.description}
              onChange={(e) => setGoalForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={goalForm.category_id || "none"}
                onValueChange={(v) => setGoalForm((f) => ({ ...f, category_id: v && v !== "none" ? String(v) : "" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={goalForm.priority}
                onValueChange={(v) => setGoalForm((f) => ({ ...f, priority: v as GoalPriority }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low priority</SelectItem>
                  <SelectItem value="medium">Medium priority</SelectItem>
                  <SelectItem value="high">High priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Progress — {goalForm.progress}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={goalForm.progress}
                onChange={(e) => setGoalForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
            </div>
            {!goalForm.is_recurring && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Target date</label>
                <Input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm((f) => ({ ...f, target_date: e.target.value }))}
                />
              </div>
            )}
            <ToggleRow
              label="Repeat Weekly"
              sub="Progress and completion automatically reset every Monday."
              checked={goalForm.is_recurring}
              onChange={(v) => setGoalForm((f) => ({ ...f, is_recurring: v }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setGoalModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveGoal} disabled={saving}>
                {saving ? "Saving…" : "Save goal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={catModalOpen} onOpenChange={(v) => !v && setCatModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="e.g. Career, Health, Finance"
              value={catForm.name}
              onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
            <div className="flex gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    "h-6 w-6 rounded-full transition",
                    COLOR_SWATCH[c],
                    catForm.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/60" : "opacity-60"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setCatModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCategory} disabled={saving}>
                {saving ? "Saving…" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalGroup({
  title,
  color,
  goals,
  onEdit,
  onDelete,
  onSetStatus,
  onAdd,
  onDeleteCategory,
}: {
  title: string;
  color: string;
  goals: Goal[];
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onSetStatus: (g: Goal, status: GoalStatus) => void;
  onAdd: () => void;
  onDeleteCategory?: () => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={COLOR_BADGE[color] ?? COLOR_BADGE.zinc}>
            {title}
          </Badge>
          <span className="text-xs text-muted-foreground">{goals.length}</span>
        </div>
        <div className="flex gap-3 text-xs">
          <button onClick={onAdd} className="text-muted-foreground hover:text-primary">
            + add
          </button>
          {onDeleteCategory && (
            <button onClick={onDeleteCategory} className="text-muted-foreground hover:text-destructive">
              remove category
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {goals.map((g) => (
          <Card key={g.id} className="p-4 transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:border-primary/25">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      g.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {g.title}
                  </p>
                  <Badge variant="outline" className={COLOR_BADGE[PRIORITY_COLOR[g.priority]]}>
                    {g.priority}
                  </Badge>
                  {g.is_recurring && (
                    <span className="flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400">
                      <Repeat className="h-2.5 w-2.5" /> weekly
                    </span>
                  )}
                  {g.status === "archived" && (
                    <Badge variant="secondary">archived</Badge>
                  )}
                </div>
                {g.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={g.progress} className="max-w-[180px]" />
                  <span className="font-mono text-[10px] text-muted-foreground">{g.progress}%</span>
                  {g.is_recurring ? (
                    <span className="font-mono text-[10px] text-muted-foreground">resets Monday</span>
                  ) : (
                    g.target_date && (
                      <span className="font-mono text-[10px] text-muted-foreground">due {formatDate(g.target_date)}</span>
                    )
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs">
                {g.status !== "completed" && (
                  <button onClick={() => onSetStatus(g, "completed")} className="text-emerald-400 hover:text-emerald-300">
                    complete
                  </button>
                )}
                {g.status === "active" && (
                  <button onClick={() => onSetStatus(g, "archived")} className="text-muted-foreground hover:text-foreground">
                    archive
                  </button>
                )}
                {g.status !== "active" && (
                  <button onClick={() => onSetStatus(g, "active")} className="text-muted-foreground hover:text-foreground">
                    reactivate
                  </button>
                )}
                <button onClick={() => onEdit(g)} className="text-muted-foreground hover:text-primary">
                  edit
                </button>
                <button onClick={() => onDelete(g.id)} className="text-muted-foreground hover:text-destructive">
                  delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
