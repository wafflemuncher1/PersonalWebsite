import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export type Achievement = {
  id: string;
  emoji: string;
  label: string;
  unlocked: boolean;
};

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Achievements</h2>
        <span className="font-mono text-xs text-zinc-500">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {achievements.map((a) => (
          <div
            key={a.id}
            title={a.label}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-center transition-all duration-200 ease-premium",
              a.unlocked
                ? "border-amber-500/30 bg-gradient-to-b from-amber-500/[0.1] to-transparent shadow-[0_0_16px_-6px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 hover:border-amber-400/50"
                : "border-white/5 bg-white/[0.01] opacity-40 grayscale hover:opacity-60"
            )}
          >
            <span className="text-xl leading-none">{a.emoji}</span>
            <span className="max-w-[6rem] text-[10px] leading-tight text-zinc-400">{a.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
