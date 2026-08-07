"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◈", exact: true },
  { href: "/dashboard/journal", label: "Journal", icon: "📓" },
  { href: "/dashboard/goals", label: "Goals", icon: "◎" },
  { href: "/dashboard/streaks", label: "Streaks", icon: "🔥" },
  { href: "/dashboard/notes", label: "Notes", icon: "✎" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/badges", label: "Badges", icon: "🏅" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

const PROFILE_SUB = [
  { href: "/dashboard/profile/customize", label: "Customize" },
  { href: "/dashboard/profile/links", label: "Links" },
  { href: "/dashboard/profile/templates", label: "Templates" },
];

export function Sidebar({
  open,
  onClose,
  username,
}: {
  open: boolean;
  onClose: () => void;
  username: string | null;
}) {
  const pathname = usePathname();
  const [manualOpen, setManualOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");

  const profileActive = pathname?.startsWith("/dashboard/profile") ?? false;

  const q = query.trim().toLowerCase();
  const filteredNav = useMemo(
    () => (q ? NAV.filter((item) => item.label.toLowerCase().includes(q)) : NAV),
    [q]
  );
  const filteredProfileSub = useMemo(
    () => (q ? PROFILE_SUB.filter((item) => item.label.toLowerCase().includes(q)) : PROFILE_SUB),
    [q]
  );
  const profileMatches = q ? "profile".includes(q) || filteredProfileSub.length > 0 : true;
  const profileExpanded = profileActive || manualOpen || (q.length > 0 && filteredProfileSub.length > 0);

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

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-x-0",
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
          ✕
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
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
        {filteredNav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-glow"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base",
                  active ? "bg-white/15" : "bg-white/[0.04]"
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Profile — expandable */}
        {profileMatches && (
          <div>
            <button
              type="button"
              onClick={() => setManualOpen((o) => !o)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all",
                profileActive
                  ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-glow"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base",
                    profileActive ? "bg-white/15" : "bg-white/[0.04]"
                  )}
                >
                  👤
                </span>
                Profile
              </span>
              <span
                className={cn("text-xs transition-transform duration-200", profileExpanded ? "rotate-180" : "")}
              >
                ⌄
              </span>
            </button>

            {profileExpanded && (
              <div className="ml-4 mt-1.5 space-y-1 border-l border-white/10 pl-4">
                {filteredProfileSub.map((sub) => {
                  const subActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-xl px-3.5 py-2 text-xs font-medium transition",
                        subActive
                          ? "bg-violet-500/15 text-violet-300"
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
        )}
      </nav>

      {username && (
        <div className="space-y-3 border-t border-white/5 p-4">
          <div>
            <p className="mb-2 px-1 text-xs text-zinc-500">Check out your page</p>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
            >
              <span>↗</span> My Page
            </a>
          </div>
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400"
          >
            <span>⇱</span>
            {copied ? "Link copied ✓" : "Share Your Profile"}
          </button>
        </div>
      )}
    </aside>
  );
}
