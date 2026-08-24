import { createClient } from "@/lib/supabase/server";
import { BadgesManager } from "@/components/badges/BadgesManager";
import { Reveal } from "@/components/ui/Reveal";
import type { BadgeDef, ProfileBadge } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defs: BadgeDef[] = [];
  let earned: ProfileBadge[] = [];

  if (user) {
    const [{ data: defRows }, { data: earnedRows }] = await Promise.all([
      supabase.from("badge_defs").select("*").order("created_at", { ascending: true }),
      supabase.from("profile_badges").select("*").eq("profile_id", user.id),
    ]);
    defs = (defRows as BadgeDef[]) ?? [];
    earned = (earnedRows as ProfileBadge[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Badges</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Badges are earned, not created. Equip up to 5 to show on your public page.
        </p>
      </Reveal>

      <BadgesManager defs={defs} earned={earned} />
    </div>
  );
}
