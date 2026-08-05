import type { Plan } from "./types";

// Single source of truth for pricing tiers. The pricing page, the settings
// billing panel, and the Stripe checkout route all read from this so the
// price you see in the UI is always the price you're actually charged.
export type PlanConfig = {
  id: Plan;
  name: string;
  price: string;
  priceSuffix: string;
  description: string;
  features: string[];
  // Stripe Price ID (price_...), set once the product exists in Stripe.
  // Left blank for "free" since there's nothing to check out.
  stripePriceId?: string;
  cta: string;
};

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceSuffix: "/month",
    description: "A public page and a private dashboard to start tracking.",
    features: [
      "Public bio-link page (nocturne.co/you)",
      "Up to 5 links",
      "Notes, goals, and streak tracking",
      "Private dashboard — only you can see it",
    ],
    cta: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$8",
    priceSuffix: "/month",
    description: "Unlimited everything, plus a public stats showcase.",
    features: [
      "Everything in Free",
      "Unlimited links",
      "Public flex stats (opt-in, you choose what shows)",
      "Custom themes",
      "Priority support",
    ],
    // Set this to the real Stripe Price ID once the Pro product is created
    // in the Stripe dashboard, and mirror it in STRIPE_PRICE_ID_PRO.
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    cta: "Upgrade to Pro",
  },
];

export function getPlan(id: Plan): PlanConfig {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
