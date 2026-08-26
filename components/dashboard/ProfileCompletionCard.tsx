import Link from "next/link";
import { Card } from "@/components/profile/ui/Card";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

type ChecklistItem = { label: string; done: boolean; href?: string };

export function ProfileCompletionCard({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  const items: ChecklistItem[] = [
    { label: "Upload an avatar", done: !!profile.avatar_url, href: "/dashboard/profile/customize" },
    { label: "Add a description", done: !!profile.bio?.trim(), href: "/dashboard/profile/customize" },
    { label: "Add your location", done: !!profile.location?.trim(), href: "/dashboard/profile/customize" },
    { label: "Set a custom background", done: !!profile.background_url, href: "/dashboard/profile/customize" },
    { label: "Add at least one link", done: (profile.links?.length ?? 0) > 0, href: "/dashboard/profile/links" },
    { label: "Reach 10 profile views", done: (profile.view_count ?? 0) >= 10 },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-sm font-medium text-white">Profile Completion</h2>

      <div className="mb-1 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs text-zinc-500">{pct}% completed</span>
      </div>

      {pct < 100 && (
        <div className="mb-4 mt-4 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <span className="text-amber-400">⚠</span>
          <div>
            <p className="text-sm font-medium text-amber-200">Your profile isn&apos;t complete yet!</p>
            <p className="text-xs text-amber-200/70">
              Complete your profile to make it more discoverable and appealing.
            </p>
          </div>
        </div>
      )}

      <div className={cn("grid gap-2 sm:grid-cols-2", pct === 100 ? "mt-4" : "")}>
        {items.map((item) => {
          const pill = (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition",
                item.done
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : item.href
                    ? "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-violet-500/30 hover:bg-white/[0.05]"
                    : "border-white/10 bg-white/[0.02] text-zinc-500"
              )}
            >
              <span className={item.done ? "text-emerald-400" : "text-zinc-600"}>
                {item.done ? "✓" : "○"}
              </span>
              {item.label}
              {!item.done && item.href && <span className="ml-auto text-zinc-600">›</span>}
            </div>
          );

          return item.href && !item.done ? (
            <Link key={item.label} href={item.href}>
              {pill}
            </Link>
          ) : (
            <div key={item.label}>{pill}</div>
          );
        })}
      </div>
    </Card>
  );
}
