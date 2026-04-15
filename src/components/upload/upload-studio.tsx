"use client";

import { useEffect, useState } from "react";

import { AnalysisLoader } from "@/components/report/analysis-loader";
import { ReportCard } from "@/components/report/report-card";
import { ContextForm } from "@/components/upload/context-form";
import { UploadZone } from "@/components/upload/upload-zone";
import { createSupabaseClient } from "@/lib/client/supabase-client";
import { inspectAudioFile } from "@/lib/audio";
import { MOCK_ANALYSIS } from "@/lib/mock-analysis";
import {
  type SelectedAudio,
  type UploadContextValues,
} from "@/types/upload";
import type { VocalAnalysis } from "@/types/analysis";

const DEFAULT_CONTEXT: UploadContextValues = {
  songTitle: "",
  artist: "",
  level: "Intermediate",
  focus: "Pitch accuracy",
  notes: "",
};

type PreparedPayload = {
  fileName: string;
  fileType: string;
  sizeBytes: number;
  durationSeconds: number;
  context: UploadContextValues;
};

export function UploadStudio() {
  const [selectedAudio, setSelectedAudio] = useState<SelectedAudio | null>(null);
  const [contextValue, setContextValue] = useState<UploadContextValues>(DEFAULT_CONTEXT);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [preparedPayload, setPreparedPayload] = useState<PreparedPayload | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VocalAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    }

    void getUser();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedAudio?.objectUrl) {
        URL.revokeObjectURL(selectedAudio.objectUrl);
      }
    };
  }, [selectedAudio]);

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setWarningMessage(null);
    setPreparedPayload(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsInspecting(true);

    try {
      const inspection = await inspectAudioFile(file);
      const objectUrl = URL.createObjectURL(file);

      setSelectedAudio((current) => {
        if (current?.objectUrl) {
          URL.revokeObjectURL(current.objectUrl);
        }

        return {
          file,
          objectUrl,
          ...inspection,
        };
      });

      if (inspection.compressionWarning) {
        setWarningMessage(
          "This file is larger than 10MB. It can still be uploaded, but compression would speed up analysis.",
        );
      }
    } catch (error) {
      setSelectedAudio((current) => {
        if (current?.objectUrl) {
          URL.revokeObjectURL(current.objectUrl);
        }

        return null;
      });
      setErrorMessage(
        error instanceof Error ? error.message : "The audio clip could not be prepared.",
      );
    } finally {
      setIsInspecting(false);
    }
  };

  const handleClear = () => {
    setPreparedPayload(null);
    setErrorMessage(null);
    setWarningMessage(null);
    setAnalysisResult(null);
    setAnalysisError(null);
    setSelectedAudio((current) => {
      if (current?.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return null;
    });
  };

  const handlePreparePayload = () => {
    if (!selectedAudio) {
      setErrorMessage("Select a vocal clip before preparing the analysis request.");
      return;
    }

    setErrorMessage(null);
    setPreparedPayload({
      fileName: selectedAudio.file.name,
      fileType: selectedAudio.file.type || "audio/unknown",
      sizeBytes: selectedAudio.sizeBytes,
      durationSeconds: selectedAudio.durationSeconds,
      context: contextValue,
    });
  };

  const handleAnalyse = async () => {
    if (!selectedAudio) {
      setErrorMessage("Select a vocal clip before starting analysis.");
      return;
    }

    setErrorMessage(null);
    setAnalysisError(null);
    setIsAnalysing(true);

    try {
      const formData = new FormData();
      formData.append("audio", selectedAudio.file);
      formData.append("songTitle", contextValue.songTitle);
      formData.append("artist", contextValue.artist);
      formData.append("level", contextValue.level);
      formData.append("focus", contextValue.focus);
      formData.append("notes", contextValue.notes);
      formData.append("durationSeconds", selectedAudio.durationSeconds.toString());
      if (userId) {
        formData.append("userId", userId);
      }

      const response = await fetch("/api/analyse", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const routeMessage =
          payload && typeof payload === "object" && "error" in payload
            ? extractRouteErrorMessage(payload.error)
            : null;

        throw new Error(routeMessage ?? "The analysis request failed. Please try again.");
      }

      setAnalysisResult(payload as VocalAnalysis);
    } catch (error) {
      setAnalysisResult(null);
      setAnalysisError(error instanceof Error ? error.message : "The analysis request failed.");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-8">
        <UploadZone
          selectedAudio={selectedAudio}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          isInspecting={isInspecting}
          errorMessage={errorMessage}
          warningMessage={warningMessage}
        />
        <ContextForm value={contextValue} onChange={setContextValue} />
      </div>

      <aside className="space-y-6">
        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
            Step 5 flow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
            Trigger the full upload to analysis pipeline.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            First validate request data, then submit to the analysis route and render the coaching report below.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Ready checklist
            </p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--foreground)]">
              <li>Validated audio format and file size</li>
              <li>Measured clip duration client-side</li>
              <li>Captured song context and coaching focus</li>
              <li>Submitted multipart request to analysis API</li>
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handlePreparePayload}
              className="inline-flex w-full items-center justify-center rounded-[1.1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.72)] px-5 py-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
            >
              Prepare payload
            </button>
            <button
              type="button"
              onClick={handleAnalyse}
              disabled={isAnalysing}
              className="inline-flex w-full items-center justify-center rounded-[1.1rem] bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalysing ? "Analysing..." : "Run analysis"}
            </button>
          </div>

          {analysisError ? (
            <div className="mt-4 rounded-[1rem] border border-[rgba(155,51,34,0.26)] bg-[rgba(155,51,34,0.08)] px-4 py-3 text-sm text-[var(--accent-deep)]">
              {analysisError}
            </div>
          ) : null}
        </section>

        <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
                Payload preview
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                What Step 3 will submit
              </h3>
            </div>
            <span className="rounded-full bg-[rgba(31,122,122,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
              Local only
            </span>
          </div>

          {preparedPayload ? (
            <div className="mt-5 space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <DataBlock label="File" value={preparedPayload.fileName} />
                <DataBlock label="Type" value={preparedPayload.fileType} />
                <DataBlock label="Duration" value={`${preparedPayload.durationSeconds.toFixed(1)} seconds`} />
                <DataBlock label="Size" value={`${(preparedPayload.sizeBytes / (1024 * 1024)).toFixed(2)} MB`} />
              </dl>

              <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Context payload
                </p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
{JSON.stringify(preparedPayload.context, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.42)] px-4 py-5 text-sm leading-6 text-[var(--muted)]">
              Choose a clip and fill in the context form, then prepare the payload to verify the client contract before the API route is implemented.
            </div>
          )}
        </section>
      </aside>

      <div className="lg:col-span-2">
        {isAnalysing ? <AnalysisLoader /> : null}
        {!isAnalysing && analysisResult ? (
          <ReportCard
            analysis={analysisResult}
            sourceLabel="Live API response"
            audioUrl={selectedAudio?.objectUrl}
            durationSeconds={selectedAudio?.durationSeconds}
          />
        ) : null}
        {!isAnalysing && !analysisResult ? (
          <ReportCard
            analysis={MOCK_ANALYSIS}
            sourceLabel="Static mock data"
            audioUrl={selectedAudio?.objectUrl}
            durationSeconds={selectedAudio?.durationSeconds}
          />
        ) : null}
      </div>
    </section>
  );
}

function extractRouteErrorMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const message = (value as { message?: unknown }).message;

  return typeof message === "string" && message.trim() ? message.trim() : null;
}

type DataBlockProps = {
  label: string;
  value: string;
};

function DataBlock({ label, value }: DataBlockProps) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{value}</p>
    </div>
  );
}