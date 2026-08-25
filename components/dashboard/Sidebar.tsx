"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV_TOP = [{ href: "/dashboard", label: "Overview", icon: "◈", exact: true }];

const NAV_BOTTOM = [
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/dashboard-2", label: "Dashboard 2", icon: "🧪" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

const NAV_GROUPS = [
  {
    key: "profile",
    label: "Profile",
    icon: "👤",
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
    icon: "🌙",
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
  icon: "🛠",
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

  function renderNavLink(item: { href: string; label: string; icon: string; exact?: boolean }) {
    const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ease-premium",
          active
            ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-glow"
            : "text-zinc-400 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white"
        )}
      >
        {active && (
          <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-white/80 to-white/20" />
        )}
        <span
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition-transform duration-200",
            active ? "bg-white/15" : "bg-white/[0.04] group-hover:scale-110"
          )}
        >
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-gradient-to-b from-ink-925 via-ink-950 to-ink-925 backdrop-blur-xl transition-transform duration-300 ease-premium lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-violet-500/25 to-transparent" />

      <div className="flex items-center justify-between px-6 py-6">
        <Logo onBeforeNavigate={onClose} />
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-all duration-200 focus-within:border-violet-500/50 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_0_3px_rgba(212,169,79,0.14)]">
          <span className="text-zinc-600">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features…"
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
          />
          {!query && <span className="font-mono text-[10px] text-zinc-700">⌘K</span>}
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4">
        {filteredNavTop.map((item) => renderNavLink(item))}

        {groups.map(
          (group) =>
            group.matches && (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => setManualOpenKey((k) => (k === group.key ? null : group.key))}
                  className={cn(
                    "group relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ease-premium",
                    group.active
                      ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-glow"
                      : "text-zinc-400 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  {group.active && (
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-white/80 to-white/20" />
                  )}
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition-transform duration-200",
                        group.active ? "bg-white/15" : "bg-white/[0.04] group-hover:scale-110"
                      )}
                    >
                      {group.icon}
                    </span>
                    {group.label}
                  </span>
                  <span
                    className={cn("text-xs transition-transform duration-200", group.expanded ? "rotate-180" : "")}
                  >
                    ⌄
                  </span>
                </button>

                {group.expanded && (
                  <div className="ml-4 mt-1.5 space-y-1 border-l border-white/10 pl-4">
                    {group.filteredItems.map((sub) => {
                      const subActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={onClose}
                          className={cn(
                            "block rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200 ease-premium",
                            subActive
                              ? "bg-violet-500/15 text-violet-300 shadow-[inset_0_0_0_1px_rgba(212,169,79,0.25)]"
                              : "text-zinc-500 hover:translate-x-0.5 hover:bg-white/[0.05] hover:text-zinc-200"
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
        <div className="glass relative m-3 space-y-3 rounded-2xl p-4">
          <div>
            <p className="mb-2 px-1 text-xs text-zinc-500">Check out your page</p>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition-all duration-200 ease-premium hover:border-violet-500/50 hover:bg-violet-500/20"
            >
              <span>↗</span> My Page
            </a>
          </div>
          <button
            onClick={handleShare}
            className="btn-sheen flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 ease-premium hover:shadow-glow-lg hover:from-violet-500 hover:to-violet-400 active:scale-[0.98]"
          >
            <span>⇱</span>
            {copied ? "Link copied ✓" : "Share Your Profile"}
          </button>
        </div>
      )}
    </aside>
  );
}
