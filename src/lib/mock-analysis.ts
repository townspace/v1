import type { VocalAnalysis } from "@/types/analysis";

export const MOCK_ANALYSIS: VocalAnalysis = {
  overallScore: 74,
  grade: "C",
  summary:
    "Your phrasing is expressive and the emotional intent reads clearly. Pitch center drifts on sustained vowels, especially entering higher notes.",
  metrics: [
    {
      name: "Pitch Accuracy",
      score: 68,
      weight: 0.3,
      note: "Upper sustained notes run 20-35 cents flat after attack.",
    },
    {
      name: "Rhythm & Timing",
      score: 79,
      weight: 0.2,
      note: "Pulse is stable, with minor anticipation before cadences.",
    },
    {
      name: "Tone Quality",
      score: 76,
      weight: 0.2,
      note: "Warm core tone, slight throat squeeze at louder moments.",
    },
    {
      name: "Breath Control",
      score: 70,
      weight: 0.15,
      note: "Breath pressure drops at phrase endings and pitch sags.",
    },
    {
      name: "Dynamics",
      score: 78,
      weight: 0.1,
      note: "Good contrast, but crescendos plateau before target peak.",
    },
    {
      name: "Diction & Articulation",
      score: 81,
      weight: 0.05,
      note: "Consonants are clean; open vowels need more consistency.",
    },
  ],
  feedback: [
    {
      type: "strength",
      timestamp: "0:05–0:10",
      text: "Phrasing and lyric emphasis align well with harmonic movement.",
    },
    {
      type: "improve",
      timestamp: "0:14–0:19",
      text: "Stabilize pitch center on long vowels with slower vibrato onset.",
    },
    {
      type: "error",
      timestamp: "0:23–0:26",
      text: "Pitch drops sharply on phrase release due to unsupported airflow.",
    },
  ],
  idealDescription:
    "An ideal version keeps each note centered from onset through release, with stable breath pressure under sustained vowels. Tone remains resonant and free, especially during louder passages, without jaw or tongue tension. Phrases land rhythmically with intentional push-and-pull while maintaining pulse integrity. Dynamic shape should rise smoothly, then release with controlled decrescendo and clear diction.",
  technicalNotes: {
    detectedKey: "A major",
    tempoObservation: "Tempo is generally steady with slight rushing before phrase endings.",
    rangeObserved: "A3 to E5",
    voiceType: "mezzo",
  },
  exercises: [
    {
      name: "5-note siren with straw phonation",
      purpose: "Improves pitch centering and reduces laryngeal tension.",
      instruction:
        "Use a straw in water and glide on a 5-note pattern from mid to upper range. Keep bubbles consistent and avoid pushing volume. Repeat 6 rounds, then sing the phrase with the same airflow feeling.",
    },
    {
      name: "Sustained vowel breath ladder",
      purpose: "Builds steady airflow across phrase endings.",
      instruction:
        "Sustain 'ah' for 6, 8, then 10 beats at mezzo-piano while watching for pitch drift. Reset with silent low-rib inhale each rep. Do 3 sets before running the target line.",
    },
  ],
  nextSessionFocus: "Maintain pitch center during long vowels above D4 with stable breath pressure.",
};