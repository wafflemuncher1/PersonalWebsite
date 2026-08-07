import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username : "";
    const label = typeof body?.label === "string" ? body.label : "";
    const url = typeof body?.url === "string" ? body.url : "";

    if (!username || !url) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await supabase.rpc("log_link_click", {
      p_username: username,
      p_label: label,
      p_url: url,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Click tracking is best-effort — never surface an error to the visitor.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
