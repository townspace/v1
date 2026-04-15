"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseClient } from "@/lib/client/supabase-client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
      }
    }

    void checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseClient();

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setEmail("");
        setPassword("");
        setError("Check your email to confirm your account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-md">
        <div className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
            {isSignUp ? "Create account" : "Sign in"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            {isSignUp ? "Start tracking your vocal progress." : "Welcome back."}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2 w-full rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
              />
            </div>

            {error ? (
              <div className="rounded-[1rem] border border-[rgba(155,51,34,0.26)] bg-[rgba(155,51,34,0.08)] px-4 py-3 text-sm text-[var(--accent-deep)]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-[1.1rem] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Processing..." : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--border)] pt-6">
            <p className="text-center text-sm text-[var(--muted)]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-[var(--accent)] transition hover:text-[var(--accent-deep)]"
              >
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>

          <a
            href="/"
            className="mt-4 block text-center text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
