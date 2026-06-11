-- ================================================================
-- Orbit Meeting — Supabase Database Schema
-- All tables prefixed with orbit_
-- ================================================================

-- Clean slate (safe to drop — no production data)
DROP TABLE IF EXISTS orbit_recordings CASCADE;
DROP TABLE IF EXISTS orbit_meeting_participants CASCADE;
DROP TABLE IF EXISTS orbit_meetings CASCADE;
DROP TABLE IF EXISTS orbit_profiles CASCADE;

-- 1. ORBIT_PROFILES (extends auth.users)
-- ----------------------------------------------------------------
CREATE TABLE orbit_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION orbit_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.orbit_profiles (id, full_name, avatar_url)
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

-- Triggers on auth.users
DROP TRIGGER IF EXISTS orbit_on_auth_user_created ON auth.users;
CREATE TRIGGER orbit_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION orbit_handle_new_user();

DROP TRIGGER IF EXISTS orbit_on_auth_user_updated ON auth.users;
CREATE TRIGGER orbit_on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION orbit_handle_new_user();

-- RLS
ALTER TABLE orbit_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orbit_profiles_select"
  ON orbit_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "orbit_profiles_update"
  ON orbit_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. ORBIT_MEETINGS
-- ----------------------------------------------------------------
CREATE TABLE orbit_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id TEXT UNIQUE NOT NULL,            -- xxx-xxx-xxx format
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  host_id UUID NOT NULL REFERENCES orbit_profiles(id) ON DELETE CASCADE,
  passcode TEXT DEFAULT '',
  meeting_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  call_id TEXT
);

ALTER TABLE orbit_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orbit_meetings_select"
  ON orbit_meetings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "orbit_meetings_insert"
  ON orbit_meetings FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "orbit_meetings_update"
  ON orbit_meetings FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "orbit_meetings_delete"
  ON orbit_meetings FOR DELETE
  USING (auth.uid() = host_id);

-- 3. ORBIT_MEETING_PARTICIPANTS
-- ----------------------------------------------------------------
CREATE TABLE orbit_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES orbit_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES orbit_profiles(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL DEFAULT 'Guest',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  has_video BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE orbit_meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orbit_meeting_participants_select"
  ON orbit_meeting_participants FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "orbit_meeting_participants_insert"
  ON orbit_meeting_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "orbit_meeting_participants_update"
  ON orbit_meeting_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. ORBIT_RECORDINGS
-- ----------------------------------------------------------------
CREATE TABLE orbit_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES orbit_meetings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES orbit_profiles(id) ON DELETE SET NULL
);

ALTER TABLE orbit_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orbit_recordings_select"
  ON orbit_recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orbit_meetings
      WHERE orbit_meetings.id = orbit_recordings.meeting_id
      AND orbit_meetings.host_id = auth.uid()
    )
  );

CREATE POLICY "orbit_recordings_insert"
  ON orbit_recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orbit_meetings
      WHERE orbit_meetings.id = orbit_recordings.meeting_id
      AND orbit_meetings.host_id = auth.uid()
    )
  );

-- 5. INDEXES
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orbit_meetings_host ON orbit_meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_orbit_meetings_meeting_id ON orbit_meetings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_orbit_meetings_date ON orbit_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_orbit_participants_meeting ON orbit_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_orbit_participants_user ON orbit_meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_orbit_recordings_meeting ON orbit_recordings(meeting_id);

-- 6. UPDATED_AT TRIGGERS
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION orbit_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orbit_meetings_updated_at
  BEFORE UPDATE ON orbit_meetings
  FOR EACH ROW EXECUTE FUNCTION orbit_update_updated_at();

CREATE TRIGGER orbit_profiles_updated_at
  BEFORE UPDATE ON orbit_profiles
  FOR EACH ROW EXECUTE FUNCTION orbit_update_updated_at();
