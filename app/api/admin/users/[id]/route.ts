import { NextResponse } from "next/server";
import { requireDev } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/types";

// ~100 years — GoTrue's own documented pattern for an effectively
// permanent ban (there's no dedicated "disable login forever" flag).
const BAN_DURATION = "876000h";
const UNBAN_DURATION = "none";

const ACTIONS = ["ban", "unban", "delete", "set_role"] as const;
type Action = (typeof ACTIONS)[number];

const ROLES = ["normal", "pro", "dev"] as const;
type Role = (typeof ROLES)[number];

// Each role is a superset of the one before it — normal is the free plan,
// pro unlocks paid features, dev additionally gets is_dev (full admin
// access via requireDev()). Setting a role always sets both fields so an
// account can't end up in a mixed state like plan=free/is_dev=true.
const ROLE_PATCH: Record<Role, { plan: Plan; is_dev: boolean }> = {
  normal: { plan: "free", is_dev: false },
  pro: { plan: "pro", is_dev: false },
  dev: { plan: "pro", is_dev: true },
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const check = await requireDev();
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const targetId = params.id;
  if (targetId === check.userId) {
    return NextResponse.json({ error: "You can't do that to your own account." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action as Action;
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    if (action === "delete") {
      // A true hard delete — profiles.id has ON DELETE CASCADE to
      // auth.users(id), so removing the auth user wipes the profile row
      // (and everything that references it) in the same step. There's
      // nothing left to "restore" afterward.
      const { error } = await admin.auth.admin.deleteUser(targetId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "set_role") {
      const role = body.role as Role;
      if (!ROLES.includes(role)) {
        return NextResponse.json({ error: "Unknown role." }, { status: 400 });
      }
      const { error } = await admin.from("profiles").update(ROLE_PATCH[role]).eq("id", targetId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    // ban / unban — reversible, so we lock/unlock at the GoTrue level too.
    // Banning fails loudly if the GoTrue-level lock can't be applied — we
    // don't want to silently mark someone banned in our own table while
    // their session token still works. Unbanning is best-effort at the
    // GoTrue layer: our own is_banned flag is the source of truth the rest
    // of the app actually checks (middleware, public page), so it always
    // gets cleared even if the auth-level call turns out to be a no-op.
    if (action === "ban") {
      const { error } = await admin.auth.admin.updateUserById(targetId, { ban_duration: BAN_DURATION });
      if (error) throw error;
    } else {
      await admin.auth.admin.updateUserById(targetId, { ban_duration: UNBAN_DURATION }).catch(() => {});
    }

    const patch =
      action === "ban" ? { is_banned: true, banned_at: new Date().toISOString() } : { is_banned: false, banned_at: null };

    const { error: updateError } = await admin.from("profiles").update(patch).eq("id", targetId);
    if (updateError) throw updateError;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
