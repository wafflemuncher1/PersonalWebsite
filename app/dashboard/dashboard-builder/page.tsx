import { getDashboardData } from "@/lib/dashboard-data";
import { DEFAULT_LAYOUT } from "@/lib/dashboard-widgets";
import { DashboardBuilder } from "@/components/dashboard/DashboardBuilder";

export const dynamic = "force-dynamic";

export default async function DashboardBuilderPage() {
  const data = await getDashboardData();
  const initialLayout = data.profile?.dashboard2_layout ?? DEFAULT_LAYOUT;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Builder</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Drag components onto your dashboard to build the layout that works best for you. Changes apply to
          Dashboard 2.
        </p>
      </div>

      <DashboardBuilder data={data} initialLayout={initialLayout} profileId={data.profile?.id} />
    </div>
  );
}
