import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function vibeFor(score: number): { label: string; color: string; bar: string } {
  if (score >= 85) return { label: "Locked in", color: "text-emerald-400", bar: "from-emerald-500 to-emerald-300" };
  if (score >= 60) return { label: "On a roll", color: "text-violet-400", bar: "from-violet-600 to-violet-400" };
  if (score >= 35) return { label: "Building steam", color: "text-amber-400", bar: "from-amber-600 to-amber-400" };
  if (score >= 10) return { label: "Just getting started", color: "text-zinc-300", bar: "from-zinc-500 to-zinc-400" };
  return { label: "Wide open", color: "text-zinc-500", bar: "from-zinc-700 to-zinc-600" };
}

export function Momentum({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const vibe = vibeFor(clamped);

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Momentum</span>
        <span className={cn("font-mono text-xs", vibe.color)}>{vibe.label}</span>
      </div>
      <div className="mb-3 text-3xl font-semibold text-white">{clamped}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", vibe.bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-zinc-600">
        Blended from goal progress, your best streak, and journaling this week.
      </p>
    </Card>
  );
}
