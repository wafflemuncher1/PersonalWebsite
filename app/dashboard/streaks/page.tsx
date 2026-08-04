import { createClient } from "@/lib/supabase/server";
import { StreaksGrid } from "@/components/streaks/StreaksGrid";
import type { Streak, StreakLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StreaksPage() {
  const supabase = createClient();
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 140).toISOString().slice(0, 10);

  const [{ data: streaks }, { data: logs }] = await Promise.all([
    supabase.from("streaks").select("*").order("created_at"),
    supabase.from("streak_logs").select("*").gte("log_date", cutoff),
  ]);

  return (
    <StreaksGrid initialStreaks={(streaks ?? []) as Streak[]} initialLogs={(logs ?? []) as StreakLog[]} />
  );
}
