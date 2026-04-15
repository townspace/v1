import Stripe from "stripe";

export function getStripeClient(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
  }

  return new Stripe(apiKey, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export const PRICE_IDS = {
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || "",
  pro_annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL || "",
} as const;

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
