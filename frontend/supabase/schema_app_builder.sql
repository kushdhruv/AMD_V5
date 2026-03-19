-- 1. Create registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  app_name TEXT,
  data JSONB
);

-- 2. Add columns if table exists but columns missing
DO $$
BEGIN
    -- Check app_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'app_name') THEN
        ALTER TABLE registrations ADD COLUMN app_name TEXT;
    END IF;

    -- Check data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'data') THEN
        ALTER TABLE registrations ADD COLUMN data JSONB;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Public Insert" ON registrations;
DROP POLICY IF EXISTS "Public Select" ON registrations;

-- Allow anyone (anon) to insert data (User App Submission)
CREATE POLICY "Public Insert" 
ON registrations FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read (Admin Dashboard)
CREATE POLICY "Public Select" 
ON registrations FOR SELECT 
USING (true);

-- 5. Enable Realtime (Ignore error if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already added
END $$;

-- 6. EMERGENCY FIX: Make project_id optional
-- The table has a NOT NULL constraint on 'project_id', but App Builder doesn't use it.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'project_id') THEN
        ALTER TABLE registrations ALTER COLUMN project_id DROP NOT NULL;
    END IF;
END $$;


-- 7. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  app_name TEXT,
  title TEXT,
  message TEXT,
  data JSONB
);

-- RLS & Policies
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Insert Announcements" ON announcements;
DROP POLICY IF EXISTS "Public Select Announcements" ON announcements;

CREATE POLICY "Public Insert Announcements" ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Select Announcements" ON announcements FOR SELECT USING (true);

-- Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
EXCEPTION WHEN duplicate_object THEN
  NULL; 
END $$;
