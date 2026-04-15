import {
  EXPERIENCE_LEVELS,
  FOCUS_AREAS,
  type UploadContextValues,
} from "@/types/upload";

type ContextFormProps = {
  value: UploadContextValues;
  onChange: (nextValue: UploadContextValues) => void;
};

export function ContextForm({ value, onChange }: ContextFormProps) {
  const updateField = <Key extends keyof UploadContextValues>(
    key: Key,
    nextFieldValue: UploadContextValues[Key],
  ) => {
    onChange({
      ...value,
      [key]: nextFieldValue,
    });
  };

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
          Context form
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
          Tell the coach what matters in this take.
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          This context will be sent alongside the audio clip so the analysis can adapt its language and priorities.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Song title" htmlFor="songTitle" helper="Optional reference for the passage being sung.">
          <input
            id="songTitle"
            name="songTitle"
            type="text"
            value={value.songTitle}
            onChange={(event) => updateField("songTitle", event.target.value)}
            placeholder="e.g. Someone Like You"
            className="w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
          />
        </Field>

        <Field label="Artist" htmlFor="artist" helper="Optional performer or reference version.">
          <input
            id="artist"
            name="artist"
            type="text"
            value={value.artist}
            onChange={(event) => updateField("artist", event.target.value)}
            placeholder="e.g. Adele"
            className="w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
          />
        </Field>

        <Field label="Experience level" htmlFor="level" helper="This changes the coaching language and technical depth.">
          <select
            id="level"
            name="level"
            value={value.level}
            onChange={(event) => updateField("level", event.target.value as UploadContextValues["level"])}
            className="w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Focus area" htmlFor="focus" helper="Primary issue the singer wants reviewed.">
          <select
            id="focus"
            name="focus"
            value={value.focus}
            onChange={(event) => updateField("focus", event.target.value as UploadContextValues["focus"])}
            className="w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
          >
            {FOCUS_AREAS.map((focus) => (
              <option key={focus} value={focus}>
                {focus}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Personal notes"
          htmlFor="notes"
          helper="Optional concerns, warm-up context, or goals for this recording."
          className="sm:col-span-2"
        >
          <textarea
            id="notes"
            name="notes"
            value={value.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="e.g. My head voice tends to go flat above E4 and I feel tension on sustained phrases."
            rows={5}
            className="w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-[rgba(196,96,47,0.5)] focus:ring-4 focus:ring-[rgba(196,96,47,0.12)]"
          />
        </Field>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  helper: string;
  className?: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, helper, className, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className={className}>
      <span className="block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{helper}</span>
      <div className="mt-3">{children}</div>
    </label>
  );
}