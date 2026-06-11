-- ================================================================
-- Orbit Meeting — Supabase Database Schema
-- Run this in your Supabase SQL Editor or via migration
-- ================================================================

-- 1. PROFILES (extends auth.users)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sync profile on user update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. MEETINGS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT UNIQUE NOT NULL,            -- xxx-xxx-xxx format
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  passcode TEXT DEFAULT '',
  meeting_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  call_id TEXT                                -- Stream Video call ID (defaults to meeting_id)
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view any meeting
CREATE POLICY "Meetings are viewable by authenticated users"
  ON meetings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Host can insert/update/delete their own meetings
CREATE POLICY "Host can insert meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Host can delete their meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = host_id);

-- We'll also allow admin-level service role access for scheduled jobs

-- 3. MEETING PARTICIPANTS (track who joined)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL DEFAULT 'Guest',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  has_video BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by authenticated users"
  ON meeting_participants FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own participation"
  ON meeting_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own participation"
  ON meeting_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. RECORDINGS (track stored recordings)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recordings viewable by meeting host"
  ON recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = recordings.meeting_id
      AND meetings.host_id = auth.uid()
    )
  );

CREATE POLICY "Host can insert recordings"
  ON recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = recordings.meeting_id
      AND meetings.host_id = auth.uid()
    )
  );

-- 5. INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_meetings_host ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_id ON meetings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_meeting ON recordings(meeting_id);

-- 6. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
