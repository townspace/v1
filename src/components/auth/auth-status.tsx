"use client";

import { useEffect, useState } from "react";

import { createSupabaseClient } from "@/lib/client/supabase-client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  plan: "free" | "pro";
}

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        setProfile(data as Profile | null);
      }

      setIsLoading(false);
    }

    void getUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
      {user ? (
        <>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{user.email}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
              {profile?.plan === "pro" ? "Pro plan" : "Free plan"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {profile?.plan === "free" && (
              <a
                href="/upgrade"
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--accent)] transition hover:border-[rgba(196,96,47,0.5)] hover:bg-[rgba(196,96,47,0.08)]"
              >
                Upgrade
              </a>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(143,52,38,0.28)] hover:bg-[rgba(255,255,255,0.85)]"
            >
              Sign out
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">Sign in to save your analysis history and track progress.</p>
          <a
            href="/auth"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-deep)]"
          >
            Sign in
          </a>
        </>
      )}
    </div>
  );
}
