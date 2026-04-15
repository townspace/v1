-- Profiles table: user metadata and plan info
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('free', 'pro')) DEFAULT 'free',
  analyses_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions table: individual analysis records
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  audio_url TEXT NOT NULL,
  song_title TEXT,
  artist TEXT,
  level TEXT NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  analysis_json JSONB NOT NULL,
  duration_seconds NUMERIC
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_sessions_user_created ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
