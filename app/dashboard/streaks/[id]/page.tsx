import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreakDetail } from "@/components/streaks/StreakDetail";
import type { Streak, StreakLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StreakDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: streak }, { data: logs }] = await Promise.all([
    supabase.from("streaks").select("*").eq("id", params.id).single(),
    supabase.from("streak_logs").select("*").eq("streak_id", params.id),
  ]);

  if (!streak) notFound();

  return <StreakDetail streak={streak as Streak} initialLogs={(logs ?? []) as StreakLog[]} />;
}
