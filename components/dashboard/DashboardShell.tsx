"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export function DashboardShell({
  email,
  username,
  children,
}: {
  email: string;
  username: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="dashboard-ambient" />
      <AppSidebar username={username} />
      <SidebarInset className="relative z-[1] bg-transparent">
        <Topbar email={email} username={username} />
        <main key={pathname} className="page-enter relative z-[1] flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
