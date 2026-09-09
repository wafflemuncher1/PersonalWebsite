"use client";

import { useTransition } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";

// Inline +/-/complete controls for bumping a goal's progress without leaving
// the page it's rendered on (Overview's priority goals list). Optimistic —
// the parent's `onUpdate` fires immediately, the write happens in the
// background via useTransition.
export function GoalQuickProgress({
  goal,
  onUpdate,
}: {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
}) {
  const [pending, startTransition] = useTransition();
  const supabase = createClient();
  const isComplete = goal.status === "completed";

  function bump(delta: number) {
    const progress = Math.max(0, Math.min(100, goal.progress + delta));
    const patch: Partial<Goal> =
      progress >= 100
        ? { progress: 100, status: "completed", completed_at: new Date().toISOString() }
        : { progress };
    onUpdate({ ...goal, ...patch });
    startTransition(async () => {
      await supabase.from("goals").update(patch).eq("id", goal.id);
    });
  }

  function complete() {
    const patch: Partial<Goal> = { progress: 100, status: "completed", completed_at: new Date().toISOString() };
    onUpdate({ ...goal, ...patch });
    startTransition(async () => {
      await supabase.from("goals").update(patch).eq("id", goal.id);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => bump(-10)}
        disabled={pending || isComplete || goal.progress <= 0}
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 active:scale-90"
        title="-10%"
      >
        <Minus className="h-3 w-3" />
      </button>
      <button
        onClick={() => bump(10)}
        disabled={pending || isComplete}
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-all duration-150 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30 active:scale-90"
        title="+10%"
      >
        <Plus className="h-3 w-3" />
      </button>
      <button
        onClick={complete}
        disabled={pending || isComplete}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 active:scale-90",
          isComplete
            ? "bg-emerald-500/15 text-emerald-400"
            : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 disabled:pointer-events-none disabled:opacity-30"
        )}
        title="Mark complete"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
