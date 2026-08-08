import { createClient } from "@/lib/supabase/server";

// Shared gate for every /api/admin/* route — confirms there's a signed-in
// session AND that the session's profile has is_dev = true. Route handlers
// still use the service-role client for the actual privileged work, but
// nothing privileged happens until this passes.
export async function requireDev() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Not signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_dev")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_dev) {
    return { ok: false as const, status: 403, error: "Not authorized." };
  }

  return { ok: true as const, userId: user.id };
}
