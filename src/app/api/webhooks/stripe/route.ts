import { NextRequest, NextResponse } from "next/server";

import { getStripeClient } from "@/lib/server/stripe";
import { getSupabaseAdminClient } from "@/lib/server/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature") || "";
    const body = await req.text();
    const stripe = getStripeClient();

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as unknown as Record<string, unknown>;
      const userId = (session as { metadata?: { userId?: string } }).metadata?.userId;

      if (!userId) {
        return NextResponse.json({ error: "No user ID in metadata" }, { status: 400 });
      }

      // Update user's plan to pro
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        await supabase
          .from("profiles")
          .update({ plan: "pro" })
          .eq("id", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as unknown as Record<string, unknown>;
      const customerId = (subscription as { customer?: string }).customer;

      if (!customerId) {
        return NextResponse.json({ error: "No customer ID" }, { status: 400 });
      }

      // Find user by customer_id and downgrade to free
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        await supabase
          .from("profiles")
          .update({ plan: "free" })
          .eq("stripe_customer_id", customerId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
