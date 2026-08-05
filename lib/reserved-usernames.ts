// Single source of truth for usernames that can't be claimed because they'd
// shadow a real route. Next.js resolves static routes (app/pricing,
// app/signup, ...) before the [username] catch-all, so this isn't a security
// issue — it just stops someone's public page from becoming unreachable.
// Add to this list whenever a new top-level route is added under app/.
export const RESERVED_USERNAMES = new Set([
  "login",
  "signup",
  "pricing",
  "dashboard",
  "api",
  "settings",
  "admin",
  "auth",
  "about",
  "help",
  "support",
  "nocturne",
  "favicon.ico",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase());
}
