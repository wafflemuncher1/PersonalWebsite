"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◈", exact: true },
  { href: "/dashboard/journal", label: "Journal", icon: "📓" },
  { href: "/dashboard/goals", label: "Goals", icon: "◎" },
  { href: "/dashboard/streaks", label: "Streaks", icon: "🔥" },
  { href: "/dashboard/notes", label: "Notes", icon: "✎" },
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

  const profileActive = pathname?.startsWith("/dashboard/profile") ?? false;
  const profileExpanded = profileActive || manualOpen;

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
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_14px_3px_rgba(139,92,246,0.7)]" />
          <span className="text-sm font-semibold tracking-wide text-white">NOCTURNE</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4">
        {NAV.map((item) => {
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
            <span className={cn("text-xs transition-transform duration-200", profileExpanded ? "rotate-180" : "")}>
              ⌄
            </span>
          </button>

          {profileExpanded && (
            <div className="ml-4 mt-1.5 space-y-1 border-l border-white/10 pl-4">
              {PROFILE_SUB.map((sub) => {
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
      </nav>

      <div className="space-y-2 border-t border-white/5 p-4">
        {username && (
          <>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3.5 shadow-glow transition hover:from-violet-500 hover:to-violet-400"
            >
              <span className="text-sm font-bold text-white">My Page</span>
              <span className="text-white/80">↗</span>
            </a>
            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.08]"
            >
              {copied ? "Link copied ✓" : "Share my profile"}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
