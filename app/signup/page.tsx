"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isReservedUsername } from "@/lib/reserved-usernames";

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "check-email" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") === "pro" ? "pro" : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      setStatus("error");
      setErrorMsg("Username must be 3–20 characters: lowercase letters, numbers, - or _.");
      return;
    }
    if (isReservedUsername(cleanUsername)) {
      setStatus("error");
      setErrorMsg("That username is reserved. Try another.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setStatus("loading");
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();
    if (existing) {
      setStatus("error");
      setErrorMsg("That username is taken. Try another.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: cleanUsername } },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    if (data.session) {
      router.push(plan === "pro" ? "/dashboard/settings?checkout=pro" : "/dashboard");
      router.refresh();
    } else {
      // Email confirmation is required before the session is issued.
      setStatus("check-email");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
        >
          ← back
        </Link>

        <div className="glass rounded-2xl p-8 shadow-glow">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_12px_2px_rgba(139,92,246,0.8)]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              create your page
            </span>
          </div>

          {status === "check-email" ? (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-white">Check your email</h1>
              <p className="text-sm text-zinc-400">
                We sent a confirmation link to <span className="text-zinc-200">{email}</span>.
                Click it, then come back and log in.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.1]"
              >
                Go to login
              </Link>
            </>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-white">
                {plan === "pro" ? "Sign up for Pro" : "Sign up for Nocturne"}
              </h1>
              <p className="mb-6 text-sm text-zinc-400">
                Free forever plan. Upgrade any time from Settings.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Username
                  </label>
                  <div className="flex items-center rounded-lg border border-white/10 bg-white/5 pl-3.5 pr-1 transition focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20">
                    <span className="text-sm text-zinc-600">nocturne.co/</span>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="yourname"
                      className="w-full bg-transparent px-1 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-60"
                >
                  {status === "loading" ? "Creating your page…" : "Create account"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
