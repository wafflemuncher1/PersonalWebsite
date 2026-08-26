import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="group transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-primary/30">
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-muted-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary">
            {icon}
          </span>
        </div>
        <div className="font-display text-2xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
