const WINDOW_MS = 60 * 60 * 1000;

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type GlobalWithRateLimitStore = typeof globalThis & {
  __vocalRateLimitStore?: Map<string, RateLimitRecord>;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

function getStore(): Map<string, RateLimitRecord> {
  const globalScope = globalThis as GlobalWithRateLimitStore;

  if (!globalScope.__vocalRateLimitStore) {
    globalScope.__vocalRateLimitStore = new Map<string, RateLimitRecord>();
  }

  return globalScope.__vocalRateLimitStore;
}

export function applyInstanceRateLimit(key: string, limit: number): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const record = store.get(key);

  if (!record || now >= record.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  store.set(key, record);

  return {
    allowed: true,
    remaining: Math.max(limit - record.count, 0),
    resetAt: record.resetAt,
  };
}

export function getRateLimitWindowMs(): number {
  return WINDOW_MS;
}

export async function getUserAnalysisLimit(userId: string | undefined): Promise<number> {
  // Free tier gets 3 analyses per hour
  // Pro tier gets unlimited
  // If no user ID, treat as free tier
  if (!userId) {
    return 3;
  }

  try {
    const { createServerClient } = await import("@supabase/ssr");
    const { cookies } = await import("next/headers");

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
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

    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    if (data?.plan === "pro") {
      return 999; // Effectively unlimited
    }

    return 3; // Free tier default
  } catch {
    // If query fails, default to free tier limits
    return 3;
  }
}