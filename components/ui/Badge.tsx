import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  red: "bg-red-500/10 text-red-300 border-red-500/20",
  zinc: "bg-white/5 text-zinc-400 border-white/10",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  pink: "bg-pink-500/10 text-pink-300 border-pink-500/20",
};

export function Badge({ children, color = "zinc" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px]",
        colorMap[color] ?? colorMap.zinc
      )}
    >
      {children}
    </span>
  );
}
