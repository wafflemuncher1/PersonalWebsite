import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  colorClass = "from-violet-600 via-violet-400 to-violet-300",
}: {
  value: number;
  className?: string;
  colorClass?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
        className
      )}
    >
      <div
        className={cn(
          "relative h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-premium",
          colorClass
        )}
        style={{ width: `${pct}%` }}
      >
        {pct > 0 && (
          <div className="absolute inset-0 animate-shimmer bg-sheen-sweep bg-[length:200%_100%] opacity-60" />
        )}
      </div>
    </div>
  );
}
