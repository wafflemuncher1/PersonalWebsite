import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config";

// Anonymous visitors can like a profile without an account — the "visitor id"
// is a random uuid the browser generates and stores itself (see
// components/profile/LikeButton.tsx). Both routes are best-effort: a failure
// here should never break the page for a visitor just browsing.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || "";
    const visitorId = searchParams.get("visitorId") || "";

    if (!username) {
      return NextResponse.json({ liked: false, likeCount: 0 }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.rpc("get_profile_like_state", {
      p_username: username,
      p_visitor_id: visitorId,
    });

    if (error || !data) {
      return NextResponse.json({ liked: false, likeCount: 0 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ liked: false, likeCount: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username : "";
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";

    if (!username || !visitorId) {
      return NextResponse.json({ liked: false, likeCount: 0 }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.rpc("toggle_profile_like", {
      p_username: username,
      p_visitor_id: visitorId,
    });

    if (error || !data) {
      return NextResponse.json({ liked: false, likeCount: 0 }, { status: 200 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ liked: false, likeCount: 0 }, { status: 200 });
  }
}
