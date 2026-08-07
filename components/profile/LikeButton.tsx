"use client";

import { useEffect, useState } from "react";

const VISITOR_ID_KEY = "nocturne_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // Private browsing / storage blocked — fall back to a per-load id so the
    // button still works, it just won't remember the like on refresh.
    return crypto.randomUUID();
  }
}

export function LikeButton({ username }: { username: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const visitorId = getVisitorId();
    fetch(`/api/profile-like?username=${encodeURIComponent(username)}&visitorId=${encodeURIComponent(visitorId)}`)
      .then((res) => res.json())
      .then((data) => {
        setLiked(!!data.liked);
        setCount(typeof data.likeCount === "number" ? data.likeCount : 0);
      })
      .catch(() => setCount(0));
  }, [username]);

  async function toggle() {
    if (busy) return;
    const visitorId = getVisitorId();
    const nextLiked = !liked;
    setBusy(true);
    setLiked(nextLiked);
    setCount((c) => (c ?? 0) + (nextLiked ? 1 : -1));

    try {
      const res = await fetch("/api/profile-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, visitorId }),
      });
      const data = await res.json();
      if (typeof data.liked === "boolean") setLiked(data.liked);
      if (typeof data.likeCount === "number") setCount(data.likeCount);
    } catch {
      // Roll back the optimistic update if the request failed.
      setLiked(!nextLiked);
      setCount((c) => (c ?? 0) + (nextLiked ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || count === null}
      title="Like this profile"
      className="flex items-center gap-1 transition hover:text-rose-400 disabled:cursor-default disabled:opacity-60"
    >
      <span className={liked ? "text-rose-400" : ""}>{liked ? "❤" : "🤍"}</span>
      <span>{count ?? "–"}</span>
    </button>
  );
}
