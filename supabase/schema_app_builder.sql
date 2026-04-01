-- 1. Create app_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  app_name TEXT,
  data JSONB
);

-- 2. Add columns if table exists but columns missing
DO $$
BEGIN
    -- Check app_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_registrations' AND column_name = 'app_name') THEN
        ALTER TABLE app_registrations ADD COLUMN app_name TEXT;
    END IF;

    -- Check data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_registrations' AND column_name = 'data') THEN
        ALTER TABLE app_registrations ADD COLUMN data JSONB;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE app_registrations ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Public Insert" ON app_registrations;
DROP POLICY IF EXISTS "Public Select" ON app_registrations;

-- Allow anyone (anon) to insert data (User App Submission)
CREATE POLICY "Public Insert" 
ON app_registrations FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read (Admin Dashboard)
CREATE POLICY "Public Select" 
ON app_registrations FOR SELECT 
USING (true);

-- 5. Enable Realtime (Ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE app_registrations;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already added
END $$;

-- 6. EMERGENCY FIX: Make project_id optional
-- The table has a NOT NULL constraint on 'project_id', but App Builder doesn't use it.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_registrations' AND column_name = 'project_id') THEN
        ALTER TABLE app_registrations ALTER COLUMN project_id DROP NOT NULL;
    END IF;
END $$;


-- 7. Builder Announcements Table (Internal Dashboard Updates)
CREATE TABLE IF NOT EXISTS builder_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  app_name TEXT,
  title TEXT,
  message TEXT,
  data JSONB
);

-- RLS & Policies
ALTER TABLE builder_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Insert Announcements" ON builder_announcements;
DROP POLICY IF EXISTS "Public Select Announcements" ON builder_announcements;

CREATE POLICY "Public Insert Announcements" ON builder_announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Select Announcements" ON builder_announcements FOR SELECT USING (true);

-- Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE builder_announcements;
EXCEPTION WHEN duplicate_object THEN
  NULL; 
END $$;
