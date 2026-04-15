import { ExerciseList } from "@/components/report/exercise-list";
import { FeedbackFeed } from "@/components/report/feedback-feed";
import { IdealComparison } from "@/components/report/ideal-comparison";
import { MetricsGrid } from "@/components/report/metrics-grid";
import { ReportWaveform } from "@/components/report/report-waveform";
import { ScoreRing } from "@/components/report/score-ring";
import { TechnicalPanel } from "@/components/report/technical-panel";
import type { VocalAnalysis } from "@/types/analysis";

type ReportCardProps = {
  analysis: VocalAnalysis;
  sourceLabel: string;
  audioUrl?: string | null;
  durationSeconds?: number | null;
};

export function ReportCard({ analysis, sourceLabel, audioUrl, durationSeconds }: ReportCardProps) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[var(--border)] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Coaching report</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Performance analysis</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{analysis.summary}</p>
          <p className="mt-3 inline-flex rounded-full bg-[rgba(31,122,122,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
            Source: {sourceLabel}
          </p>
        </div>
        <ScoreRing score={analysis.overallScore} grade={analysis.grade} />
      </div>

      <div className="mt-6 grid gap-6">
        {audioUrl ? (
          <ReportWaveform audioUrl={audioUrl} feedback={analysis.feedback} durationSeconds={durationSeconds ?? 180} />
        ) : null}

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Metrics</p>
          <div className="mt-3">
            <MetricsGrid metrics={analysis.metrics} />
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Timestamp feedback</p>
          <div className="mt-3">
            <FeedbackFeed feedback={analysis.feedback} />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <IdealComparison
            idealDescription={analysis.idealDescription}
            nextSessionFocus={analysis.nextSessionFocus}
          />
          <TechnicalPanel notes={analysis.technicalNotes} />
        </div>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Corrective exercises</p>
          <div className="mt-3">
            <ExerciseList exercises={analysis.exercises} />
          </div>
        </section>
      </div>
    </section>
  );
}