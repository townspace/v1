"use client";

import { useEffect, useRef, useState } from "react";
import type WaveSurfer from "wavesurfer.js";

import { formatDuration, formatFileSize } from "@/lib/audio";

type AudioPreviewProps = {
  fileName: string;
  objectUrl: string;
  durationSeconds: number;
  sizeBytes: number;
  compressionWarning: boolean;
};

export function AudioPreview({
  fileName,
  objectUrl,
  durationSeconds,
  sizeBytes,
  compressionWarning,
}: AudioPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function setupWaveform() {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const { default: WaveSurfer } = await import("wavesurfer.js");

      if (cancelled) {
        return;
      }

      const waveSurfer = WaveSurfer.create({
        container,
        url: objectUrl,
        waveColor: "rgba(31, 122, 122, 0.28)",
        progressColor: "#c4602f",
        cursorColor: "#8f3426",
        height: 88,
        barWidth: 3,
        barGap: 2,
        barRadius: 999,
        normalize: true,
        dragToSeek: true,
      });

      waveSurferRef.current = waveSurfer;
      setIsReady(false);
      setIsPlaying(false);
      setCurrentTime(0);

      waveSurfer.on("ready", () => {
        setIsReady(true);
      });

      waveSurfer.on("play", () => {
        setIsPlaying(true);
      });

      waveSurfer.on("pause", () => {
        setIsPlaying(false);
      });

      waveSurfer.on("finish", () => {
        setIsPlaying(false);
        setCurrentTime(waveSurfer.getDuration());
      });

      waveSurfer.on("timeupdate", (time) => {
        if (typeof time === "number") {
          setCurrentTime(time);
        }
      });
    }

    void setupWaveform();

    return () => {
      cancelled = true;
      waveSurferRef.current?.destroy();
      waveSurferRef.current = null;
    };
  }, [objectUrl]);

  const displayedDuration = isReady
    ? waveSurferRef.current?.getDuration() ?? durationSeconds
    : durationSeconds;

  return (
    <div className="rounded-[1.5rem] border border-[rgba(31,122,122,0.16)] bg-[rgba(255,255,255,0.7)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--teal)]">
            Audio preview
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            {fileName}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span className="rounded-full bg-[rgba(31,122,122,0.1)] px-3 py-1">
              {formatDuration(displayedDuration)}
            </span>
            <span className="rounded-full bg-[rgba(196,96,47,0.1)] px-3 py-1">
              {formatFileSize(sizeBytes)}
            </span>
            {compressionWarning ? (
              <span className="rounded-full bg-[rgba(232,184,75,0.22)] px-3 py-1 text-[var(--accent-deep)]">
                Compression recommended
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => waveSurferRef.current?.playPause()}
          disabled={!isReady}
          className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlaying ? "Pause preview" : "Play preview"}
        </button>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-[rgba(250,245,238,0.9)] px-4 py-5">
        <div ref={containerRef} className="min-h-[88px]" />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <span>Current position</span>
        <span>{formatDuration(currentTime)}</span>
      </div>
    </div>
  );
}