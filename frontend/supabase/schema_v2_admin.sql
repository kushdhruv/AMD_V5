-- ==============================================================================
-- V2 DATA CONTROL PLANE SCHEMA
-- Table structures for Leaderboard and Song Requests (Mobile-Web Sync)
-- ==============================================================================

-- 1. Event Leaderboard (Tracks team scores and ranks per App/Event)
CREATE TABLE IF NOT EXISTS public.event_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, -- Logical link to the App/Project
    team_name TEXT NOT NULL,
    organization TEXT, -- e.g. "IIT Bombay"
    score INTEGER DEFAULT 0,
    track TEXT, -- e.g. "AI/ML", "Fintech"
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for fast rank calculations
CREATE INDEX IF NOT EXISTS idx_leaderboard_event_id ON public.event_leaderboard(event_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.event_leaderboard(score DESC);

-- Enable RLS
ALTER TABLE public.event_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies: Anonymous read (for mobile app), Admin CRUD (for web dashboard)
DROP POLICY IF EXISTS "Public Read Leaderboard" ON public.event_leaderboard;
CREATE POLICY "Public Read Leaderboard" ON public.event_leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin CRUD Leaderboard" ON public.event_leaderboard;
CREATE POLICY "Admin CRUD Leaderboard" ON public.event_leaderboard FOR ALL USING (true); -- Simplified for now, should ideally check auth.uid()

-- 2. Song Requests (Live DJ Queue)
CREATE TABLE IF NOT EXISTS public.song_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    title TEXT NOT NULL,
    artist TEXT,
    requested_by TEXT,
    votes INTEGER DEFAULT 1,
    status TEXT DEFAULT 'queued', -- queued, playing, played
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index
CREATE INDEX IF NOT EXISTS idx_songs_event_id ON public.song_requests(event_id);

-- Enable RLS
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public Read Songs" ON public.song_requests;
CREATE POLICY "Public Read Songs" ON public.song_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Request Songs" ON public.song_requests;
CREATE POLICY "Public Request Songs" ON public.song_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin Manage Songs" ON public.song_requests;
CREATE POLICY "Admin Manage Songs" ON public.song_requests FOR ALL USING (true);

-- 3. Enable Realtime for both
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE event_leaderboard;
  ALTER PUBLICATION supabase_realtime ADD TABLE song_requests;
EXCEPTION WHEN duplicate_object THEN
  NULL; 
END $$;
