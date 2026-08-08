import { NextResponse } from "next/server";
import { requireDev } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

// ~100 years — GoTrue's own documented pattern for an effectively
// permanent ban (there's no dedicated "disable login forever" flag).
const BAN_DURATION = "876000h";
const UNBAN_DURATION = "none";

const ACTIONS = ["ban", "unban", "delete", "restore"] as const;
type Action = (typeof ACTIONS)[number];

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
  const isLockingDown = action === "ban" || action === "delete";

  // Locking an account down (ban/delete) fails loudly if the GoTrue-level
  // lock can't be applied — we don't want to silently mark someone
  // banned in our own table while their session token still works.
  // Restoring access (unban/restore) is best-effort at the GoTrue layer:
  // our own is_banned/is_deleted flags are the source of truth the rest of
  // the app actually checks (middleware, public page), so those always get
  // cleared even if the auth-level call turns out to be a no-op.
  try {
    if (isLockingDown) {
      const { error } = await admin.auth.admin.updateUserById(targetId, { ban_duration: BAN_DURATION });
      if (error) throw error;
    } else {
      await admin.auth.admin.updateUserById(targetId, { ban_duration: UNBAN_DURATION }).catch(() => {});
    }

    const patch =
      action === "ban"
        ? { is_banned: true, banned_at: new Date().toISOString() }
        : action === "unban"
          ? { is_banned: false, banned_at: null }
          : action === "delete"
            ? { is_deleted: true, deleted_at: new Date().toISOString() }
            : { is_deleted: false, deleted_at: null, is_banned: false, banned_at: null };

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
