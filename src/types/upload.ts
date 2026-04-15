export const ACCEPTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a"] as const;

export const ACCEPTED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
] as const;

export const MAX_AUDIO_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const COMPRESSION_WARNING_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_DURATION_SECONDS = 180;

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
] as const;

export const FOCUS_AREAS = [
  "Pitch accuracy",
  "Rhythm & timing",
  "Breath control",
  "Tone quality",
  "Dynamics",
  "Diction & articulation",
  "Stage confidence",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
export type FocusArea = (typeof FOCUS_AREAS)[number];

export type UploadContextValues = {
  songTitle: string;
  artist: string;
  level: ExperienceLevel;
  focus: FocusArea;
  notes: string;
};

export type AudioInspection = {
  durationSeconds: number;
  sizeBytes: number;
  compressionWarning: boolean;
};

export type SelectedAudio = AudioInspection & {
  file: File;
  objectUrl: string;
};