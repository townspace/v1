import Stripe from "stripe";

import { getStripeClient } from "@/lib/server/stripe";

export type PricingTier = "free" | "pro";

export const PRICING_TIERS = {
  free: {
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    analyses_per_month: 3,
    features: [
      "3 analyses per month",
      "Waveform visualization",
      "Detailed feedback & exercises",
      "Performance trends",
    ],
  },
  pro: {
    name: "Pro",
    description: "Unlimited analyses and priority support",
    price: 9.99,
    analyses_per_month: null, // unlimited
    features: [
      "Unlimited analyses",
      "Waveform visualization",
      "Detailed feedback & exercises",
      "Performance trends",
      "Priority email support",
      "Advanced analytics",
    ],
  },
} as const;

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
): Promise<string | null> {
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/cancelled`,
      metadata: {
        userId,
      },
    });

    return session.url;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return null;
  }
}

export async function getCustomerSubscription(
  customerId: string,
): Promise<Stripe.Subscription | null> {
  try {
    const stripe = getStripeClient();
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    return subscriptions.data[0] ?? null;
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return null;
  }
}
