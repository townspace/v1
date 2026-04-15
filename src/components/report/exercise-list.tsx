import type { AnalysisExercise } from "@/types/analysis";

type ExerciseListProps = {
  exercises: AnalysisExercise[];
};

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <section className="space-y-3">
      {exercises.map((exercise, index) => (
        <details
          key={`${exercise.name}-${index}`}
          className="group rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.66)] px-4 py-3"
        >
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{exercise.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{exercise.purpose}</p>
              </div>
              <span className="rounded-full bg-[rgba(196,96,47,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-deep)] group-open:hidden">
                Expand
              </span>
              <span className="hidden rounded-full bg-[rgba(31,122,122,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--teal)] group-open:inline-flex">
                Collapse
              </span>
            </div>
          </summary>
          <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-6 text-[var(--foreground)]">
            {exercise.instruction}
          </p>
        </details>
      ))}
    </section>
  );
}