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
    <div className="group relative overflow-hidden rounded-2xl border border-violet-500/10 bg-gradient-to-br from-violet-950/70 to-violet-900/20 p-5 shadow-elevate transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-elevate-hover">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <div className="relative mb-4 flex items-center justify-between">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-zinc-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-violet-300">
          {icon}
        </span>
      </div>
      <div className="relative text-2xl font-bold tracking-tight text-white">{value}</div>
      {sub && <div className="relative mt-1 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
