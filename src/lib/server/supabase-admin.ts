import { randomUUID } from "crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { VocalAnalysis } from "@/types/analysis";

const DEFAULT_AUDIO_BUCKET = "session-audio";

export type ProfileSummary = {
  plan: "free" | "pro";
  analysesThisMonth: number;
};

export type StoreSessionInput = {
  userId: string;
  file: File;
  fileBuffer: Buffer;
  fileContentType: string;
  songTitle: string | null;
  artist: string | null;
  level: string;
  analysis: VocalAnalysis;
  durationSeconds: number | null;
  profileSummary: ProfileSummary | null;
};

type ProfileRow = {
  plan: "free" | "pro";
  analyses_this_month: number | null;
};

type SessionInsertRow = {
  user_id: string;
  audio_url: string;
  song_title: string | null;
  artist: string | null;
  level: string;
  overall_score: number;
  grade: string;
  analysis_json: VocalAnalysis;
  duration_seconds: number | null;
};

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary | null> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("plan, analyses_this_month")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    plan: data.plan === "pro" ? "pro" : "free",
    analysesThisMonth: data.analyses_this_month ?? 0,
  };
}

export async function countSessionsInLastHour(userId: string): Promise<number | null> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", sinceIso);

  if (error) {
    throw new Error(`Failed to load recent sessions: ${error.message}`);
  }

  return count ?? 0;
}

export async function storeAnalysisSession({
  userId,
  file,
  fileBuffer,
  fileContentType,
  songTitle,
  artist,
  level,
  analysis,
  durationSeconds,
  profileSummary,
}: StoreSessionInput): Promise<void> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const bucket = process.env.SUPABASE_AUDIO_BUCKET || DEFAULT_AUDIO_BUCKET;
  const objectPath = buildStoragePath(userId, file.name);
  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: fileContentType,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Failed to upload audio clip: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  const audioUrl = publicUrlData.publicUrl;

  if (!audioUrl) {
    throw new Error("Audio upload succeeded but no storage URL was returned.");
  }

  const sessionRow: SessionInsertRow = {
    user_id: userId,
    audio_url: audioUrl,
    song_title: songTitle,
    artist,
    level,
    overall_score: analysis.overallScore,
    grade: analysis.grade,
    analysis_json: analysis,
    duration_seconds: durationSeconds,
  };

  const { error: insertError } = await supabase.from("sessions").insert(sessionRow);

  if (insertError) {
    throw new Error(`Failed to store analysis session: ${insertError.message}`);
  }

  const nextMonthlyCount = (profileSummary?.analysesThisMonth ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ analyses_this_month: nextMonthlyCount })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Failed to update profile counters: ${updateError.message}`);
  }
}

function buildStoragePath(userId: string, fileName: string): string {
  const extension = extractExtension(fileName);
  const dateKey = new Date().toISOString().slice(0, 10);

  return `${userId}/${dateKey}/${randomUUID()}${extension}`;
}

function extractExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return fileName.slice(dotIndex).toLowerCase();
}