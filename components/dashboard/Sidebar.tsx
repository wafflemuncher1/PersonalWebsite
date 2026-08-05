"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "◈", exact: true },
  { href: "/dashboard/notes", label: "Notes", icon: "✎" },
  { href: "/dashboard/goals", label: "Goals", icon: "◎" },
  { href: "/dashboard/streaks", label: "Streaks", icon: "🔥" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-ink-950/95 backdrop-blur-xl transition-transform duration-300 ease-out",
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
          className="rounded-md p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-violet-500/10 text-white shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
              )}
            >
              <span className={cn("text-base", active ? "text-violet-400" : "text-zinc-600")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
        >
          <span className="text-base">←</span>
          Public site
        </Link>
      </div>
    </aside>
  );
}
