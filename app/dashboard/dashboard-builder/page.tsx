import { createClient } from "@/lib/supabase/server";
import { normalizeDashboard2Layout } from "@/lib/dashboard-widgets";
import { DashboardBuilder } from "@/components/dashboard/DashboardBuilder";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardBuilderPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = user
    ? await supabase.from("profiles").select("id, dashboard2_layout").eq("id", user.id).maybeSingle()
    : { data: null };
  const profile = profileData as Pick<Profile, "id" | "dashboard2_layout"> | null;

  const initialDashboard = normalizeDashboard2Layout(profile?.dashboard2_layout);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Builder</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Drag components onto your dashboard to build the layout that works best for you. This is just a
          static preview of where things go — changes apply to Dashboard 2 once saved.
        </p>
      </div>

      <DashboardBuilder initialDashboard={initialDashboard} profileId={profile?.id} />
    </div>
  );
}
