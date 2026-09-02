import { NextResponse } from "next/server";
import { requireDev } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const PER_PAGE = 25;

// Search/filter/paginate the user directory for the dev admin panel.
// Reads from `profiles` via the service-role client (bypasses RLS — this is
// the one place in the app that's allowed to see everyone's row), then
// enriches just the current page with email/last-sign-in from the Auth
// Admin API since that data lives outside the public schema.
export async function GET(request: Request) {
  const check = await requireDev();
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status") ?? "all";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const admin = createAdminClient();
  let query = admin.from("profiles").select("*", { count: "exact" });

  if (search) {
    const escaped = search.replace(/[%_,]/g, "");
    if (escaped) {
      query = query.or(`username.ilike.%${escaped}%,display_name.ilike.%${escaped}%`);
    }
  }

  if (status === "banned") query = query.eq("is_banned", true);
  else if (status === "active") query = query.eq("is_banned", false);

  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  query = query.order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const enriched = await Promise.all(
    rows.map(async (row) => {
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(row.id);
        return {
          ...row,
          email: authUser?.user?.email ?? null,
          last_sign_in_at: authUser?.user?.last_sign_in_at ?? null,
        };
      } catch {
        return { ...row, email: null, last_sign_in_at: null };
      }
    })
  );

  return NextResponse.json({ users: enriched, total: count ?? 0, page, perPage: PER_PAGE });
}
