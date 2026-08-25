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
    <div className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025] p-5 shadow-elevate transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-gold-400/25 hover:shadow-elevate-hover">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-zinc-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-gold-300">
          {icon}
        </span>
      </div>
      <div className="font-display text-2xl font-semibold tracking-tight text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
