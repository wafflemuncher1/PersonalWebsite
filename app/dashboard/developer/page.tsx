import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

// Gated server-side (not just hidden from the nav) — is_dev is set manually
// in Supabase per-profile. Content here is a placeholder until we decide
// what actually belongs on this page.
export default async function DeveloperPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_dev")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_dev) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Developer</h1>
      </Reveal>

      <RevealGroup className="space-y-6" stagger={0.06}>
        <RevealItem>
          <Link href="/dashboard/developer/users" className="block">
            <Card className="group flex items-center gap-4 p-6 transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-elevate-hover">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-300 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-medium text-white">User Directory</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Search every account, visit their sites, and ban, unban, delete, or restore users.
                </p>
              </div>
            </Card>
          </Link>
        </RevealItem>

        <RevealItem>
          <Card className="p-6">
            <h2 className="mb-1 text-sm font-medium text-white">More coming soon</h2>
            <p className="text-xs text-zinc-500">
              Analytics dashboards and other dev tools will land here next.
            </p>
          </Card>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
