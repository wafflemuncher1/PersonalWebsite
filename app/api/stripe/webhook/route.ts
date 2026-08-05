import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/lib/types";

export const runtime = "nodejs";

// Stripe calls this directly (no user session), so writes here go through
// the service-role admin client, bypassing RLS. This is the one place in the
// app that's allowed to change someone else's plan/subscription_status —
// keep it that way, and always verify the signature before trusting the body.
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

        if (userId) {
          await admin
            .from("profiles")
            .update({
              plan: "pro",
              subscription_status: "active",
              stripe_customer_id: customerId ?? null,
              stripe_subscription_id: subscriptionId ?? null,
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = mapStripeStatus(subscription.status);
        const plan = status === "active" || status === "trialing" ? "pro" : "free";

        await admin
          .from("profiles")
          .update({ plan, subscription_status: status })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Stripe retries on non-2xx, which is what we want if our own DB write failed.
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      // incomplete, incomplete_expired, unpaid, paused — none of these should
      // grant Pro access.
      return "inactive";
  }
}
