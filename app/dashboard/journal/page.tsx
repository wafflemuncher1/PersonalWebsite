import { createClient } from "@/lib/supabase/server";
import { JournalBoard } from "@/components/journal/JournalBoard";
import type { JournalEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });

  return <JournalBoard initialEntries={(data ?? []) as JournalEntry[]} />;
}
