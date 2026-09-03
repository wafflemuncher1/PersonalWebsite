import { createClient } from "@/lib/supabase/server";
import { JournalBoard } from "@/components/journal/JournalBoard";
import type { JournalEntry, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: entries }, { data: profileRow }] = await Promise.all([
    supabase.from("journal_entries").select("*").order("created_at", { ascending: false }),
    user ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  return (
    <JournalBoard
      initialEntries={(entries ?? []) as JournalEntry[]}
      profile={(profileRow as Profile) ?? null}
    />
  );
}
