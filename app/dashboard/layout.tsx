import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

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

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />
      <Sidebar />
      <div className="relative sm:pl-60">
        <Topbar email={user.email ?? ""} />
        <main className="relative z-10 px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
