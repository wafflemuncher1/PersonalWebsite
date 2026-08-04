"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◈", exact: true },
  { href: "/dashboard/notes", label: "Notes", icon: "✎" },
  { href: "/dashboard/goals", label: "Goals", icon: "◎" },
  { href: "/dashboard/streaks", label: "Streaks", icon: "🔥" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/5 bg-ink-950/80 backdrop-blur-xl sm:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_14px_3px_rgba(139,92,246,0.7)]" />
        <span className="text-sm font-semibold tracking-wide text-white">NOCTURNE</span>
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
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
        >
          <span className="text-base">←</span>
          Public site
        </Link>
      </div>
    </aside>
  );
}
