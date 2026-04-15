import {
  ANALYSIS_JSON_SCHEMA,
  FEEDBACK_TYPES,
  GRADES,
  REQUIRED_METRICS,
  VOICE_TYPES,
  type AnalysisExercise,
  type AnalysisFeedback,
  type AnalysisMetric,
  type AnalysisMetricName,
  type TechnicalNotes,
  type VocalAnalysis,
} from "@/types/analysis";

const metricWeights = new Map(
  REQUIRED_METRICS.map((metric) => [metric.name, metric.weight] satisfies [AnalysisMetricName, number]),
);

export { ANALYSIS_JSON_SCHEMA };

export function parseAnalysisResponse(payload: string): VocalAnalysis {
  let parsed: unknown;

  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error("Claude returned invalid JSON.");
  }

  return validateAnalysis(parsed);
}

export function validateAnalysis(value: unknown): VocalAnalysis {
  const root = asObject(value, "analysis");

  const metrics = validateMetrics(root.metrics);
  const feedback = validateFeedback(root.feedback);
  const exercises = validateExercises(root.exercises);
  const technicalNotes = validateTechnicalNotes(root.technicalNotes);

  return {
    overallScore: asIntegerInRange(root.overallScore, "overallScore", 0, 100),
    grade: asEnum(root.grade, "grade", GRADES),
    summary: asTrimmedString(root.summary, "summary"),
    metrics,
    feedback,
    idealDescription: asTrimmedString(root.idealDescription, "idealDescription"),
    technicalNotes,
    exercises,
    nextSessionFocus: asTrimmedString(root.nextSessionFocus, "nextSessionFocus"),
  };
}

function validateMetrics(value: unknown): AnalysisMetric[] {
  if (!Array.isArray(value) || value.length !== REQUIRED_METRICS.length) {
    throw new Error("Analysis metrics must include exactly 6 entries.");
  }

  const parsedMetrics = value.map((metric, index) => {
    const item = asObject(metric, `metrics[${index}]`);
    const name = asEnum(item.name, `metrics[${index}].name`, REQUIRED_METRICS.map((entry) => entry.name));
    const score = asIntegerInRange(item.score, `metrics[${index}].score`, 0, 100);
    const weight = asNumber(item.weight, `metrics[${index}].weight`);
    const note = asTrimmedString(item.note, `metrics[${index}].note`, 120);
    const expectedWeight = metricWeights.get(name);

    if (expectedWeight === undefined) {
      throw new Error(`Unexpected metric name: ${name}`);
    }

    if (Math.abs(weight - expectedWeight) > 0.0001) {
      throw new Error(`Metric ${name} must use weight ${expectedWeight}.`);
    }

    return { name, score, weight, note };
  });

  const uniqueMetricNames = new Set(parsedMetrics.map((metric) => metric.name));

  if (uniqueMetricNames.size !== REQUIRED_METRICS.length) {
    throw new Error("Analysis metrics must include each required metric once.");
  }

  const totalWeight = parsedMetrics.reduce((sum, metric) => sum + metric.weight, 0);

  if (Math.abs(totalWeight - 1) > 0.0001) {
    throw new Error("Analysis metric weights must sum to 1.0.");
  }

  return parsedMetrics;
}

function validateFeedback(value: unknown): AnalysisFeedback[] {
  if (!Array.isArray(value)) {
    throw new Error("feedback must be an array.");
  }

  return value.map((entry, index) => {
    const item = asObject(entry, `feedback[${index}]`);

    return {
      type: asEnum(item.type, `feedback[${index}].type`, FEEDBACK_TYPES),
      timestamp: asNullableString(item.timestamp, `feedback[${index}].timestamp`),
      text: asTrimmedString(item.text, `feedback[${index}].text`),
    };
  });
}

function validateTechnicalNotes(value: unknown): TechnicalNotes {
  const notes = asObject(value, "technicalNotes");

  return {
    detectedKey: asNullableString(notes.detectedKey, "technicalNotes.detectedKey"),
    tempoObservation: asTrimmedString(notes.tempoObservation, "technicalNotes.tempoObservation"),
    rangeObserved: asTrimmedString(notes.rangeObserved, "technicalNotes.rangeObserved"),
    voiceType: asNullableEnum(notes.voiceType, "technicalNotes.voiceType", VOICE_TYPES),
  };
}

function validateExercises(value: unknown): AnalysisExercise[] {
  if (!Array.isArray(value)) {
    throw new Error("exercises must be an array.");
  }

  return value.map((entry, index) => {
    const item = asObject(entry, `exercises[${index}]`);

    return {
      name: asTrimmedString(item.name, `exercises[${index}].name`),
      purpose: asTrimmedString(item.purpose, `exercises[${index}].purpose`),
      instruction: asTrimmedString(item.instruction, `exercises[${index}].instruction`),
    };
  });
}

function asObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function asTrimmedString(value: unknown, fieldName: string, maxLength?: number): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  if (maxLength && trimmed.length > maxLength) {
    throw new Error(`${fieldName} exceeds the allowed length.`);
  }

  return trimmed;
}

function asNullableString(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return asTrimmedString(value, fieldName);
}

function asNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${fieldName} must be a number.`);
  }

  return value;
}

function asIntegerInRange(
  value: unknown,
  fieldName: string,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new Error(`${fieldName} must be an integer between ${minimum} and ${maximum}.`);
  }

  return value as number;
}

function asEnum<const Values extends readonly string[]>(
  value: unknown,
  fieldName: string,
  values: Values,
): Values[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${values.join(", ")}.`);
  }

  return value;
}

function asNullableEnum<const Values extends readonly string[]>(
  value: unknown,
  fieldName: string,
  values: Values,
): Values[number] | null {
  if (value === null || value === undefined) {
    return null;
  }

  return asEnum(value, fieldName, values);
}