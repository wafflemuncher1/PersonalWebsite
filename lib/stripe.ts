import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

// Server-only. Throws instead of silently returning an unauthenticated client
// so a missing key fails loudly during a checkout attempt rather than
// pretending to work.
export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to your server environment.");
  }

  stripeSingleton = new Stripe(key, {
    apiVersion: "2024-06-20",
  });
  return stripeSingleton;
}
