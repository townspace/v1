import type { AnalysisFeedback } from "@/types/analysis";

type FeedbackFeedProps = {
  feedback: AnalysisFeedback[];
};

const TYPE_STYLES = {
  strength: "border-[rgba(31,122,122,0.26)] bg-[rgba(31,122,122,0.1)] text-[var(--teal)]",
  improve: "border-[rgba(196,96,47,0.24)] bg-[rgba(196,96,47,0.1)] text-[var(--accent-deep)]",
  error: "border-[rgba(155,51,34,0.28)] bg-[rgba(155,51,34,0.1)] text-[var(--accent-deep)]",
} as const;

export function FeedbackFeed({ feedback }: FeedbackFeedProps) {
  return (
    <div className="space-y-3">
      {feedback.map((entry, index) => (
        <article
          key={`${entry.type}-${entry.timestamp ?? "na"}-${index}`}
          className={`rounded-[1.25rem] border px-4 py-3 ${TYPE_STYLES[entry.type]}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(255,255,255,0.62)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
              {entry.type}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {entry.timestamp ?? "General"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{entry.text}</p>
        </article>
      ))}
    </div>
  );
}