"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "normal" | "tester" | "dev";

type CreatedAccount = { email: string; username: string; password: string; role: Role };

// The only way anyone but the owner gets into the backend right now — the
// account is created and role-assigned in one step via
// /api/admin/create-user, so there's no separate invite/approval flow to
// manage. The password is shown once after creation so it can be handed
// off; it isn't stored anywhere client-side after the form resets.
export function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("tester");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedAccount | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: username.toLowerCase(), password, role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Could not create the account (${res.status}).`);

      setCreated({ email, username: username.toLowerCase(), password, role });
      setEmail("");
      setUsername("");
      setPassword("");
      setRole("tester");
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not create the account.");
    }
  }

  if (created) {
    return (
      <Card className="border-signal-500/25 bg-signal-500/[0.04]">
        <CardHeader>
          <CardTitle>Account created</CardTitle>
          <CardDescription>Hand these off however you'd like — they won't be shown again.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-muted-foreground">Email</span>
            <span>{created.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-muted-foreground">Username</span>
            <span>@{created.username}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-muted-foreground">Password</span>
            <span>{created.password}</span>
          </div>
          <div className="flex items-center justify-between pb-1">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize">{created.role}</span>
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setCreated(null)}>
            Create another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Bypasses self-serve signup entirely — the account is created and role-assigned immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-username">Username</Label>
            <Input
              id="new-username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="theirname"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-role">Initial role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="new-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (gated out)</SelectItem>
                <SelectItem value="tester">Tester</SelectItem>
                <SelectItem value="dev">Dev</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "error" && (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          )}

          <Button type="submit" disabled={status === "loading"} className="sm:col-span-2">
            {status === "loading" ? "Creating…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
