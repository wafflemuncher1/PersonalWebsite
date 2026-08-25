import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "violet",
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  accent?: "violet" | "amber" | "emerald";
}) {
  const glow = {
    violet: "text-violet-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
  }[accent];

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
        {icon && <span className={cn("text-lg", glow)}>{icon}</span>}
      </div>
      <div className="font-display text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
    </Card>
  );
}
