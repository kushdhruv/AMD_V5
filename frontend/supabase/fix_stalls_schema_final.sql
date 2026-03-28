-- ==============================================================================
-- FINAL STALLS & ANNOUNCEMENTS SCHEMA SYNC
-- Ensures the live database matches the expected schema exactly.
-- ==============================================================================

DO $$
BEGIN
    -- 1. Ensure Stalls has event_id as TEXT and description column
    -- If event_id is UUID, cast to TEXT to match other tables if needed
    -- For now, just ensure columns exist.
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'description') THEN
        ALTER TABLE public.stalls ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'event_id') THEN
        ALTER TABLE public.stalls ADD COLUMN event_id TEXT NOT NULL DEFAULT 'default_app_id';
    ELSE
        -- Ensure type is TEXT so it matches the App UUID checks
        ALTER TABLE public.stalls ALTER COLUMN event_id TYPE TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'emoji') THEN
        ALTER TABLE public.stalls ADD COLUMN emoji TEXT DEFAULT '🏪';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'is_open') THEN
        ALTER TABLE public.stalls ADD COLUMN is_open BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'is_featured') THEN
        ALTER TABLE public.stalls ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'is_sponsored') THEN
        ALTER TABLE public.stalls ADD COLUMN is_sponsored BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'location') THEN
        ALTER TABLE public.stalls ADD COLUMN location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'contact') THEN
        ALTER TABLE public.stalls ADD COLUMN contact JSONB DEFAULT '{"phone": ""}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'menu') THEN
        ALTER TABLE public.stalls ADD COLUMN menu JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'price_range') THEN
        ALTER TABLE public.stalls ADD COLUMN price_range TEXT DEFAULT '₹';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'rating') THEN
        ALTER TABLE public.stalls ADD COLUMN rating NUMERIC DEFAULT 4.5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stalls' AND column_name = 'review_count') THEN
        ALTER TABLE public.stalls ADD COLUMN review_count INTEGER DEFAULT 0;
    END IF;

    -- 2. Ensure Announcements has correct fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'type') THEN
        ALTER TABLE public.announcements ADD COLUMN type TEXT DEFAULT 'update';
    END IF;

END $$;

-- 3. Reset RLS Policies to be fully open for this project (Developer mode)
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Stalls" ON stalls;
CREATE POLICY "Public Read Stalls" ON stalls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Stalls" ON stalls;
CREATE POLICY "Admin CRUD Stalls" ON stalls FOR ALL USING (true);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Announcements" ON announcements;
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Announcements" ON announcements;
CREATE POLICY "Admin CRUD Announcements" ON announcements FOR ALL USING (true);

-- 4. Reload PostgREST Cache (If possible in this environment)
NOTIFY pgrst, 'reload schema';
