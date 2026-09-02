"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { containsProfanity } from "@/lib/profanity";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Reveal } from "@/components/ui/Reveal";

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "check-email" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

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
    if (containsProfanity(cleanUsername)) {
      setStatus("error");
      setErrorMsg("Let's keep it clean. Try a different username.");
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
      setErrorMsg(
        error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists")
          ? "An account with that email already exists. Try logging in instead."
          : error.message
      );
      return;
    }

    // Supabase returns a 200 with an empty `identities` array (instead of an
    // error) when the email is already registered — this is the documented
    // way to detect it without leaking which emails exist to attackers.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setStatus("error");
      setErrorMsg("An account with that email already exists. Try logging in instead.");
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation is required before the session is issued.
      setStatus("check-email");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void-950 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow-signal" />
      <div className="pointer-events-none absolute inset-0 bg-grid-lines bg-[size:48px_48px] opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition duration-150 hover:text-zinc-300"
        >
          ← back
        </Link>

        <Reveal>
          <div className="glass rounded-2xl p-8 shadow-glow-signal">
            {status === "check-email" ? (
              <>
                <h1 className="font-display mb-2 text-2xl font-semibold text-white">Check your email</h1>
                <p className="text-sm text-zinc-400">
                  We sent a confirmation link to <span className="text-zinc-200">{email}</span>.
                  Click it, then come back and log in.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition duration-200 ease-premium hover:bg-white/[0.1] active:scale-95"
                >
                  Go to login
                </Link>
              </>
            ) : (
              <>
                <h1 className="font-display mb-2 text-2xl font-semibold text-white">
                  Sign up for Nocturne
                </h1>

                <GoogleButton label="Sign up with Google" />
                <p className="mt-2 text-center text-[11px] text-zinc-600">
                  We&apos;ll pick a username from your email. Change it any time in Settings.
                </p>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] uppercase tracking-wide text-zinc-600">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Username
                    </label>
                    <div className="flex items-center rounded-lg border border-white/10 bg-white/5 pl-3.5 pr-1 transition duration-200 ease-premium focus-within:border-signal-400/50 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_0_3px_rgba(62,194,245,0.14)]">
                      <span className="text-sm text-zinc-600">nocturne.co/</span>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        spellCheck={false}
                        autoCapitalize="none"
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
                      name="email"
                      type="email"
                      inputMode="email"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition duration-200 ease-premium focus:border-signal-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(62,194,245,0.14)]"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="new-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        spellCheck={false}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none transition duration-200 ease-premium focus:border-signal-400/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(62,194,245,0.14)]"
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
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-lg bg-signal-500 px-4 py-2.5 text-sm font-medium text-void-950 shadow-glow-signal transition duration-200 ease-premium hover:bg-signal-400 hover:shadow-glow-signal-lg active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
                  >
                    {status === "loading" ? "Creating your page…" : "Create account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </Reveal>

        <p className="mt-6 text-center font-mono text-[11px] text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-signal-400 hover:text-signal-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
