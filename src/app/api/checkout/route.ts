import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createCheckoutSession } from "@/lib/server/pricing";
import { PRICE_IDS } from "@/lib/server/stripe";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = (await req.json()) as { tier: "pro_monthly" | "pro_annual" };

    if (tier !== "pro_monthly" && tier !== "pro_annual") {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const priceId = PRICE_IDS[tier];

    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    const checkoutUrl = await createCheckoutSession(user.id, user.email || "", priceId);

    if (!checkoutUrl) {
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
