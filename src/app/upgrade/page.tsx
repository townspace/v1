"use client";

import { useState } from "react";

import { PRICING_TIERS } from "@/lib/server/pricing";

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (tier: "pro_monthly" | "pro_annual") => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
            Upgrade your analysis
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Choose your plan
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Unlock unlimited analyses and advanced features.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Free Tier */}
          <div className="glass-panel rounded-[1.75rem] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {PRICING_TIERS.free.name}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
              ${PRICING_TIERS.free.price}
              <span className="text-lg font-normal text-[var(--muted)]">/month</span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{PRICING_TIERS.free.description}</p>

            <ul className="mt-6 space-y-4">
              {PRICING_TIERS.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--teal)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-[var(--foreground)]">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="/"
              className="mt-8 inline-flex w-full items-center justify-center rounded-[1.1rem] border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[rgba(31,122,122,0.5)] hover:bg-[rgba(31,122,122,0.05)]"
            >
              Current plan
            </a>
          </div>

          {/* Pro Tier */}
          <div className="glass-panel relative rounded-[1.75rem] p-8 ring-2 ring-[var(--accent)]">
            <div className="absolute -top-4 right-8 rounded-full bg-[var(--accent)] px-4 py-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Recommended
              </p>
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
              {PRICING_TIERS.pro.name}
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
              ${PRICING_TIERS.pro.price}
              <span className="text-lg font-normal text-[var(--muted)]">/month</span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{PRICING_TIERS.pro.description}</p>

            <ul className="mt-6 space-y-4">
              {PRICING_TIERS.pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--teal)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-[var(--foreground)]">{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div className="mt-6 rounded-[1rem] border border-[rgba(155,51,34,0.26)] bg-[rgba(155,51,34,0.08)] px-4 py-3 text-sm text-[var(--accent-deep)]">
                {error}
              </div>
            )}

            <button
              onClick={() => handleCheckout("pro_monthly")}
              disabled={isLoading}
              className="mt-8 inline-flex w-full items-center justify-center rounded-[1.1rem] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Processing..." : "Upgrade to Pro"}
            </button>

            <p className="mt-4 text-center text-xs text-[var(--muted)]">
              Or{" "}
              <button
                onClick={() => handleCheckout("pro_annual")}
                disabled={isLoading}
                className="font-medium text-[var(--accent)] transition hover:text-[var(--accent-deep)]"
              >
                subscribe annually
              </button>
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-[1.75rem] border border-[var(--border)] bg-[rgba(31,122,122,0.04)] px-8 py-6">
          <p className="font-semibold text-[var(--foreground)]">What&apos;s included in Pro?</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>• Unlimited vocal analyses per month</li>
            <li>• All Free tier features included</li>
            <li>• Priority email support response (24 hours)</li>
            <li>• Advanced analytics and performance insights</li>
            <li>• Cancel anytime, no questions asked</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
