"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";

// Shown instead of the real dashboard for role = 'normal' — the backend is
// gated behind an explicit tester/dev role granted from the Developer page,
// so a fresh signup lands here rather than at Customize.
export function DevelopmentGate({ email }: { email: string }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void-950 px-6">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow-signal" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:48px_48px] opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <Reveal className="relative z-10 w-full max-w-sm">
        <div className="glass rounded-2xl p-8 text-center shadow-glow-signal">
          <h1 className="font-display mb-2 text-2xl font-semibold text-white">Still in development</h1>
          <p className="text-sm text-zinc-400">
            The Nocturne backend isn't open yet. You'll get access here once you're added as a tester.
          </p>
          <p className="mt-4 font-mono text-xs text-zinc-600">signed in as {email}</p>
          <Button variant="outline" className="mt-6 w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </Reveal>
    </main>
  );
}
