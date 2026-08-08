import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing spot for OAuth (Google) redirects — Supabase sends the browser
// here with a `code` param after the user approves on Google's side, and
// this exchanges it for a real session cookie before continuing on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
