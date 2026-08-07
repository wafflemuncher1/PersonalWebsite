"use client";

import type { ReactNode } from "react";

export function TrackedLink({
  username,
  label,
  url,
  className,
  children,
}: {
  username: string;
  label: string;
  url: string;
  className?: string;
  children: ReactNode;
}) {
  function handleClick() {
    const payload = JSON.stringify({ username, label, url });
    try {
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/track-click", blob);
        return;
      }
    } catch {
      // fall through to fetch
    }
    fetch("/api/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // best-effort — a failed click log shouldn't block navigation
    });
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
