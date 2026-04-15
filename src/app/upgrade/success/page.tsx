import Link from "next/link";

export default function UpgradeSuccessPage() {
  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(31,122,122,0.12)] mx-auto">
          <svg className="h-8 w-8 text-[var(--teal)]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">Welcome to Pro!</h1>
        <p className="mt-2 text-[var(--muted)]">
          Your subscription is now active. You can upload unlimited vocal samples.
        </p>

        <div className="mt-8 rounded-[1.75rem] border border-[var(--border)] bg-[rgba(31,122,122,0.04)] px-6 py-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">What&apos;s next?</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>✓ Upload unlimited vocal samples</li>
            <li>✓ Get detailed AI-powered feedback</li>
            <li>✓ Track your progress over time</li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-[1.1rem] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
        >
          Start analysing
        </Link>
      </div>
    </main>
  );
}
