type IdealComparisonProps = {
  idealDescription: string;
  nextSessionFocus: string;
};

export function IdealComparison({ idealDescription, nextSessionFocus }: IdealComparisonProps) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Ideal reference</p>
      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{idealDescription}</p>
      <div className="mt-4 rounded-[1rem] border border-[rgba(31,122,122,0.22)] bg-[rgba(31,122,122,0.1)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">Next session focus</p>
        <p className="mt-2 text-sm text-[var(--foreground)]">{nextSessionFocus}</p>
      </div>
    </section>
  );
}