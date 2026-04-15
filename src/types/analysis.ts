export const REQUIRED_METRICS = [
  { name: "Pitch Accuracy", weight: 0.3 },
  { name: "Rhythm & Timing", weight: 0.2 },
  { name: "Tone Quality", weight: 0.2 },
  { name: "Breath Control", weight: 0.15 },
  { name: "Dynamics", weight: 0.1 },
  { name: "Diction & Articulation", weight: 0.05 },
] as const;

export const GRADES = ["A", "B", "C", "D", "F"] as const;
export const FEEDBACK_TYPES = ["strength", "improve", "error"] as const;
export const VOICE_TYPES = [
  "soprano",
  "mezzo",
  "alto",
  "tenor",
  "baritone",
  "bass",
] as const;

export type Grade = (typeof GRADES)[number];
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];
export type VoiceType = (typeof VOICE_TYPES)[number];

export type AnalysisMetricName = (typeof REQUIRED_METRICS)[number]["name"];

export type AnalysisMetric = {
  name: AnalysisMetricName;
  score: number;
  weight: number;
  note: string;
};

export type AnalysisFeedback = {
  type: FeedbackType;
  timestamp: string | null;
  text: string;
};

export type TechnicalNotes = {
  detectedKey: string | null;
  tempoObservation: string;
  rangeObserved: string;
  voiceType: VoiceType | null;
};

export type AnalysisExercise = {
  name: string;
  purpose: string;
  instruction: string;
};

export type VocalAnalysis = {
  overallScore: number;
  grade: Grade;
  summary: string;
  metrics: AnalysisMetric[];
  feedback: AnalysisFeedback[];
  idealDescription: string;
  technicalNotes: TechnicalNotes;
  exercises: AnalysisExercise[];
  nextSessionFocus: string;
};

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "overallScore",
    "grade",
    "summary",
    "metrics",
    "feedback",
    "idealDescription",
    "technicalNotes",
    "exercises",
    "nextSessionFocus",
  ],
  properties: {
    overallScore: { type: "integer", minimum: 0, maximum: 100 },
    grade: { type: "string", enum: [...GRADES] },
    summary: { type: "string", minLength: 1 },
    metrics: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "score", "weight", "note"],
        properties: {
          name: { type: "string", enum: REQUIRED_METRICS.map((metric) => metric.name) },
          score: { type: "integer", minimum: 0, maximum: 100 },
          weight: { type: "number", minimum: 0, maximum: 1 },
          note: { type: "string", minLength: 1, maxLength: 120 },
        },
      },
    },
    feedback: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "timestamp", "text"],
        properties: {
          type: { type: "string", enum: [...FEEDBACK_TYPES] },
          timestamp: {
            anyOf: [{ type: "string", minLength: 1 }, { type: "null" }],
          },
          text: { type: "string", minLength: 1 },
        },
      },
    },
    idealDescription: { type: "string", minLength: 1 },
    technicalNotes: {
      type: "object",
      additionalProperties: false,
      required: ["detectedKey", "tempoObservation", "rangeObserved", "voiceType"],
      properties: {
        detectedKey: {
          anyOf: [{ type: "string", minLength: 1 }, { type: "null" }],
        },
        tempoObservation: { type: "string", minLength: 1 },
        rangeObserved: { type: "string", minLength: 1 },
        voiceType: {
          anyOf: [{ type: "string", enum: [...VOICE_TYPES] }, { type: "null" }],
        },
      },
    },
    exercises: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "purpose", "instruction"],
        properties: {
          name: { type: "string", minLength: 1 },
          purpose: { type: "string", minLength: 1 },
          instruction: { type: "string", minLength: 1 },
        },
      },
    },
    nextSessionFocus: { type: "string", minLength: 1 },
  },
} as const;
