-- ==============================================================================
-- DEFENSIVE ANNOUNCEMENTS SCHEMA UPDATE
-- Ensures table exists and has all required columns (event_id, body, etc.)
-- Handles existing tables that might be missing certain fields.
-- ==============================================================================

DO $$
BEGIN
    -- 1. Create table if missing (Base structure)
    CREATE TABLE IF NOT EXISTS public.announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        body TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
    );

    -- 2. Add event_id if missing (Identifier for specific apps)
    -- Using TEXT to match stalls/app_registrations in MASTER SCHEMA
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'event_id') THEN
        ALTER TABLE public.announcements ADD COLUMN event_id TEXT;
    END IF;

    -- 3. Add body if missing (Content field)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'body') THEN
        ALTER TABLE public.announcements ADD COLUMN body TEXT;
    END IF;

    -- 4. Handle 'message' column (Used in App Builder previously)
    -- If 'message' exists but 'body' is null, migrate the data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'message') THEN
        UPDATE public.announcements SET body = message WHERE body IS NULL;
        -- Optional: Drop message column later or keep for compatibility
    END IF;

    -- 5. Add other required fields if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'type') THEN
        ALTER TABLE public.announcements ADD COLUMN type TEXT DEFAULT 'info';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'is_pinned') THEN
        ALTER TABLE public.announcements ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'data') THEN
        ALTER TABLE public.announcements ADD COLUMN data JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'updated_at') THEN
        ALTER TABLE public.announcements ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
    END IF;

END $$;

-- 6. Re-apply Indexes, RLS and Realtime (Safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_announcements_event_id ON public.announcements(event_id);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin CRUD Announcements" ON public.announcements;
CREATE POLICY "Admin CRUD Announcements" ON public.announcements FOR ALL USING (true);

-- Enable Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
EXCEPTION WHEN duplicate_object THEN
  NULL; 
END $$;
