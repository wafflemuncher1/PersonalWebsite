import { LayoutTemplate } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Templates</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card>
          <CardContent>
            <p className="mb-5 text-xs text-muted-foreground">
              Coming soon. Until you pick one, your page keeps the default look — the same
              blank, unstyled layout it uses right now.
            </p>

            <RevealGroup className="grid gap-3 sm:grid-cols-3" stagger={0.08}>
              {["Minimal", "Bold", "Gradient"].map((name) => (
                <RevealItem key={name}>
                  <div className="group flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center opacity-50 transition-all duration-300 ease-premium hover:opacity-70 hover:border-primary/25">
                    <LayoutTemplate className="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                    <span className="text-xs text-muted-foreground">{name}</span>
                    <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground/60">
                      coming soon
                    </span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
