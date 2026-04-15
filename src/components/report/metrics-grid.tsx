import type { AnalysisMetric } from "@/types/analysis";

type MetricsGridProps = {
  metrics: AnalysisMetric[];
};

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.name}
          className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.64)] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold tracking-[-0.01em] text-[var(--foreground)]">{metric.name}</p>
            <span className="rounded-full bg-[rgba(31,122,122,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--teal)]">
              {metric.score}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[rgba(77,55,52,0.12)]">
            <div
              className="h-2 rounded-full bg-[var(--accent)]"
              style={{ width: `${Math.max(0, Math.min(100, metric.score))}%` }}
            />
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Weight {(metric.weight * 100).toFixed(0)}%
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{metric.note}</p>
        </article>
      ))}
    </div>
  );
}