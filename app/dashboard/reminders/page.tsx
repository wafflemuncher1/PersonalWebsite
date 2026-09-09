import { createClient } from "@/lib/supabase/server";
import { RemindersBoard } from "@/components/reminders/RemindersBoard";
import type { Reminder } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = createClient();
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  return <RemindersBoard initialReminders={(reminders ?? []) as Reminder[]} />;
}
