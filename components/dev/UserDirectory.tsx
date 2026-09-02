"use client";

import { useEffect, useState } from "react";
import { Ban, ExternalLink, Search, Trash2, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dev/ConfirmDialog";

type Role = "normal" | "tester" | "dev";

type AdminUserRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: Role;
  view_count: number;
  created_at: string;
  is_banned: boolean;
  banned_at: string | null;
  email: string | null;
  last_sign_in_at: string | null;
};

type StatusFilter = "all" | "active" | "banned";
type Action = "ban" | "unban" | "delete" | "set_role";
type Confirm = { user: AdminUserRow; action: Action; role?: Role };

const PER_PAGE = 25;
const ROLES: { key: Role; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "tester", label: "Tester" },
  { key: "dev", label: "Dev" },
];

// Reads the body as text first and only attempts JSON.parse if there's
// something there — calling res.json() directly throws an opaque
// "Unexpected end of JSON input" on an empty body (e.g. a function that
// crashed before writing a response), which we'd otherwise surface
// verbatim as the error message.
async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function UserDirectory() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, from, to]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (status !== "all") params.set("status", status);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("page", String(page));

      try {
        const res = await fetch(`/api/admin/users?${params.toString()}`);
        const data = await parseJsonSafe(res);
        if (!res.ok) throw new Error(data?.error || `Could not load users (${res.status}).`);
        if (!data) throw new Error("Server returned an empty response. Try again.");
        if (!cancelled) {
          setUsers(data.users);
          setTotal(data.total);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, from, to, page]);

  async function runAction() {
    if (!confirm) return;
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${confirm.user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          confirm.action === "set_role" ? { action: confirm.action, role: confirm.role } : { action: confirm.action }
        ),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.error || `Action failed (${res.status}).`);

      if (confirm.action === "delete") {
        setUsers((prev) => prev.filter((u) => u.id !== confirm.user.id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== confirm.user.id) return u;
            if (confirm.action === "ban") return { ...u, is_banned: true, banned_at: new Date().toISOString() };
            if (confirm.action === "unban") return { ...u, is_banned: false, banned_at: null };
            if (confirm.action === "set_role" && confirm.role) {
              return { ...u, role: confirm.role };
            }
            return u;
          })
        );
      }
      setConfirm(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActionLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or display name…"
              className="pl-9"
            />
          </div>

          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="banned">Banned only</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Joined</span>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-auto text-xs"
            />
            <span>–</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-auto text-xs"
            />
          </div>

          {(search || status !== "all" || from || to) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setFrom("");
                setTo("");
              }}
            >
              Reset
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        {error && <p className="p-4 text-sm text-destructive">{error}</p>}

        <Table>
          <TableHeader>
            <TableRow className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No users match these filters.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="whitespace-normal">
                    <div className="flex items-center gap-2.5">
                      <Avatar>
                        <AvatarImage src={u.avatar_url ?? undefined} alt="" />
                        <AvatarFallback>
                          {(u.display_name || u.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.display_name || u.username}</p>
                        <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{u.email ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {ROLES.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          disabled={r.key === u.role}
                          onClick={() => setConfirm({ user: u, action: "set_role", role: r.key })}
                          className={cn(
                            "rounded-md px-1.5 py-1 text-[10px] font-medium transition",
                            r.key === u.role
                              ? r.key === "dev"
                                ? "bg-primary/20 text-primary"
                                : r.key === "tester"
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.view_count.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(u.created_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : "—"}
                  </TableCell>
                  <TableCell>
                    {u.is_banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="outline">Active</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={
                          <a href={`/${u.username}`} target="_blank" rel="noreferrer" aria-label="Visit site" />
                        }
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>

                      {u.is_banned ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setConfirm({ user: u, action: "unban" })}
                          aria-label="Unban user"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setConfirm({ user: u, action: "ban" })}
                          aria-label="Ban user"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirm({ user: u, action: "delete" })}
                        aria-label="Delete user"
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {total.toLocaleString()} user{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.action === "ban"
            ? "Ban this user?"
            : confirm?.action === "unban"
              ? "Unban this user?"
              : confirm?.action === "delete"
                ? "Permanently delete this user?"
                : confirm?.role === "dev"
                  ? "Grant developer access?"
                  : `Change role to ${confirm?.role ?? ""}?`
        }
        description={
          confirm?.action === "ban" ? (
            <>
              <strong className="text-foreground">@{confirm.user.username}</strong> will be signed out and
              won&apos;t be able to log back in until unbanned. Their public page also goes offline.
            </>
          ) : confirm?.action === "unban" ? (
            <>
              <strong className="text-foreground">@{confirm?.user.username}</strong> will be able to log in and
              their public page comes back online.
            </>
          ) : confirm?.action === "delete" ? (
            <>
              This permanently erases <strong className="text-foreground">@{confirm.user.username}</strong>&apos;s
              account, profile, and everything attached to it — sign-in, public page, links, all of it. There is
              no undo and no recovery.
            </>
          ) : confirm?.role === "dev" ? (
            <>
              <strong className="text-foreground">@{confirm?.user.username}</strong> will get full developer
              access — every account&apos;s data, the ability to ban and delete users, and to grant this same
              access to others. Only do this for someone you fully trust.
            </>
          ) : (
            <>
              <strong className="text-foreground">@{confirm?.user.username}</strong> will be moved to the{" "}
              <strong className="text-foreground">{confirm?.role}</strong> role.
            </>
          )
        }
        confirmLabel={
          confirm?.action === "ban"
            ? "Ban user"
            : confirm?.action === "unban"
              ? "Unban user"
              : confirm?.action === "delete"
                ? "Delete permanently"
                : confirm?.role === "dev"
                  ? "Grant dev access"
                  : "Change role"
        }
        danger={confirm?.action === "ban" || confirm?.action === "delete" || confirm?.role === "dev"}
        loading={actionLoading}
        error={actionError}
        requireTyped={confirm?.action === "delete" ? confirm.user.username : undefined}
        onCancel={() => {
          setConfirm(null);
          setActionError("");
        }}
        onConfirm={runAction}
        icon={confirm?.action === "delete" ? <Trash2 className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
      />
    </div>
  );
}
