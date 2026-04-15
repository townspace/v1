export function AnalysisLoader() {
  const bars = Array.from({ length: 14 }, (_, index) => index);

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
        Analysing clip
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
        Claude is preparing your coaching report.
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        We are scoring pitch, timing, tone, breath, dynamics, and diction. This usually takes a few seconds.
      </p>

      <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] px-4 py-5">
        <div className="flex h-20 items-end justify-center gap-2">
          {bars.map((bar, index) => (
            <span
              key={bar}
              className="w-2 rounded-full bg-[var(--accent)] [animation:pulse_1.1s_ease-in-out_infinite]"
              style={{
                height: `${20 + (index % 7) * 8}px`,
                animationDelay: `${index * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}