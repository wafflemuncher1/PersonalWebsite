import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserDirectory } from "@/components/dev/UserDirectory";

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Users</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Search, filter, and moderate every account on Nocturne.
        </p>
      </div>

      <UserDirectory />
    </div>
  );
}
