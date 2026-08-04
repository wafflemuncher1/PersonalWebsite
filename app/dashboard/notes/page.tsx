import { createClient } from "@/lib/supabase/server";
import { NotesBoard } from "@/components/notes/NotesBoard";
import type { Note } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  return <NotesBoard initialNotes={(data ?? []) as Note[]} />;
}
