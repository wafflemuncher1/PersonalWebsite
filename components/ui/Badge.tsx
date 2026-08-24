import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-300 border-violet-500/25 shadow-[0_0_12px_-4px_rgba(139,92,246,0.6)]",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_12px_-4px_rgba(245,158,11,0.6)]",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-[0_0_12px_-4px_rgba(16,185,129,0.6)]",
  red: "bg-red-500/10 text-red-300 border-red-500/25 shadow-[0_0_12px_-4px_rgba(239,68,68,0.6)]",
  zinc: "bg-white/[0.06] text-zinc-400 border-white/10",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/25 shadow-[0_0_12px_-4px_rgba(59,130,246,0.6)]",
  pink: "bg-pink-500/10 text-pink-300 border-pink-500/25 shadow-[0_0_12px_-4px_rgba(236,72,153,0.6)]",
};

export function Badge({ children, color = "zinc" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] transition-shadow duration-200",
        colorMap[color] ?? colorMap.zinc
      )}
    >
      {children}
    </span>
  );
}
