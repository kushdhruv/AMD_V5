-- ==============================================================================
-- SUPABASE SCHEMA FOR EVENT APP
-- Run this in your Supabase SQL Editor to set up the backend data plane.
-- ==============================================================================

-- 1. STALLS
CREATE TABLE stalls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL, -- Ties the stall to a specific generated app
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Food',
  rating NUMERIC(3, 1) DEFAULT 0.0,
  tags TEXT[] DEFAULT '{}',
  price_range TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MENU ITEMS (Linked to Stalls)
CREATE TABLE menu_items (
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
CREATE TABLE songs (
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
CREATE TABLE leaderboard (
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
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'Update', -- 'Alert', 'Event', 'Result', 'Update'
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: In production, you would add Row Level Security (RLS) policies here
-- allowing public READ access and authenticated ADMIN write access.
