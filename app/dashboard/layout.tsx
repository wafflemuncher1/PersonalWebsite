import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DevelopmentGate } from "@/components/dashboard/DevelopmentGate";

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
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "normal") {
    return <DevelopmentGate email={user.email ?? ""} />;
  }

  return (
    <DashboardShell
      email={user.email ?? ""}
      username={profile?.username ?? null}
      isDev={profile?.role === "dev"}
    >
      {children}
    </DashboardShell>
  );
}
