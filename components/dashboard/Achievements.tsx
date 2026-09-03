import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Achievements</CardTitle>
        <span className="font-mono text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {achievements.map((a) => (
            <div
              key={a.id}
              title={a.label}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-center transition-all duration-200 ease-premium",
                a.unlocked
                  ? "border-primary/30 bg-primary/[0.08] hover:-translate-y-0.5 hover:border-primary/50"
                  : "border-border/60 bg-muted/20 opacity-40 grayscale hover:opacity-60"
              )}
            >
              <span className="text-xl leading-none">{a.emoji}</span>
              <span className="max-w-[6rem] text-[10px] leading-tight text-muted-foreground">{a.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
