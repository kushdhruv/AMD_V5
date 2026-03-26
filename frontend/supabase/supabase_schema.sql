-- ==============================================================================
-- SUPABASE MASTER SCHEMA FOR EVENT APP (V2)
-- ==============================================================================

-- 1. STALLS & VENDORS
CREATE TABLE IF NOT EXISTS stalls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL, 
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  rating NUMERIC(3, 1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[],
  price_range TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  is_sponsored BOOLEAN DEFAULT false,
  emoji TEXT,
  location TEXT,
  artist TEXT DEFAULT 'Unknown Artist',
  requested_by TEXT DEFAULT 'Guest',
  votes INTEGER DEFAULT 1,
  status TEXT DEFAULT 'queued', 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVENT LEADERBOARD (Rankings)
CREATE TABLE IF NOT EXISTS event_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  organization TEXT,
  score INTEGER DEFAULT 0,
  track TEXT DEFAULT 'General',
  trend TEXT DEFAULT 'same',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APP REGISTRATIONS (Attendees)
CREATE TABLE IF NOT EXISTS app_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB
);

-- ==============================================================================
-- 6. SECURITY (RLS) - ENABLE ALL
-- ==============================================================================
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_registrations ENABLE ROW LEVEL SECURITY;

-- Unified CRUD Policies (Admin + Public)
-- NOTE: In production, these should be scoped to auth.uid() or service_role.
DROP POLICY IF EXISTS "Admin CRUD Stalls" ON stalls;
CREATE POLICY "Admin CRUD Stalls" ON stalls FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin CRUD Announcements" ON announcements;
CREATE POLICY "Admin CRUD Announcements" ON announcements FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin CRUD Songs" ON song_requests;
CREATE POLICY "Admin CRUD Songs" ON song_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin CRUD Leaderboard" ON event_leaderboard;
CREATE POLICY "Admin CRUD Leaderboard" ON event_leaderboard FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin CRUD Registrations" ON app_registrations;
CREATE POLICY "Admin CRUD Registrations" ON app_registrations FOR ALL USING (true);

-- ==============================================================================
-- 7. REALTIME ENABLEMENT
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE stalls, announcements, song_requests, event_leaderboard, app_registrations;
EXCEPTION WHEN duplicate_object THEN
  NULL; 
END $$;
