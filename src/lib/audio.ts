import {
  ACCEPTED_AUDIO_EXTENSIONS,
  ACCEPTED_AUDIO_MIME_TYPES,
  COMPRESSION_WARNING_SIZE_BYTES,
  MAX_AUDIO_DURATION_SECONDS,
  MAX_AUDIO_FILE_SIZE_BYTES,
  type AudioInspection,
} from "@/types/upload";

const acceptedMimeTypes = new Set(ACCEPTED_AUDIO_MIME_TYPES);
const acceptedExtensions = new Set(ACCEPTED_AUDIO_EXTENSIONS);

type ExtendedWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(totalSeconds: number): string {
  const clampedSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.round(totalSeconds))
    : 0;
  const minutes = Math.floor(clampedSeconds / 60);
  const seconds = clampedSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function validateAudioFile(file: File): string | null {
  const extension = getExtension(file.name);
  const isSupportedType =
    acceptedMimeTypes.has(file.type as (typeof ACCEPTED_AUDIO_MIME_TYPES)[number]) ||
    acceptedExtensions.has(extension as (typeof ACCEPTED_AUDIO_EXTENSIONS)[number]);

  if (!isSupportedType) {
    return "Upload an MP3, WAV, or M4A recording.";
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return "The clip is larger than 25MB. Trim or compress it before uploading.";
  }

  return null;
}

export async function inspectAudioFile(file: File): Promise<AudioInspection> {
  const validationError = validateAudioFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const durationSeconds = await getAudioDuration(file);

  if (durationSeconds > MAX_AUDIO_DURATION_SECONDS) {
    throw new Error("The clip is longer than 3 minutes. Upload a shorter passage.");
  }

  return {
    durationSeconds,
    sizeBytes: file.size,
    compressionWarning: file.size > COMPRESSION_WARNING_SIZE_BYTES,
  };
}

async function getAudioDuration(file: File): Promise<number> {
  try {
    return await getAudioDurationFromWebAudio(file);
  } catch {
    return getAudioDurationFromMetadata(file);
  }
}

async function getAudioDurationFromWebAudio(file: File): Promise<number> {
  const AudioContextClass =
    window.AudioContext || (window as ExtendedWindow).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API unavailable");
  }

  const context = new AudioContextClass();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const decodedAudio = await context.decodeAudioData(arrayBuffer.slice(0));

    if (!Number.isFinite(decodedAudio.duration) || decodedAudio.duration <= 0) {
      throw new Error("Invalid clip duration");
    }

    return decodedAudio.duration;
  } finally {
    void context.close();
  }
}

function getAudioDurationFromMetadata(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = document.createElement("audio");

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      audio.removeAttribute("src");
      audio.load();
    };

    audio.preload = "metadata";
    audio.src = objectUrl;

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("The audio file could not be decoded."));
        return;
      }

      resolve(duration);
    };

    audio.onerror = () => {
      cleanup();
      reject(new Error("The audio file could not be decoded."));
    };
  });
}

function getExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}