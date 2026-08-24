"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  onMenuClick,
}: {
  email: string;
  username: string | null;
  onMenuClick: () => void;
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

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-ink-950/70 px-6 py-4 backdrop-blur-xl transition-shadow sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 transition-all duration-200 ease-premium hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white active:scale-95 lg:hidden"
        >
          <span className="flex flex-col items-center gap-[3px]">
            <span className="block h-[1.5px] w-4 bg-current" />
            <span className="block h-[1.5px] w-4 bg-current" />
            <span className="block h-[1.5px] w-4 bg-current" />
          </span>
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">{title}</h1>
          <p className="font-mono text-[11px] text-zinc-600">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {username && (
          <a
            href={`/${username}`}
            target="_blank"
            rel="noreferrer"
            className="btn-sheen rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-glow transition-all duration-200 ease-premium hover:from-violet-500 hover:to-violet-400 active:scale-95 lg:hidden"
          >
            View my page ↗
          </a>
        )}
        <span className="hidden items-center gap-1.5 font-mono text-xs text-zinc-500 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          {email}
        </span>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition-all duration-200 ease-premium hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 active:scale-95"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
