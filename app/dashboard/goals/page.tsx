import { createClient } from "@/lib/supabase/server";
import { GoalsBoard } from "@/components/goals/GoalsBoard";
import type { Goal, GoalCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: goals }] = await Promise.all([
    supabase.from("goal_categories").select("*").order("sort_order").order("created_at"),
    supabase.from("goals").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <GoalsBoard
      initialCategories={(categories ?? []) as GoalCategory[]}
      initialGoals={(goals ?? []) as Goal[]}
    />
  );
}
