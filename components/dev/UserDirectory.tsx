"use client";

import { useEffect, useState } from "react";
import { Ban, ExternalLink, Search, Trash2, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dev/ConfirmDialog";

type AdminUserRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  plan: string;
  is_dev: boolean;
  view_count: number;
  created_at: string;
  is_banned: boolean;
  banned_at: string | null;
  email: string | null;
  last_sign_in_at: string | null;
};

type StatusFilter = "all" | "active" | "banned";
type Role = "normal" | "pro" | "dev";
type Action = "ban" | "unban" | "delete" | "set_role";
type Confirm = { user: AdminUserRow; action: Action; role?: Role };

const PER_PAGE = 25;
const ROLES: { key: Role; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "pro", label: "Pro" },
  { key: "dev", label: "Dev" },
];

function roleOf(u: AdminUserRow): Role {
  if (u.is_dev) return "dev";
  if (u.plan === "pro") return "pro";
  return "normal";
}

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
              return {
                ...u,
                plan: confirm.role === "normal" ? "free" : "pro",
                is_dev: confirm.role === "dev",
              };
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
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or display name…"
              className="pl-9"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-500/60"
          >
            <option value="all" className="bg-ink-950">All statuses</option>
            <option value="active" className="bg-ink-950">Active only</option>
            <option value="banned" className="bg-ink-950">Banned only</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span>Joined</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white outline-none focus:border-violet-500/60"
            />
            <span>–</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white outline-none focus:border-violet-500/60"
            />
          </div>

          {(search || status !== "all" || from || to) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setFrom("");
                setTo("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Reset
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {error && <p className="p-4 text-sm text-red-400">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-600">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-600">
                    No users match these filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const currentRole = roleOf(u);
                  return (
                    <tr key={u.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-violet-500 text-xs font-semibold text-white">
                            {u.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (u.display_name || u.username).charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{u.display_name || u.username}</p>
                            <p className="truncate text-xs text-zinc-500">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{u.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {ROLES.map((r) => (
                            <button
                              key={r.key}
                              type="button"
                              disabled={r.key === currentRole}
                              onClick={() => setConfirm({ user: u, action: "set_role", role: r.key })}
                              className={`rounded-md px-1.5 py-1 text-[10px] font-medium transition ${
                                r.key === currentRole
                                  ? r.key === "dev"
                                    ? "bg-amber-500/20 text-amber-300"
                                    : r.key === "pro"
                                      ? "bg-violet-500/20 text-violet-300"
                                      : "bg-white/10 text-zinc-300"
                                  : "text-zinc-600 hover:bg-white/5 hover:text-zinc-300"
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{u.view_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{formatDateTime(u.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {u.is_banned ? <Badge color="red">Banned</Badge> : <Badge color="emerald">Active</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/${u.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                            aria-label="Visit site"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          {u.is_banned ? (
                            <button
                              type="button"
                              onClick={() => setConfirm({ user: u, action: "unban" })}
                              className="rounded-md p-1.5 text-zinc-500 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                              aria-label="Unban user"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirm({ user: u, action: "ban" })}
                              className="rounded-md p-1.5 text-zinc-500 transition hover:bg-amber-500/10 hover:text-amber-300"
                              aria-label="Ban user"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setConfirm({ user: u, action: "delete" })}
                            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
                            aria-label="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
          <p className="text-xs text-zinc-500">
            {total.toLocaleString()} user{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
            >
              Next
            </button>
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
              <strong className="text-zinc-300">@{confirm.user.username}</strong> will be signed out and
              won&apos;t be able to log back in until unbanned. Their public page also goes offline.
            </>
          ) : confirm?.action === "unban" ? (
            <>
              <strong className="text-zinc-300">@{confirm?.user.username}</strong> will be able to log in and
              their public page comes back online.
            </>
          ) : confirm?.action === "delete" ? (
            <>
              This permanently erases <strong className="text-zinc-300">@{confirm.user.username}</strong>&apos;s
              account, profile, and everything attached to it — sign-in, public page, links, all of it. There is
              no undo and no recovery.
            </>
          ) : confirm?.role === "dev" ? (
            <>
              <strong className="text-zinc-300">@{confirm?.user.username}</strong> will get full developer
              access — every account&apos;s data, the ability to ban and delete users, and to grant this same
              access to others. Only do this for someone you fully trust.
            </>
          ) : (
            <>
              <strong className="text-zinc-300">@{confirm?.user.username}</strong> will be moved to the{" "}
              <strong className="text-zinc-300">{confirm?.role}</strong> role.
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
