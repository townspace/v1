import type { TechnicalNotes } from "@/types/analysis";

type TechnicalPanelProps = {
  notes: TechnicalNotes;
};

export function TechnicalPanel({ notes }: TechnicalPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Technical notes</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoItem label="Detected key" value={notes.detectedKey ?? "Not detected"} />
        <InfoItem label="Voice type" value={notes.voiceType ?? "Not detected"} />
        <InfoItem label="Tempo" value={notes.tempoObservation} />
        <InfoItem label="Range" value={notes.rangeObserved} />
      </dl>
    </section>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.7)] px-3 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-[var(--foreground)]">{value}</dd>
    </div>
  );
}