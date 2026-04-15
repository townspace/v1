"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { createSupabaseClient } from "@/lib/client/supabase-client";

type ScoreDataPoint = {
  date: string;
  score: number;
  grade: string;
};

export function ProgressChart() {
  const [data, setData] = useState<ScoreDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
    total: 0,
  });

  useEffect(() => {
    async function loadProgressData() {
      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: sessions, error: queryError } = await supabase
          .from("sessions")
          .select("created_at, overall_score, grade")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (queryError) {
          throw queryError;
        }

        const chartData = (sessions || []).map((session) => ({
          date: new Date(session.created_at as string).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          score: session.overall_score as number,
          grade: session.grade as string,
        }));

        if (chartData.length > 0) {
          const scores = chartData.map((d) => d.score);
          const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          const highest = Math.max(...scores);
          const lowest = Math.min(...scores);

          setStats({
            average,
            highest,
            lowest,
            total: scores.length,
          });
        }

        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress data.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProgressData();
  }, []);

  if (isLoading) {
    return (
      <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Loading</p>
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

  return (
    <section className="glass-panel rounded-[1.75rem] p-6 sm:p-7">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">Progress tracking</p>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">
          Your performance over time
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="mt-6 rounded-[1rem] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.42)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--muted)]">No analysis data yet. Complete your first session to see trends.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Total sessions" value={stats.total.toString()} />
            <StatCard label="Average score" value={stats.average.toString()} />
            <StatCard label="Highest score" value={stats.highest.toString()} />
            <StatCard label="Lowest score" value={stats.lowest.toString()} />
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.58)] p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(77,55,52,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(106, 89, 97, 0.6)"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="rgba(106, 89, 97, 0.6)"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 250, 242, 0.95)",
                    border: "1px solid rgba(77, 55, 52, 0.2)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [value, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#c4602f"
                  dot={{ fill: "#8f3426", r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-[1rem] border border-[var(--border)] bg-[rgba(255,255,255,0.66)] px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">{value}</p>
    </div>
  );
}
