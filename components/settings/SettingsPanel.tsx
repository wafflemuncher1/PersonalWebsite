"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { getPlan } from "@/lib/plans";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { containsProfanity } from "@/lib/profanity";
import type { Profile } from "@/lib/types";

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;

export function SettingsPanel({
  email,
  createdAt,
  lastSignInAt,
  profile,
}: {
  email: string;
  createdAt: string;
  lastSignInAt: string;
  profile: Profile | null;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [pwError, setPwError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [usernameError, setUsernameError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleUsernameSave(e: React.FormEvent) {
    e.preventDefault();
    setUsernameError("");
    const cleanUsername = username.trim().toLowerCase();

    if (!USERNAME_RE.test(cleanUsername)) {
      setUsernameStatus("error");
      setUsernameError("Must be 3–20 characters: lowercase letters, numbers, - or _.");
      return;
    }
    if (isReservedUsername(cleanUsername)) {
      setUsernameStatus("error");
      setUsernameError("That username is reserved. Try another.");
      return;
    }
    if (containsProfanity(cleanUsername)) {
      setUsernameStatus("error");
      setUsernameError("Let's keep it clean — try a different username.");
      return;
    }

    setUsernameStatus("saving");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: cleanUsername })
      .eq("id", profile?.id);

    if (updateError) {
      setUsernameStatus("error");
      setUsernameError(updateError.message.includes("duplicate") ? "That username is taken." : updateError.message);
      return;
    }

    setUsername(cleanUsername);
    setUsernameStatus("done");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword.length < 8) {
      setPwStatus("error");
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus("error");
      setPwError("Passwords don't match.");
      return;
    }
    setPwStatus("saving");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwStatus("error");
      setPwError(error.message);
      return;
    }
    setPwStatus("done");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleExport() {
    setExporting(true);
    const [notes, goals, categories, streaks, streakLogs] = await Promise.all([
      supabase.from("notes").select("*"),
      supabase.from("goals").select("*"),
      supabase.from("goal_categories").select("*"),
      supabase.from("streaks").select("*"),
      supabase.from("streak_logs").select("*"),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      notes: notes.data ?? [],
      goals: goals.data ?? [],
      goal_categories: categories.data ?? [],
      streaks: streaks.data ?? [],
      streak_logs: streakLogs.data ?? [],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nocturne-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">Settings</h1>

      <BillingCard profile={profile} autoCheckout={searchParams.get("checkout")} />

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-medium text-white">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-zinc-500">Email</span>
            <span className="font-mono text-zinc-200">{email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-zinc-500">Member since</span>
            <span className="font-mono text-zinc-200">{createdAt ? formatDateTime(createdAt) : "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Last sign-in</span>
            <span className="font-mono text-zinc-200">{lastSignInAt ? formatDateTime(lastSignInAt) : "—"}</span>
          </div>
        </div>
      </Card>

      {profile && (
        <Card className="p-6">
          <h2 className="mb-1 text-sm font-medium text-white">Page URL</h2>
          <p className="mb-4 text-xs text-zinc-500">
            Your public page lives at nocturne.co/{profile.username}. Background, picture, bio,
            and links live under Profile in the sidebar.
          </p>
          <form onSubmit={handleUsernameSave} className="space-y-3">
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 pl-3.5 pr-1 transition focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20">
              <span className="text-sm text-zinc-600">nocturne.co/</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full bg-transparent px-1 py-2.5 text-sm text-white outline-none"
              />
            </div>
            {usernameStatus === "error" && <p className="text-sm text-red-400">{usernameError}</p>}
            {usernameStatus === "done" && <p className="text-sm text-emerald-400">Saved.</p>}
            <Button type="submit" disabled={usernameStatus === "saving"}>
              {usernameStatus === "saving" ? "Saving…" : "Update username"}
            </Button>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white">Change password</h2>
        <p className="mb-4 text-xs text-zinc-500">Choose something you don't use anywhere else.</p>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {pwStatus === "error" && <p className="text-sm text-red-400">{pwError}</p>}
          {pwStatus === "done" && <p className="text-sm text-emerald-400">Password updated.</p>}
          <Button type="submit" disabled={pwStatus === "saving"}>
            {pwStatus === "saving" ? "Saving…" : "Update password"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white">Export your data</h2>
        <p className="mb-4 text-xs text-zinc-500">
          Download every note, goal, and streak as a single JSON file.
        </p>
        <Button variant="secondary" onClick={handleExport} disabled={exporting}>
          {exporting ? "Preparing…" : "Download export"}
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 text-sm font-medium text-white">Session</h2>
        <p className="mb-4 text-xs text-zinc-500">Sign out of Nocturne on this device.</p>
        <Button variant="danger" onClick={handleSignOut}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}

function BillingCard({
  profile,
  autoCheckout,
}: {
  profile: Profile | null;
  autoCheckout: string | null;
}) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState("");
  const plan = getPlan(profile?.plan ?? "free");

  async function handleUpgrade() {
    setError("");
    setLoading("checkout");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setError("");
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open billing portal.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open billing portal.");
      setLoading(null);
    }
  }

  useEffect(() => {
    if (autoCheckout === "pro" && profile?.plan === "free") {
      handleUpgrade();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheckout]);

  return (
    <Card className="p-6">
      <h2 className="mb-1 text-sm font-medium text-white">Billing</h2>
      <p className="mb-4 text-xs text-zinc-500">Manage your plan and payment method.</p>

      <div className="mb-4 flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
        <div>
          <p className="text-sm text-zinc-200">
            {plan.name} plan
            {profile?.subscription_status && profile.subscription_status !== "inactive" && (
              <span className="ml-2">
                <Badge color={profile.subscription_status === "active" ? "emerald" : "amber"}>
                  {profile.subscription_status}
                </Badge>
              </span>
            )}
          </p>
          <p className="text-xs text-zinc-500">
            {plan.price}
            {plan.priceSuffix}
          </p>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        {profile?.plan !== "pro" && (
          <Button onClick={handleUpgrade} disabled={loading !== null}>
            {loading === "checkout" ? "Redirecting…" : "Upgrade to Pro"}
          </Button>
        )}
        {profile?.stripe_customer_id && (
          <Button variant="secondary" onClick={handleManageBilling} disabled={loading !== null}>
            {loading === "portal" ? "Redirecting…" : "Manage billing"}
          </Button>
        )}
      </div>
    </Card>
  );
}
