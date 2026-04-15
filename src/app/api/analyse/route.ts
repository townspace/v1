import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

import { parseAnalysisResponse, ANALYSIS_JSON_SCHEMA } from "@/lib/analysis";
import { applyInstanceRateLimit, getRateLimitWindowMs } from "@/lib/server/rate-limit";
import {
  countSessionsInLastHour,
  getProfileSummary,
  hasSupabaseAdminConfig,
  storeAnalysisSession,
} from "@/lib/server/supabase-admin";
import { validateAudioFile } from "@/lib/audio";
import { MAX_AUDIO_FILE_SIZE_BYTES } from "@/types/upload";

const MODEL = "claude-sonnet-4-20250514";
const FREE_TIER_LIMIT = 3;

const SYSTEM_PROMPT = `
You are an expert vocal coach and music educator with decades of professional 
experience teaching singers across all genres and skill levels. You have perfect 
pitch and a deep understanding of vocal anatomy, breath mechanics, resonance, 
and musical theory.

When given an audio recording, analyse it rigorously and return ONLY a valid 
JSON object — no preamble, no markdown fences, no explanation outside the JSON.

Your JSON must follow this exact schema:
{
  "overallScore": <integer 0–100>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "summary": "<2 sentence plain-language summary of the performance>",
  "metrics": [
    {
      "name": "<metric name>",
      "score": <integer 0–100>,
      "weight": <decimal, weights must sum to 1.0>,
      "note": "<one specific observation, max 20 words>"
    }
  ],
  "feedback": [
    {
      "type": "<'strength' | 'improve' | 'error'>",
      "timestamp": "<e.g. '0:04–0:09' or null if not applicable>",
      "text": "<specific, actionable feedback — reference musical terms>"
    }
  ],
  "idealDescription": "<3–4 sentences describing what an ideal performance 
    of this passage should sound like: correct pitch centre, tonal placement, 
    breath management, phrasing, and emotional delivery>",
  "technicalNotes": {
    "detectedKey": "<musical key if detectable, else null>",
    "tempoObservation": "<observation about tempo consistency>",
    "rangeObserved": "<approximate vocal range in this clip>",
    "voiceType": "<soprano/mezzo/alto/tenor/baritone/bass — best guess>"
  },
  "exercises": [
    {
      "name": "<exercise name>",
      "purpose": "<one sentence: what this fixes>",
      "instruction": "<2–3 sentence how-to>"
    }
  ],
  "nextSessionFocus": "<one priority area to work on next>"
}

Required metrics (always include all 6):
1. Pitch Accuracy (weight: 0.30)
2. Rhythm & Timing (weight: 0.20)
3. Tone Quality (weight: 0.20)
4. Breath Control (weight: 0.15)
5. Dynamics (weight: 0.10)
6. Diction & Articulation (weight: 0.05)

Be honest, specific, and encouraging. Adjust language complexity to the singer's 
stated experience level. Never give false praise — identify real issues and 
explain how to fix them with concrete techniques.
`;

type RequestContext = {
  songTitle: string | null;
  artist: string | null;
  level: string;
  focus: string;
  notes: string | null;
  userId: string | null;
  durationSeconds: number | null;
};

class RouteError extends Error {
  status: number;
  code: string;
  retryable: boolean;

  constructor(status: number, code: string, message: string, retryable = false) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureRequiredEnv();

    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File)) {
      throw new RouteError(400, "missing_audio", "Attach an audio file in the `audio` field.");
    }

    if (audioFile.size === 0) {
      throw new RouteError(400, "empty_audio", "The uploaded audio file is empty.");
    }

    if (audioFile.size > MAX_AUDIO_FILE_SIZE_BYTES) {
      throw new RouteError(413, "file_too_large", "The uploaded audio file exceeds the 25MB limit.");
    }

    const fileValidationError = validateAudioFile(audioFile);

    if (fileValidationError) {
      throw new RouteError(400, "unsupported_audio", fileValidationError);
    }

    const context = readContext(formData);
    const plan = await enforceRateLimit(request, context.userId);
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1600,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      output_config: {
        format: {
          type: "json_schema",
          schema: ANALYSIS_JSON_SCHEMA,
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: buildUserContextText(context, audioFile),
            },
            {
              type: "document",
              title: `${audioFile.name} base64 audio payload`,
              context:
                "This document contains the raw base64 encoding of the uploaded audio clip. Treat it as the source recording associated with the user context.",
              source: {
                type: "text",
                media_type: "text/plain",
                data: audioBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = getTextResponse(response);
    const analysis = parseAnalysisResponse(responseText);

    if (context.userId && hasSupabaseAdminConfig()) {
      try {
        const profileSummary = await getProfileSummary(context.userId);

        await storeAnalysisSession({
          userId: context.userId,
          file: audioFile,
          fileBuffer: audioBuffer,
          fileContentType: audioFile.type || "application/octet-stream",
          songTitle: context.songTitle,
          artist: context.artist,
          level: context.level,
          analysis,
          durationSeconds: context.durationSeconds,
          profileSummary,
        });
      } catch (error) {
        console.error("Failed to persist vocal analysis session", error);
      }
    }

    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        "x-user-plan": plan,
      },
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

function ensureRequiredEnv() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new RouteError(500, "missing_env", "ANTHROPIC_API_KEY is not configured on the server.");
  }
}

