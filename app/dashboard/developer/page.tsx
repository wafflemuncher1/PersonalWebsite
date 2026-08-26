import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
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
        <h1 className="font-display text-3xl font-semibold tracking-tight">Developer</h1>
      </Reveal>

      <RevealGroup className="space-y-6" stagger={0.06}>
        <RevealItem>
          <Link href="/dashboard/developer/users" className="block">
            <Card className="group transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-medium">User Directory</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Search every account, visit their sites, and ban, unban, delete, or restore users.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </RevealItem>

        <RevealItem>
          <Card>
            <CardContent>
              <h2 className="mb-1 text-sm font-medium">More coming soon</h2>
              <p className="text-xs text-muted-foreground">
                Analytics dashboards and other dev tools will land here next.
              </p>
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
