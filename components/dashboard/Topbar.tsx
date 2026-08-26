"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LogOut, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/journal": "Journal",
  "/dashboard/notes": "Notes",
  "/dashboard/goals": "Goals",
  "/dashboard/streaks": "Streaks",
  "/dashboard/analytics": "Account Analytics",
  "/dashboard/badges": "All Badges",
  "/dashboard/dashboard-2": "Dashboard 2",
  "/dashboard/settings": "Settings",
  "/dashboard/profile/customize": "Customize",
  "/dashboard/profile/links": "Links",
  "/dashboard/profile/shop": "Shop",
  "/dashboard/profile/templates": "Templates",
};

export function Topbar({
  email,
  username,
}: {
  email: string;
  username: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const title =
    TITLES[pathname ?? ""] ??
    (pathname?.startsWith("/dashboard/streaks") ? "Streak" : "Dashboard");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (username ?? email ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur-lg sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div>
          <h1 className="font-display text-base font-semibold tracking-tight">{title}</h1>
          <p className="font-mono text-[11px] text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {username && (
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 sm:inline-flex"
            render={
              <a href={`/${username}`} target="_blank" rel="noreferrer">
                View my page <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            }
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{email}</div>
            <DropdownMenuSeparator />
            {username && (
              <DropdownMenuItem
                render={
                  <a href={`/${username}`} target="_blank" rel="noreferrer">
                    <ExternalLink /> View public page
                  </a>
                }
              />
            )}
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
