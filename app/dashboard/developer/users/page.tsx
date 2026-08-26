import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserDirectory } from "@/components/dev/UserDirectory";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function DeveloperUsersPage() {
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
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter, and moderate every account on Nocturne.
        </p>
      </Reveal>

      <UserDirectory />
    </div>
  );
}
