"use client";

import { useRef, useState } from "react";

import { AudioPreview } from "@/components/upload/audio-preview";
import { formatDuration, formatFileSize } from "@/lib/audio";
import { type SelectedAudio } from "@/types/upload";

type UploadZoneProps = {
  selectedAudio: SelectedAudio | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isInspecting: boolean;
  errorMessage: string | null;
  warningMessage: string | null;
};

const ACCEPT_ATTRIBUTE = ".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a";

export function UploadZone({
  selectedAudio,
  onFileSelect,
  onClear,
  isInspecting,
  errorMessage,
  warningMessage,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    onFileSelect(file);
  };

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
          Upload zone
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
          Drop the singer&apos;s clip and validate it before upload.
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          The client checks file type, size, and clip duration before the analysis request is even attempted.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFile(event.dataTransfer.files);
        }}
        className={`mt-6 rounded-[1.75rem] border border-dashed px-5 py-8 transition sm:px-8 sm:py-10 ${
          isDragging
            ? "border-[rgba(196,96,47,0.58)] bg-[rgba(196,96,47,0.08)]"
            : "border-[rgba(77,55,52,0.22)] bg-[rgba(255,255,255,0.48)] hover:border-[rgba(31,122,122,0.32)] hover:bg-[rgba(255,255,255,0.7)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          className="hidden"
          onChange={(event) => handleFile(event.target.files)}
        />

        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(196,96,47,0.12)] text-2xl text-[var(--accent-deep)]">
            ♪
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Drag in a vocal clip or browse from the device.
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Supports MP3, WAV, and M4A up to 25MB. Any take longer than {formatDuration(180)} is rejected before upload.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-deep)]"
            >
              Choose audio file
            </button>
            <span className="rounded-full border border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Web Audio duration check enabled
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoChip label="Formats" value="MP3, WAV, M4A" />
        <InfoChip label="Soft warning" value={"> 10MB"} />
        <InfoChip label="Hard stop" value={"> 3 minutes"} />
      </div>

      {isInspecting ? (
        <div className="mt-5 rounded-[1.25rem] border border-[rgba(31,122,122,0.18)] bg-[rgba(31,122,122,0.08)] px-4 py-3 text-sm text-[var(--teal)]">
          Inspecting the clip with the browser audio engine...
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-5 rounded-[1.25rem] border border-[rgba(143,52,38,0.22)] bg-[rgba(196,96,47,0.08)] px-4 py-3 text-sm text-[var(--accent-deep)]">
          {errorMessage}
        </div>
      ) : null}

      {warningMessage ? (
        <div className="mt-5 rounded-[1.25rem] border border-[rgba(232,184,75,0.26)] bg-[rgba(232,184,75,0.18)] px-4 py-3 text-sm text-[var(--foreground)]">
          {warningMessage}
        </div>
      ) : null}

      {selectedAudio ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.54)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Selected clip
              </p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                {selectedAudio.file.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {formatFileSize(selectedAudio.sizeBytes)} · {formatDuration(selectedAudio.durationSeconds)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[rgba(143,52,38,0.28)] hover:bg-[rgba(255,255,255,0.85)]"
            >
              Remove clip
            </button>
          </div>

          <AudioPreview
            fileName={selectedAudio.file.name}
            objectUrl={selectedAudio.objectUrl}
            durationSeconds={selectedAudio.durationSeconds}
            sizeBytes={selectedAudio.sizeBytes}
            compressionWarning={selectedAudio.compressionWarning}
          />
        </div>
      ) : null}
    </section>
  );
}

type InfoChipProps = {
  label: string;
  value: string;
};

function InfoChip({ label, value }: InfoChipProps) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.54)] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">{value}</p>
    </div>
  );
}