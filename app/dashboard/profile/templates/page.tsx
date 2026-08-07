import { Card } from "@/components/ui/Card";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Templates</h1>

      <Card className="p-6">
        <p className="mb-5 text-xs text-zinc-500">
          Coming soon. Until you pick one, your page keeps the default look — the same
          blank, unstyled layout it uses right now.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {["Minimal", "Bold", "Gradient"].map((name) => (
            <div
              key={name}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center opacity-50"
            >
              <span className="text-2xl">🎨</span>
              <span className="text-xs text-zinc-500">{name}</span>
              <span className="font-mono text-[9px] uppercase tracking-wide text-zinc-700">
                coming soon
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
