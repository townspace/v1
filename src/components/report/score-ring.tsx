type ScoreRingProps = {
  score: number;
  grade: string;
};

export function ScoreRing({ score, grade }: ScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clampedScore / 100);

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0">
        <circle cx="70" cy="70" r={radius} stroke="rgba(77,55,52,0.15)" strokeWidth="12" fill="none" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="var(--accent)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 70 70)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text x="70" y="66" textAnchor="middle" className="fill-[var(--foreground)] text-2xl font-semibold">
          {clampedScore}
        </text>
        <text x="70" y="88" textAnchor="middle" className="fill-[var(--muted)] text-[12px] uppercase tracking-[0.2em]">
          score
        </text>
      </svg>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Overall grade</p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">{grade}</p>
      </div>
    </div>
  );
}