function readContext(formData: FormData): RequestContext {
  const level = readRequiredString(formData, "level");
  const focus = readRequiredString(formData, "focus");
  const userId = readOptionalString(formData, "userId");

  if (userId && !isUuidLike(userId)) {
    throw new RouteError(400, "invalid_user", "userId must be a valid UUID.");
  }

  return {
    songTitle: readOptionalString(formData, "songTitle"),
    artist: readOptionalString(formData, "artist"),
    level,
    focus,
    notes: readOptionalString(formData, "notes"),
    userId,
    durationSeconds: readOptionalNumber(formData, "durationSeconds"),
  };
}

async function enforceRateLimit(request: NextRequest, userId: string | null): Promise<"free" | "pro"> {
  const profileSummary = userId && hasSupabaseAdminConfig() ? await getProfileSummary(userId) : null;
  const plan = profileSummary?.plan ?? "free";

  if (plan === "pro") {
    return plan;
  }

  const scopeKey = userId ?? getRequestIdentity(request);
  const memoryDecision = applyInstanceRateLimit(`analyse:${scopeKey}`, FREE_TIER_LIMIT);

  if (!memoryDecision.allowed) {
    throw new RouteError(
      429,
      "rate_limited",
      "Free plan limit reached: 3 analyses per hour. Upgrade to Pro for unlimited access.",
      true,
    );
  }

  if (userId && hasSupabaseAdminConfig()) {
    const recentSessions = await countSessionsInLastHour(userId);

    if (recentSessions !== null && recentSessions >= FREE_TIER_LIMIT) {
      throw new RouteError(
        429,
        "rate_limited",
        "Free plan limit reached: 3 analyses per hour. Upgrade to Pro for unlimited access.",
        true,
      );
    }
  }

  return plan;
}

function buildUserContextText(context: RequestContext, audioFile: File): string {
  return [
    "Analyse the attached vocal clip against the provided reference context.",
    `Song title: ${context.songTitle ?? "Not provided"}`,
    `Artist: ${context.artist ?? "Not provided"}`,
    `Experience level: ${context.level}`,
    `Focus area: ${context.focus}`,
    `Personal notes: ${context.notes ?? "Not provided"}`,
    `Uploaded file name: ${audioFile.name}`,
    `Uploaded media type: ${audioFile.type || "unknown"}`,
    `Uploaded file size bytes: ${audioFile.size}`,
    `Clip duration seconds: ${context.durationSeconds ?? "Unknown"}`,
    "Return only the JSON response and include all six required metrics with the exact weights.",
  ].join("\n");
}

function getTextResponse(response: Awaited<ReturnType<Anthropic["messages"]["create"]>>): string {
  if (!("content" in response)) {
    throw new RouteError(502, "streaming_response", "Unexpected streaming response from Claude.", true);
  }

  const text = response.content
    .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new RouteError(502, "empty_model_response", "Claude returned an empty response.", true);
  }

  return text;
}

function readRequiredString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || !value.trim()) {
    throw new RouteError(400, "invalid_request", `${fieldName} is required.`);
  }

  return value.trim();
}

function readOptionalString(formData: FormData, fieldName: string): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readOptionalNumber(formData: FormData, fieldName: string): number | null {
  const value = readOptionalString(formData, fieldName);

  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new RouteError(400, "invalid_request", `${fieldName} must be a positive number.`);
  }

  return parsedValue;
}

function getRequestIdentity(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  return request.headers.get("x-real-ip") || "anonymous";
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildErrorResponse(error: unknown) {
  if (error instanceof RouteError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
      },
      {
        status: error.status,
      },
    );
  }

  if (error instanceof Error) {
    const tooLargeMessage = "prompt is too long";

    if (error.message.toLowerCase().includes(tooLargeMessage)) {
      return NextResponse.json(
        {
          error: {
            code: "payload_too_large_for_model",
            message:
              "This clip is valid for upload but too large for the current analysis transport. Trim the passage and retry.",
            retryable: true,
          },
        },
        {
          status: 413,
        },
      );
    }
  }

  console.error("Unexpected analyse route failure", error);

  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message:
          "The vocal analysis request could not be completed. Retry in a moment or upload a shorter clip.",
        retryable: true,
      },
    },
    {
      status: 500,
      headers: {
        "x-rate-limit-window-ms": String(getRateLimitWindowMs()),
      },
    },
  );
}
