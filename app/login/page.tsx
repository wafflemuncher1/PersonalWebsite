"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Reveal } from "@/components/ui/Reveal";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const banError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition duration-150 hover:text-zinc-300"
        >
          ← back
        </Link>

        <Reveal>
          <div className="glass rounded-2xl p-8 shadow-glow">
            <h1 className="font-display mb-2 text-2xl font-semibold text-white">Log in to Nocturne</h1>
            <p className="mb-6 text-sm text-zinc-400">
              Sign in with Google, or use your email and password.
            </p>

            {banError === "banned" && (
              <p role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
                This account has been banned.
              </p>
            )}

            <GoogleButton label="Sign in with Google" />

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-wide text-zinc-600">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  required
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition duration-200 ease-premium focus:border-gold-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(212,169,79,0.14)]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="current-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    spellCheck={false}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none transition duration-200 ease-premium focus:border-gold-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(212,169,79,0.14)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 transition hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {status === "error" && (
                <p role="alert" aria-live="polite" className="text-sm text-red-400">
                  {errorMsg || "Something went wrong."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-medium text-ink-950 shadow-glow transition duration-200 ease-premium hover:bg-gold-300 hover:shadow-glow-lg active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
              >
                {status === "loading" ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </Reveal>

        <p className="mt-6 text-center font-mono text-[11px] text-zinc-600">
          protected by Supabase Auth, with row-level security enforced
        </p>
        <p className="mt-2 text-center text-[13px] text-zinc-600">
          New here?{" "}
          <Link href="/signup" className="text-gold-400 hover:text-gold-300">
            Create your page
          </Link>
        </p>
      </div>
    </main>
  );
}
