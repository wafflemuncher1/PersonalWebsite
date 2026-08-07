import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default function BadgesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">All Badges</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Earn badges as you use Nocturne. New ones are on the way.
        </p>
      </div>

      <Card className="p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/10 text-2xl text-zinc-600">
          🏅
        </div>
        <p className="text-sm font-medium text-zinc-300">No badges yet</p>
        <p className="mx-auto mt-1.5 max-w-xs text-xs text-zinc-500">
          This is where your badges will show up once they&apos;re live. Check back soon.
        </p>
      </Card>
    </div>
  );
}
