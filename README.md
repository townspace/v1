## Vocal Analysis Platform
The app allows users to upload a short audio clip of themselves singing. The AI 
analyses the recording and returns structured, educational feedback comparing 
their performance to a reference standard. 

1. User uploads an audio snippet (MP3, WAV, M4A — up to 25MB)
2. User provides optional context: song title, artist, experience level, focus area
3. App sends audio + context to the Anthropic Claude API for analysis
4. Claude returns structured JSON with scores, feedback, and prescriptions
5. UI renders a full coaching report with waveform, scores, feedback, and exercises
6. User can save sessions and track progress over time

## Required metrics (always include all 6):
1. Pitch Accuracy (weight: 0.30)
2. Rhythm & Timing (weight: 0.20)
3. Tone Quality (weight: 0.20)
4. Breath Control (weight: 0.15)
5. Dynamics (weight: 0.10)
6. Diction & Articulation (weight: 0.05)
