import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  colorClass = "from-violet-600 to-violet-400",
}: {
  value: number;
  className?: string;
  colorClass?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
