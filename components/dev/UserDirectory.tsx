"use client";

import { useEffect, useState } from "react";
import { Ban, ExternalLink, RotateCcw, Search, Trash2, UserCheck } from "lucide-react";
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
  view_count: number;
  created_at: string;
  is_banned: boolean;
  banned_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  email: string | null;
  last_sign_in_at: string | null;
};

type StatusFilter = "all" | "active" | "banned" | "deleted";
type Action = "ban" | "unban" | "delete" | "restore";

const PER_PAGE = 25;

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

  const [confirm, setConfirm] = useState<{ user: AdminUserRow; action: Action } | null>(null);
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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load users.");
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
        body: JSON.stringify({ action: confirm.action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== confirm.user.id) return u;
          if (confirm.action === "ban") return { ...u, is_banned: true, banned_at: new Date().toISOString() };
          if (confirm.action === "unban") return { ...u, is_banned: false, banned_at: null };
          if (confirm.action === "delete") return { ...u, is_deleted: true, deleted_at: new Date().toISOString() };
          return { ...u, is_deleted: false, deleted_at: null, is_banned: false, banned_at: null };
        })
      );
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
            <option value="deleted" className="bg-ink-950">Deleted only</option>
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
                <th className="px-4 py-3 font-medium">Plan</th>
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
                users.map((u) => (
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
                    <td className="px-4 py-3 text-xs text-zinc-400">{u.plan}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{u.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{formatDateTime(u.created_at)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {u.is_deleted ? (
                        <Badge color="zinc">Deleted</Badge>
                      ) : u.is_banned ? (
                        <Badge color="red">Banned</Badge>
                      ) : (
                        <Badge color="emerald">Active</Badge>
                      )}
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

                        {u.is_deleted ? (
                          <button
                            type="button"
                            onClick={() => setConfirm({ user: u, action: "restore" })}
                            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                            aria-label="Restore user"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
                ? "Delete this user?"
                : "Restore this user?"
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
              <strong className="text-zinc-300">@{confirm.user.username}</strong> will be completely disabled —
              signed out, blocked from logging back in, and their public page taken down. Their data isn&apos;t
              erased and this can be undone from the Deleted filter.
            </>
          ) : (
            <>
              <strong className="text-zinc-300">@{confirm?.user.username}</strong> will be fully restored — able
              to log in again with their public page back online.
            </>
          )
        }
        confirmLabel={
          confirm?.action === "ban"
            ? "Ban user"
            : confirm?.action === "unban"
              ? "Unban user"
              : confirm?.action === "delete"
                ? "Delete user"
                : "Restore user"
        }
        danger={confirm?.action === "ban" || confirm?.action === "delete"}
        loading={actionLoading}
        error={actionError}
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
