"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/notes": "Notes",
  "/dashboard/goals": "Goals",
  "/dashboard/streaks": "Streaks",
};

export function Topbar({ email }: { email: string }) {
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

      <div className="flex items-center gap-3">
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
