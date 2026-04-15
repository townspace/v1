import Link from "next/link";

export default function UpgradeCancelledPage() {
  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Checkout cancelled</h1>
        <p className="mt-2 text-[var(--muted)]">
          No worries! You can try again anytime or continue with your free plan.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/upgrade"
            className="inline-flex items-center justify-center rounded-[1.1rem] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[1.1rem] border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[rgba(255,255,255,0.85)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
