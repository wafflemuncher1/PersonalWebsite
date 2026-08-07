import { ReactNode } from "react";

export function HeroStat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-950/70 to-violet-900/20 p-5 transition hover:border-violet-500/25">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-zinc-500">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
