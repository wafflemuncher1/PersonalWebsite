"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GoalQuickProgress } from "@/components/goals/GoalQuickProgress";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";

// Client-managed so the +/- /complete buttons update this list in place
// instead of requiring a trip to the Goals page.
export function PriorityGoalsCard({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const visible = goals.filter((g) => g.status === "active").slice(0, 4);

  function update(next: Goal) {
    setGoals((prev) => prev.map((g) => (g.id === next.id ? next : g)));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Priority goals</CardTitle>
        <Link href="/dashboard/goals" className="group flex items-center gap-1 text-xs text-primary transition-all hover:gap-1.5">
          view all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">No active goals yet.</p>
            <Link href="/dashboard/goals" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-1.5">
              Set a goal <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((g) => (
              <div key={g.id} className="glass-inset rounded-lg p-4 transition-all duration-200 ease-premium">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      g.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {g.title}
                  </p>
                  <Badge variant={g.priority === "high" ? "destructive" : g.priority === "medium" ? "secondary" : "outline"}>
                    {g.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={g.progress} className="flex-1" />
                  <span className="font-mono text-[10px] text-muted-foreground">{g.progress}%</span>
                  <GoalQuickProgress goal={g} onUpdate={update} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
