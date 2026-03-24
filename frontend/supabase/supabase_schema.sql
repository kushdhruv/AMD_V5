-- ==============================================================================
-- SUPABASE SCHEMA FOR EVENT APP
-- Run this in your Supabase SQL Editor to set up the backend data plane.
-- ==============================================================================

-- 1. STALLS
CREATE TABLE IF NOT EXISTS stalls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL, -- Ties the stall to a specific generated app
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  rating NUMERIC(3, 1) DEFAULT 0.0,
  tags TEXT[],
  price_range TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_sponsored BOOLEAN DEFAULT false,
  emoji TEXT,
  location TEXT,
  timings TEXT,
  contact JSONB, -- { phone, whatsapp, upi }
  menu JSONB,    -- Array of items [{ name, price, desc, emoji }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MENU ITEMS (Linked to Stalls)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stall_id UUID REFERENCES stalls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  is_veg BOOLEAN DEFAULT TRUE,
  emoji TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SONGS (Song Queue Module)
CREATE TABLE IF NOT EXISTS songs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT 'Unknown Artist',
  requested_by TEXT DEFAULT 'Guest',
  votes INTEGER DEFAULT 1,
  status TEXT DEFAULT 'queued', -- 'queued', 'playing', 'played'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. LEADERBOARD
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  college TEXT,
  members INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 1000,
  track TEXT DEFAULT 'General',
  badge TEXT,
  trend TEXT DEFAULT 'same', -- 'up', 'down', 'same'
  trend_val INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'Update', -- 'Alert', 'Event', 'Result', 'Update'
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. SECURITY (RLS)
-- ==============================================================================
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access for everything
DROP POLICY IF EXISTS "Public Read Stalls" ON stalls;
CREATE POLICY "Public Read Stalls" ON stalls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Menu" ON menu_items;
CREATE POLICY "Public Read Menu" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Songs" ON songs;
CREATE POLICY "Public Read Songs" ON songs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Leaderboard" ON leaderboard;
CREATE POLICY "Public Read Leaderboard" ON leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Announcements" ON announcements;
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);

-- Authenticated Insert for Songs (Guest Requests)
DROP POLICY IF EXISTS "Auth Insert Songs" ON songs;
CREATE POLICY "Auth Insert Songs" ON songs FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 7. REALTIME
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE songs, leaderboard, announcements;
EXCEPTION WHEN duplicate_object THEN
  NULL; 
END $$;
