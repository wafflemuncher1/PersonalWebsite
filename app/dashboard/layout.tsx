import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_dev")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <DashboardShell
      email={user.email ?? ""}
      username={profile?.username ?? null}
      isDev={profile?.is_dev ?? false}
    >
      {children}
    </DashboardShell>
  );
}
