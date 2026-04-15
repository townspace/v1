import { AuthStatus } from "@/components/auth/auth-status";
import { AuthedHistorySection } from "@/components/history/authed-history-section";
import { UploadStudio } from "@/components/upload/upload-studio";

const valueProps = [
  {
    title: "Targeted diagnosis",
    description:
      "Collect the singer's clip, context, and practice priorities before sending anything to the analysis engine.",
  },
  {
    title: "Audio-first UX",
    description:
      "Validate duration, flag large files, and preview the waveform in-browser so users know exactly what they are submitting.",
  },
  {
    title: "Ready for Step 3",
    description:
      "The form state is shaped to feed directly into the upcoming multipart API route without redesigning the client flow.",
  },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="section-grid relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[rgba(255,248,238,0.68)] px-6 py-8 shadow-[0_24px_80px_rgba(74,42,33,0.12)] sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-[rgba(196,96,47,0.18)] via-transparent to-[rgba(31,122,122,0.18)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center rounded-full border border-[rgba(143,52,38,0.2)] bg-[rgba(255,250,242,0.9)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-deep)]">
                Step 1 complete · Step 2 implemented
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                  Vocal analysis starts with a disciplined intake flow, not a loose upload box.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  This MVP landing state is set up as the front door for your AI vocal coach: singers can drop a clip, review the waveform, declare intent, and prepare a clean analysis payload before the API layer is connected.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {valueProps.map((item) => (
                  <div
                    key={item.title}
                    className="glass-panel rounded-[1.5rem] p-4"
                  >
                    <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--foreground)]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
                    Intake requirements
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
                    Upload constraints for the MVP
                  </h2>
                </div>
                <div className="rounded-2xl bg-[rgba(31,122,122,0.12)] px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--teal)]">
                    Accepted
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    MP3 · WAV · M4A
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
                  <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    Max upload size
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-[-0.03em]">25MB</dd>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
                  <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    Max duration
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-[-0.03em]">3 minutes</dd>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
                  <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    Compression notice
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    Files over 10MB trigger a client-side warning before submission.
                  </dd>
                </div>
                <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.52)] p-4">
                  <dt className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                    Prepared for
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                    Multipart upload to the Step 3 analysis route with the user context attached.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <AuthStatus />
          <UploadStudio />
        </div>
      </div>

      <AuthedHistorySection />
    </main>
  );
}
