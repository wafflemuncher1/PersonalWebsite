"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow-soft" />
      <div className="pointer-events-none fixed inset-0 bg-grid-lines bg-[length:52px_52px] opacity-[0.12] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_10%,transparent_75%)]" />

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar open={open} onClose={() => setOpen(false)} username={username} isDev={isDev} />

      <div className="relative lg:pl-72">
        <Topbar email={email} username={username} onMenuClick={() => setOpen((o) => !o)} />
        <main key={pathname} className="page-enter relative z-10 px-6 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
