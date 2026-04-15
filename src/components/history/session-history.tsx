"use client";

import { useEffect, useState } from "react";

import { createSupabaseClient } from "@/lib/client/supabase-client";
import { formatDuration } from "@/lib/audio";

type SessionRecord = {
  id: string;
  created_at: string;
  song_title: string | null;
  artist: string | null;
  level: string;
  overall_score: number;
  grade: string;
  duration_seconds: number | null;
  audio_url: string;
};

export function SessionHistory() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error: queryError } = await supabase
          .from("sessions")
          .select("id, created_at, song_title, artist, level, overall_score, grade, duration_seconds, audio_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (queryError) {
          throw queryError;
        }

        setSessions((data || []) as SessionRecord[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session history.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSessions();
  }, []);

  if (isLoading) {
    return (
      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Loading</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Fetching your session history...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Error</p>
        <p className="mt-2 text-sm text-[var(--accent-deep)]">{error}</p>
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Session history</p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          No sessions yet. Upload a clip and run an analysis to get started.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Session history</p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
          Your past analyses ({sessions.length})
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Click any session to review detailed feedback and compare your performance over time.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {sessions.map((session) => (
          <article
            key={session.id}
            className="group rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.66)] p-4 transition hover:border-[rgba(196,96,47,0.32)] hover:bg-[rgba(255,255,255,0.8)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold tracking-[-0.01em] text-[var(--foreground)]">
                    {session.song_title || "Untitled"}
                  </h3>
                  {session.artist && (
                    <>
                      <span className="text-[var(--muted)]">•</span>
                      <p className="text-sm text-[var(--muted)]">{session.artist}</p>
                    </>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[rgba(31,122,122,0.12)] px-2 py-1 text-[var(--teal)]">
                    {session.level}
                  </span>
                  {session.duration_seconds && (
                    <span className="rounded-full bg-[rgba(196,96,47,0.12)] px-2 py-1 text-[var(--accent-deep)]">
                      {formatDuration(session.duration_seconds)}
                    </span>
                  )}
                  <span className="rounded-full bg-[rgba(77,55,52,0.1)] px-2 py-1 text-[var(--muted)]">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
                    {session.overall_score}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">score</p>
                </div>
                <div className="rounded-full bg-[rgba(196,96,47,0.12)] px-3 py-2 text-center">
                  <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--accent)]">{session.grade}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
