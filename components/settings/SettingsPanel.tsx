"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { formatDateTime } from "@/lib/utils";
import { getPlan } from "@/lib/plans";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { containsProfanity } from "@/lib/profanity";
import type { Profile } from "@/lib/types";

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;
const USERNAME_COOLDOWN_DAYS = 30;

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
  const [username, setUsername] = useState(profile?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [usernameError, setUsernameError] = useState("");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [displayNameStatus, setDisplayNameStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [displayNameError, setDisplayNameError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const lockedUntil = profile?.username_changed_at
    ? new Date(new Date(profile.username_changed_at).getTime() + USERNAME_COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
    : null;
  const usernameLocked = !!lockedUntil && lockedUntil > new Date();
  const daysLeft = usernameLocked
    ? Math.max(1, Math.ceil((lockedUntil!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  async function handleUsernameSave(e: React.FormEvent) {
    e.preventDefault();
    setUsernameError("");
    if (usernameLocked) return;
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
    router.refresh();
  }

  async function handleDisplayNameSave(e: React.FormEvent) {
    e.preventDefault();
    setDisplayNameError("");
    const cleanName = displayName.trim();

    if (!cleanName) {
      setDisplayNameStatus("error");
      setDisplayNameError("Display name can't be empty.");
      return;
    }
    if (cleanName.length > 40) {
      setDisplayNameStatus("error");
      setDisplayNameError("Keep it under 40 characters.");
      return;
    }
    if (containsProfanity(cleanName)) {
      setDisplayNameStatus("error");
      setDisplayNameError("Let's keep it clean — try something else.");
      return;
    }

    setDisplayNameStatus("saving");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: cleanName })
      .eq("id", profile?.id);

    if (updateError) {
      setDisplayNameStatus("error");
      setDisplayNameError(updateError.message);
      return;
    }

    setDisplayName(cleanName);
    setDisplayNameStatus("done");
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
      </Reveal>

      <RevealGroup className="space-y-6" stagger={0.06}>
        <RevealItem>
          <BillingCard profile={profile} autoCheckout={searchParams.get("checkout")} />
        </RevealItem>

        <RevealItem>
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono">{email}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-mono">{createdAt ? formatDateTime(createdAt) : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last sign-in</span>
                <span className="font-mono">{lastSignInAt ? formatDateTime(lastSignInAt) : "—"}</span>
              </div>
            </CardContent>
          </Card>
        </RevealItem>

        {profile && (
          <RevealItem>
            <Card>
              <CardHeader>
                <CardTitle>Page URL</CardTitle>
                <CardDescription>
                  Your public page lives at nocturne.co/{profile.username}. Background, picture, bio,
                  and links live under Profile in the sidebar. You can change this once every{" "}
                  {USERNAME_COOLDOWN_DAYS} days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usernameLocked ? (
                  <p className="glass-inset rounded-lg px-3.5 py-2.5 text-sm text-muted-foreground">
                    You can change your username again in {daysLeft} day{daysLeft === 1 ? "" : "s"}.
                  </p>
                ) : (
                  <form onSubmit={handleUsernameSave} className="space-y-3">
                    <div className="flex h-8 items-center rounded-lg border border-input bg-transparent pl-2.5 pr-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                      <span className="text-sm text-muted-foreground">nocturne.co/</span>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        className="w-full bg-transparent px-1 py-1 text-sm outline-none"
                      />
                    </div>
                    {usernameStatus === "error" && <p className="text-sm text-destructive">{usernameError}</p>}
                    {usernameStatus === "done" && <p className="text-sm text-emerald-500">Saved.</p>}
                    <Button type="submit" disabled={usernameStatus === "saving"}>
                      {usernameStatus === "saving" ? "Saving…" : "Update username"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </RevealItem>
        )}

        {profile && (
          <RevealItem>
            <Card>
              <CardHeader>
                <CardTitle>Display Name</CardTitle>
                <CardDescription>
                  Shown on your public page instead of your username. Change it any time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDisplayNameSave} className="space-y-3">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    maxLength={40}
                  />
                  {displayNameStatus === "error" && <p className="text-sm text-destructive">{displayNameError}</p>}
                  {displayNameStatus === "done" && <p className="text-sm text-emerald-500">Saved.</p>}
                  <Button type="submit" disabled={displayNameStatus === "saving"}>
                    {displayNameStatus === "saving" ? "Saving…" : "Update display name"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </RevealItem>
        )}

        <RevealItem>
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Choose something you don&apos;t use anywhere else.</CardDescription>
            </CardHeader>
            <CardContent>
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
                {pwStatus === "error" && <p className="text-sm text-destructive">{pwError}</p>}
                {pwStatus === "done" && <p className="text-sm text-emerald-500">Password updated.</p>}
                <Button type="submit" disabled={pwStatus === "saving"}>
                  {pwStatus === "saving" ? "Saving…" : "Update password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </RevealItem>

        <RevealItem>
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>Sign out of Nocturne on this device.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign out
              </Button>
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>
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
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your plan and payment method.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="glass-inset glass-inset-hover mb-4 flex items-center justify-between rounded-lg p-3.5">
          <div>
            <p className="text-sm">
              {plan.name} plan
              {profile?.subscription_status && profile.subscription_status !== "inactive" && (
                <span className="ml-2">
                  <Badge variant={profile.subscription_status === "active" ? "default" : "secondary"}>
                    {profile.subscription_status}
                  </Badge>
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {plan.price}
              {plan.priceSuffix}
            </p>
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

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
      </CardContent>
    </Card>
  );
}
