"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
import type { Goal, GoalCategory, GoalPriority, GoalStatus } from "@/lib/types";

const CATEGORY_COLORS = ["violet", "amber", "emerald", "blue", "pink", "zinc"];

const PRIORITY_COLOR: Record<GoalPriority, string> = {
  high: "red",
  medium: "amber",
  low: "zinc",
};

const FILTERS: { key: GoalStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
];

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
  });

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", color: "violet" });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

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

  function openNewGoal(categoryId?: string) {
    setEditingGoal(null);
    setGoalForm({
      title: "",
      description: "",
      category_id: categoryId ?? "",
      priority: "medium",
      progress: 0,
      target_date: "",
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
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-white">Goals</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                filter === f.key ? "bg-violet-500/20 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
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
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-sm text-zinc-500">
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

      <Modal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title={editingGoal ? "Edit goal" : "New goal"}
      >
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
            <select
              value={goalForm.category_id}
              onChange={(e) => setGoalForm((f) => ({ ...f, category_id: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/60"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink-900">
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={goalForm.priority}
              onChange={(e) => setGoalForm((f) => ({ ...f, priority: e.target.value as GoalPriority }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/60"
            >
              <option value="low" className="bg-ink-900">Low priority</option>
              <option value="medium" className="bg-ink-900">Medium priority</option>
              <option value="high" className="bg-ink-900">High priority</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Progress — {goalForm.progress}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={goalForm.progress}
              onChange={(e) => setGoalForm((f) => ({ ...f, progress: Number(e.target.value) }))}
              className="w-full accent-violet-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Target date</label>
            <Input
              type="date"
              value={goalForm.target_date}
              onChange={(e) => setGoalForm((f) => ({ ...f, target_date: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGoal} disabled={saving}>
              {saving ? "Saving…" : "Save goal"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)} title="New category">
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
                  {
                    violet: "bg-violet-500",
                    amber: "bg-amber-500",
                    emerald: "bg-emerald-500",
                    blue: "bg-blue-500",
                    pink: "bg-pink-500",
                    zinc: "bg-zinc-500",
                  }[c],
                  catForm.color === c ? "ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900" : "opacity-60"
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
      </Modal>
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
          <Badge color={color}>{title}</Badge>
          <span className="text-xs text-zinc-600">{goals.length}</span>
        </div>
        <div className="flex gap-3 text-xs">
          <button onClick={onAdd} className="text-zinc-500 hover:text-violet-300">
            + add
          </button>
          {onDeleteCategory && (
            <button onClick={onDeleteCategory} className="text-zinc-600 hover:text-red-300">
              remove category
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {goals.map((g) => (
          <div
            key={g.id}
            className="glass glass-hover rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      g.status === "completed" ? "text-zinc-500 line-through" : "text-zinc-100"
                    )}
                  >
                    {g.title}
                  </p>
                  <Badge color={PRIORITY_COLOR[g.priority]}>{g.priority}</Badge>
                  {g.status === "archived" && <Badge color="zinc">archived</Badge>}
                </div>
                {g.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{g.description}</p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={g.progress} className="max-w-[180px]" />
                  <span className="font-mono text-[10px] text-zinc-600">{g.progress}%</span>
                  {g.target_date && (
                    <span className="font-mono text-[10px] text-zinc-600">due {formatDate(g.target_date)}</span>
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
                  <button onClick={() => onSetStatus(g, "archived")} className="text-zinc-600 hover:text-zinc-400">
                    archive
                  </button>
                )}
                {g.status !== "active" && (
                  <button onClick={() => onSetStatus(g, "active")} className="text-zinc-600 hover:text-zinc-400">
                    reactivate
                  </button>
                )}
                <button onClick={() => onEdit(g)} className="text-zinc-600 hover:text-violet-300">
                  edit
                </button>
                <button onClick={() => onDelete(g.id)} className="text-zinc-600 hover:text-red-300">
                  delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
