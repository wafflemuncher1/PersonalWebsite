"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export function DashboardShell({
  email,
  username,
  isDev = false,
  children,
}: {
  email: string;
  username: string | null;
  isDev?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <AppSidebar username={username} isDev={isDev} />
      <SidebarInset>
        <Topbar email={email} username={username} />
        <main key={pathname} className="page-enter flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
