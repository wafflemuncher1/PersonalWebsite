"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Search, ArrowUpRight, Share2, Check } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import type { LucideIcon } from "lucide-react";
import { NAV_GROUPS, DEV_GROUP, type NavItem } from "@/lib/dashboard-nav";

const NAV_BOTTOM: NavItem[] = [{ href: "/dashboard/settings", label: "Settings", icon: Settings }];

export function AppSidebar({
  username,
  isDev = false,
}: {
  username: string | null;
  isDev?: boolean;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const groups = useMemo(() => (isDev ? [...NAV_GROUPS, DEV_GROUP] : NAV_GROUPS), [isDev]);

  const matches = (label: string) => !q || label.toLowerCase().includes(q);

  async function handleShare() {
    if (!username) return;
    const url = `${window.location.origin}/${username}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "My Nocturne page", url });
        return;
      } catch {
        // user cancelled the share sheet — fall through to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing more we can do silently
    }
  }

  function renderItem(item: { href: string; label: string; icon: LucideIcon; exact?: boolean }) {
    if (!matches(item.label)) return null;
    const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.label}
          render={
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          }
        />
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 px-2 py-3">
        <div className="flex items-center justify-between px-1">
          <Logo />
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => {
          const items = group.items.filter((i) => matches(i.label));
          if (q && items.length === 0 && !group.label.toLowerCase().includes(q)) return null;
          return (
            <SidebarGroup key={group.key}>
              <SidebarGroupLabel>
                <group.icon className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{(q ? items : group.items).map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>{NAV_BOTTOM.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {username && (
        <SidebarFooter className="gap-2 group-data-[collapsible=icon]:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-1.5"
            render={
              <a href={`/${username}`} target="_blank" rel="noreferrer">
                My page <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            }
          />
          <Button size="sm" className="w-full justify-center gap-1.5" onClick={handleShare}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied" : "Share your profile"}
          </Button>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
