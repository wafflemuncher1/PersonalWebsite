import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";

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
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Developer</h1>

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white">Coming soon</h2>
        <p className="text-xs text-zinc-500">
          This page is only visible to dev accounts. We&apos;ll figure out what goes here next.
        </p>
      </Card>
    </div>
  );
}
