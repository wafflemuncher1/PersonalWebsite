// Shared by TrackedLink (direct navigation) and ExternalLinkGate (the
// warning-modal-gated navigation used for unverified custom links) so both
// paths log clicks identically.
export function trackLinkClick(username: string, label: string, url: string) {
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
