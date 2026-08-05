import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Server-only client that authenticates with the service role key and
// bypasses row-level security. NEVER import this from a client component or
// ship the service role key to the browser — it is only ever read from
// process.env on the server (Vercel env vars / .env.local).
//
// Used by trusted server code that must write across users, e.g. the Stripe
// webhook handler updating someone else's `profiles` row after a checkout
// completes.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your server environment (never NEXT_PUBLIC_*)."
    );
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
