import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CreateUserForm } from "@/components/dev/CreateUserForm";
import { UserDirectory } from "@/components/dev/UserDirectory";

export default async function DeveloperPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "dev") {
    redirect("/dashboard/profile/customize");
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Developer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create accounts, and manage everyone's access to the backend.
        </p>
      </Reveal>

      <RevealGroup className="space-y-8" stagger={0.08}>
        <RevealItem>
          <CreateUserForm />
        </RevealItem>
        <RevealItem>
          <UserDirectory />
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
