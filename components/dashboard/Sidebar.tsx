"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  FlaskConical,
  Settings,
  UserCircle,
  Palette,
  Link2,
  ShoppingBag,
  LayoutTemplate,
  Award,
  Moon,
  NotebookPen,
  BookOpen,
  Flame,
  Target,
  Terminal,
  Users,
  Search,
  X,
  ChevronDown,
  ArrowUpRight,
  Share2,
  Check,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const NAV_TOP = [{ href: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true }];

const NAV_BOTTOM = [
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/dashboard-2", label: "Dashboard 2", icon: FlaskConical },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const NAV_GROUPS = [
  {
    key: "profile",
    label: "Profile",
    icon: UserCircle,
    items: [
      { href: "/dashboard/profile/customize", label: "Customize" },
      { href: "/dashboard/profile/links", label: "Links" },
      { href: "/dashboard/profile/shop", label: "Shop" },
      { href: "/dashboard/profile/templates", label: "Templates" },
      { href: "/dashboard/badges", label: "Badges" },
    ],
  },
  {
    key: "lifestyle",
    label: "Lifestyle",
    icon: Moon,
    items: [
      { href: "/dashboard/notes", label: "Notes" },
      { href: "/dashboard/journal", label: "Journal" },
      { href: "/dashboard/streaks", label: "Streaks" },
      { href: "/dashboard/goals", label: "Goals" },
    ],
  },
];

// Only ever shown to profiles with is_dev = true (set manually in Supabase).
// Contents are a placeholder for now — more will land here later.
const DEV_GROUP = {
  key: "developer",
  label: "Developer",
  icon: Terminal,
  items: [
    { href: "/dashboard/developer", label: "Overview" },
    { href: "/dashboard/developer/users", label: "Users" },
  ],
};

export function Sidebar({
  open,
  onClose,
  username,
  isDev = false,
}: {
  open: boolean;
  onClose: () => void;
  username: string | null;
  isDev?: boolean;
}) {
  const pathname = usePathname();
  const [manualOpenKey, setManualOpenKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const navGroups = useMemo(() => (isDev ? [...NAV_GROUPS, DEV_GROUP] : NAV_GROUPS), [isDev]);

  const filteredNavTop = useMemo(
    () => (q ? NAV_TOP.filter((item) => item.label.toLowerCase().includes(q)) : NAV_TOP),
    [q]
  );
  const filteredNavBottom = useMemo(
    () => (q ? NAV_BOTTOM.filter((item) => item.label.toLowerCase().includes(q)) : NAV_BOTTOM),
    [q]
  );

  const groups = useMemo(
    () =>
      navGroups.map((group) => {
        const filteredItems = q
          ? group.items.filter((item) => item.label.toLowerCase().includes(q))
          : group.items;
        const active = group.items.some((item) => pathname === item.href);
        const matches = q ? group.label.toLowerCase().includes(q) || filteredItems.length > 0 : true;
        const expanded = active || manualOpenKey === group.key || (q.length > 0 && filteredItems.length > 0);
        return { ...group, filteredItems, active, matches, expanded };
      }),
    [navGroups, q, pathname, manualOpenKey]
  );

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

  function renderNavLink(item: { href: string; label: string; icon: LucideIcon; exact?: boolean }) {
    const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-premium",
          active
            ? "bg-gold-400/12 text-gold-200"
            : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
        )}
      >
        {active && <span className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-gold-400" />}
        <Icon
          className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-gold-300" : "text-zinc-500 group-hover:text-zinc-300")}
          strokeWidth={1.75}
        />
        {item.label}
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/8 bg-ink-950 transition-transform duration-300 ease-premium lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <Logo onBeforeNavigate={onClose} />
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-all duration-200 focus-within:border-gold-400/40 focus-within:bg-white/[0.05]">
          <Search className="h-3.5 w-3.5 text-zinc-600" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features"
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {filteredNavTop.map((item) => renderNavLink(item))}

        {groups.map(
          (group) =>
            group.matches && (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => setManualOpenKey((k) => (k === group.key ? null : group.key))}
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-premium",
                    group.active ? "text-gold-200" : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <group.icon
                      className={cn("h-4 w-4 shrink-0", group.active ? "text-gold-300" : "text-zinc-500 group-hover:text-zinc-300")}
                      strokeWidth={1.75}
                    />
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 text-zinc-600 transition-transform duration-200", group.expanded && "rotate-180")}
                  />
                </button>

                {group.expanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-4">
                    {group.filteredItems.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={cn(
                            "block rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-premium",
                            subActive
                              ? "bg-gold-400/10 text-gold-300"
                              : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                          )}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )
        )}

        {filteredNavBottom.map((item) => renderNavLink(item))}
      </nav>

      {username && (
        <div className="m-3 space-y-2.5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition-all duration-200 ease-premium hover:border-white/25 hover:text-white"
          >
            My page <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-glow transition-all duration-200 ease-premium hover:bg-gold-300 hover:shadow-glow-lg active:scale-[0.98]"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied" : "Share your profile"}
          </button>
        </div>
      )}
    </aside>
  );
}
