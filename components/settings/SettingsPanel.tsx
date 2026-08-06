"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { getPlan } from "@/lib/plans";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { firstProfaneField } from "@/lib/profanity";
import type { Profile, ProfileLink } from "@/lib/types";

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
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="max-w-2xl space-y-6">
      <PublicProfileCard profile={profile} />
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

function PublicProfileCard({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [showStats, setShowStats] = useState(profile?.show_stats ?? false);
  const [links, setLinks] = useState<ProfileLink[]>(
    profile?.links?.length ? profile.links : [{ label: "", url: "" }]
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  function updateLink(i: number, patch: Partial<ProfileLink>) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: "", url: "" }]);
  }

  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setError("Avatar must be an image.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setStatus("error");
      setError("Avatar must be under 3MB.");
      return;
    }

    setError("");
    setAvatarUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setStatus("error");
      setError(uploadError.message);
      setAvatarUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setAvatarUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanUsername = username.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const cleanBio = bio.trim();

    if (!USERNAME_RE.test(cleanUsername)) {
      setStatus("error");
      setError("Username must be 3–20 characters: lowercase letters, numbers, - or _.");
      return;
    }
    if (isReservedUsername(cleanUsername)) {
      setStatus("error");
      setError("That username is reserved. Try another.");
      return;
    }

    const cleanLinks = links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.label && l.url);

    const profanityCheck: Record<string, string> = {
      username: cleanUsername,
      "display name": cleanDisplayName,
      bio: cleanBio,
    };
    cleanLinks.forEach((l, i) => {
      profanityCheck[`link ${i + 1} label`] = l.label;
    });
    const badField = firstProfaneField(profanityCheck);
    if (badField) {
      setStatus("error");
      setError(`Let's keep it clean — please revise the ${badField}.`);
      return;
    }

    setStatus("saving");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name: cleanDisplayName,
        bio: cleanBio,
        avatar_url: avatarUrl.trim() || null,
        show_stats: showStats,
        links: cleanLinks,
      })
      .eq("id", profile?.id);

    if (updateError) {
      setStatus("error");
      setError(
        updateError.message.includes("duplicate")
          ? "That username is taken."
          : updateError.message.includes("not allowed")
            ? "That contains language that isn't allowed. Please revise."
            : updateError.message
      );
      return;
    }

    setUsername(cleanUsername);
    setStatus("done");
  }

  if (!profile) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Public profile</h2>
        <a
          href={`/${profile.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-violet-400 hover:text-violet-300"
        >
          view page →
        </a>
      </div>
      <p className="mb-5 text-xs text-zinc-500">
        This is what anyone visiting nocturne.co/{profile.username} sees. Nothing from your
        private dashboard shows up here unless you turn it on below.{" "}
        <span className="text-zinc-600">
          {(profile.view_count ?? 0).toLocaleString()} view{profile.view_count === 1 ? "" : "s"} so far.
        </span>
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Profile picture</label>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-500 text-lg font-semibold text-white">
                {(displayName || username || "?").trim().charAt(0).toUpperCase()}
              </div>
            )}
            <label className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.08]">
              {avatarUploading ? "Uploading…" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Username</label>
          <div className="flex items-center rounded-lg border border-white/10 bg-white/5 pl-3.5 pr-1 transition focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20">
            <span className="text-sm text-zinc-600">nocturne.co/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full bg-transparent px-1 py-2.5 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Display name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Bio</label>
          <Textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A line or two about you."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">Links</label>
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(i, { label: e.target.value })}
                  placeholder="Label"
                  className="w-28 shrink-0"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(i, { url: e.target.value })}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="shrink-0 rounded-lg border border-white/10 px-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-red-300"
                  aria-label="Remove link"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLink}
            className="mt-2 text-xs text-violet-400 hover:text-violet-300"
          >
            + Add link
          </button>
        </div>

        <label className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3.5">
          <div>
            <p className="text-sm text-zinc-200">Show public stats</p>
            <p className="text-xs text-zinc-500">
              Goals completed, active streaks, check-ins — aggregate counts only.
            </p>
          </div>
          <input
            type="checkbox"
            checked={showStats}
            onChange={(e) => setShowStats(e.target.checked)}
            className="h-5 w-5 rounded border-white/20 bg-white/5 accent-violet-500"
          />
        </label>

        {status === "error" && <p className="text-sm text-red-400">{error}</p>}
        {status === "done" && <p className="text-sm text-emerald-400">Saved.</p>}

        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Card>
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
