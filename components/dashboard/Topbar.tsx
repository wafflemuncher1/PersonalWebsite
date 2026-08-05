"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/notes": "Notes",
  "/dashboard/goals": "Goals",
  "/dashboard/streaks": "Streaks",
  "/dashboard/settings": "Settings",
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
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-ink-950/70 px-6 py-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
        >
          <span className="flex flex-col items-center gap-[3px]">
            <span className="block h-[1.5px] w-4 bg-current" />
            <span className="block h-[1.5px] w-4 bg-current" />
            <span className="block h-[1.5px] w-4 bg-current" />
          </span>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
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
            className="rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400"
          >
            View my page ↗
          </a>
        )}
        <span className="hidden font-mono text-xs text-zinc-500 sm:inline">{email}</span>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
