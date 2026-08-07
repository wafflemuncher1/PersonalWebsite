import Link from "next/link";
import { getDashboardData } from "@/lib/dashboard-data";
import { DEFAULT_LAYOUT, SPAN_CLASS, WIDGET_BY_KEY, isWidgetKey } from "@/lib/dashboard-widgets";
import { WIDGET_COMPONENTS } from "@/components/dashboard/widgets/registry";

export const dynamic = "force-dynamic";

export default async function Dashboard2Page() {
  const data = await getDashboardData();
  const layout = data.profile?.dashboard2_layout ?? DEFAULT_LAYOUT;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard 2</h1>
        <Link
          href="/dashboard/dashboard-builder"
          className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
        >
          🎛 Edit layout
        </Link>
      </div>

      {layout.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-16 text-center">
          <span className="mb-3 text-3xl">🧩</span>
          <p className="text-sm font-medium text-zinc-300">This dashboard is empty</p>
          <p className="mt-1 max-w-xs text-xs text-zinc-500">
            Please drag and drop dashboard components to build your dashboard.
          </p>
          <Link
            href="/dashboard/dashboard-builder"
            className="mt-4 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400"
          >
            Open Dashboard Builder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {layout.filter(isWidgetKey).map((key) => {
            const Widget = WIDGET_COMPONENTS[key];
            const def = WIDGET_BY_KEY[key];
            if (!Widget || !def) return null;
            return (
              <div key={key} className={SPAN_CLASS[def.span]}>
                <Widget data={data} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
