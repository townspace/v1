"use client";

import { useEffect, useRef, useState } from "react";
import type WaveSurfer from "wavesurfer.js";

import { formatDuration } from "@/lib/audio";
import type { AnalysisFeedback } from "@/types/analysis";

type ReportWaveformProps = {
  audioUrl: string;
  feedback: AnalysisFeedback[];
  durationSeconds: number;
};

const FEEDBACK_TYPE_COLORS = {
  strength: "rgba(31, 122, 122, 0.3)",
  improve: "rgba(196, 96, 47, 0.25)",
  error: "rgba(155, 51, 34, 0.3)",
} as const;

export function ReportWaveform({ audioUrl, feedback, durationSeconds }: ReportWaveformProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<unknown>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupWaveform() {
      const container = containerRef.current;
      if (!container) return;

      const { default: WaveSurfer } = await import("wavesurfer.js");
      const RegionsPlugin = (await import("wavesurfer.js/dist/plugins/regions.js")).default;

      if (cancelled) return;

      const waveSurfer = WaveSurfer.create({
        container,
        url: audioUrl,
        waveColor: "rgba(31, 122, 122, 0.28)",
        progressColor: "#c4602f",
        cursorColor: "#8f3426",
        height: 120,
        barWidth: 3,
        barGap: 2,
        barRadius: 999,
        normalize: true,
        dragToSeek: true,
      });

      const regionsPlugin = RegionsPlugin.create();
      waveSurfer.registerPlugin(regionsPlugin);
      waveSurferRef.current = waveSurfer;
      regionsPluginRef.current = regionsPlugin;

      setIsReady(false);
      setIsPlaying(false);
      setCurrentTime(0);

      waveSurfer.on("ready", () => {
        setIsReady(true);
        if (regionsPluginRef.current) {
          addFeedbackRegions(regionsPluginRef.current, feedback, durationSeconds);
        }
      });

      waveSurfer.on("play", () => setIsPlaying(true));
      waveSurfer.on("pause", () => setIsPlaying(false));
      waveSurfer.on("finish", () => {
        setIsPlaying(false);
        setCurrentTime(waveSurfer.getDuration());
      });

      waveSurfer.on("timeupdate", (time) => {
        if (typeof time === "number") setCurrentTime(time);
      });
    }

    void setupWaveform();

    return () => {
      cancelled = true;
      waveSurferRef.current?.destroy();
      waveSurferRef.current = null;
      regionsPluginRef.current = null;
    };
  }, [audioUrl, feedback, durationSeconds]);

  const displayedDuration = isReady ? waveSurferRef.current?.getDuration() ?? durationSeconds : durationSeconds;

  return (
    <section className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--teal)]">Audio waveform</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Playback with feedback regions
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Click regions to jump to feedback moments. Colored overlays mark strength (teal), improvements (orange), and
            errors (red).
          </p>
        </div>

        <button
          type="button"
          onClick={() => waveSurferRef.current?.playPause()}
          disabled={!isReady}
          className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlaying ? "Pause playback" : "Play audio"}
        </button>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-[rgba(250,245,238,0.9)] px-4 py-5">
        <div ref={containerRef} className="min-h-[120px]" />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        <span>Current position</span>
        <span>
          {formatDuration(currentTime)} / {formatDuration(displayedDuration)}
        </span>
      </div>

      {feedback.length > 0 ? (
        <div className="mt-5 space-y-2 rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.7)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Regions ({feedback.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {feedback.map((entry, index) => (
              <button
                key={`${entry.type}-${entry.timestamp}-${index}`}
                onMouseEnter={() => setHoveredRegion(`${entry.type}-${index}`)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => {
                  if (entry.timestamp && waveSurferRef.current) {
                    const [start] = parseTimestamp(entry.timestamp);
                    if (start !== null) {
                      waveSurferRef.current.seekTo(start / displayedDuration);
                    }
                  }
                }}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                  hoveredRegion === `${entry.type}-${index}`
                    ? "scale-105 brightness-110"
                    : "opacity-90 hover:opacity-100"
                } ${
                  entry.type === "strength"
                    ? "border border-[rgba(31,122,122,0.4)] bg-[rgba(31,122,122,0.15)] text-[var(--teal)]"
                    : entry.type === "improve"
                      ? "border border-[rgba(196,96,47,0.35)] bg-[rgba(196,96,47,0.15)] text-[var(--accent)]"
                      : "border border-[rgba(155,51,34,0.4)] bg-[rgba(155,51,34,0.15)] text-[var(--accent-deep)]"
                }`}
              >
                {entry.type} {entry.timestamp && `@ ${entry.timestamp}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function addFeedbackRegions(
  regionsPlugin: unknown,
  feedback: AnalysisFeedback[],
  maxDuration: number,
) {
  const plugin = regionsPlugin as { addRegion: (config: object) => void };
  feedback.forEach((entry, index) => {
    if (!entry.timestamp) return;

    const [start, end] = parseTimestamp(entry.timestamp);
    if (start === null || end === null) return;

    const clampedStart = Math.max(0, Math.min(start, maxDuration));
    const clampedEnd = Math.max(clampedStart, Math.min(end, maxDuration));

    plugin.addRegion({
      id: `${entry.type}-${index}`,
      start: clampedStart,
      end: clampedEnd,
      drag: false,
      resize: false,
      color: FEEDBACK_TYPE_COLORS[entry.type],
      data: {
        type: entry.type,
        text: entry.text,
      },
    });
  });
}

function parseTimestamp(timestamp: string): [number | null, number | null] {
  const match = timestamp.match(/(\d{1,2}):(\d{2})(?:–(\d{1,2}):(\d{2}))?/);
  if (!match) return [null, null];

  const startMin = parseInt(match[1], 10);
  const startSec = parseInt(match[2], 10);
  const startSeconds = startMin * 60 + startSec;

  if (match[3] && match[4]) {
    const endMin = parseInt(match[3], 10);
    const endSec = parseInt(match[4], 10);
    const endSeconds = endMin * 60 + endSec;
    return [startSeconds, endSeconds];
  }

  return [startSeconds, startSeconds + 3];
}
