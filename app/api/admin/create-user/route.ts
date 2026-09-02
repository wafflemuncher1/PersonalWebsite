import { NextResponse } from "next/server";
import { requireDev } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { isReservedUsername } from "@/lib/reserved-usernames";
import { containsProfanity } from "@/lib/profanity";

const USERNAME_RE = /^[a-z0-9_-]{3,20}$/;
const ROLES = ["normal", "tester", "dev"] as const;
type Role = (typeof ROLES)[number];

// Dev-only account creation for people who can't (or shouldn't) go through
// self-serve signup yet — the backend is gated behind an explicit role, so
// this is currently the only way anyone but the owner gets in. Reuses the
// same username validation as the public signup form; the actual profile
// row comes from the same handle_new_user() trigger signup relies on, since
// admin.auth.admin.createUser() fires the same auth.users INSERT trigger —
// this route just has to set the requested role afterward.
export async function POST(request: Request) {
  const check = await requireDev();
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const role = (body.role as Role) ?? "tester";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters: lowercase letters, numbers, - or _." },
      { status: 400 }
    );
  }
  if (isReservedUsername(username)) {
    return NextResponse.json({ error: "That username is reserved." }, { status: 400 });
  }
  if (containsProfanity(username)) {
    return NextResponse.json({ error: "That username isn't allowed." }, { status: 400 });
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin.from("profiles").select("id").eq("username", username).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "That username is taken." }, { status: 400 });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Could not create the account." }, { status: 500 });
  }

  // The handle_new_user() trigger just created the profiles row (default
  // role 'normal') off the auth.users insert above — apply the requested
  // role now that the row exists.
  const { error: roleError } = await admin.from("profiles").update({ role }).eq("id", data.user.id);
  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: data.user.id, email, username, role });
}
