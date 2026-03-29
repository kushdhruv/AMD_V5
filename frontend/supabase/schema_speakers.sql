-- ============================================================
-- SPEAKERS MANAGEMENT SCHEMA
-- Adds support for event speakers.
-- ============================================================

-- Create Speakers Table
CREATE TABLE IF NOT EXISTS speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, -- Logical link to projects.id
    name TEXT NOT NULL,
    title TEXT,
    bio TEXT,
    logo_url TEXT, -- Aliased for image_url
    website_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We use logical links to event_id without hard FKs to avoid issues with legacy/demo data.

-- Enable RLS
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Speakers visible to everyone" ON speakers;
CREATE POLICY "Speakers visible to everyone" ON speakers
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Speakers manageable by app owner" ON speakers;
CREATE POLICY "Speakers manageable by app owner" ON speakers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = speakers.event_id 
            AND projects.user_id = auth.uid()
        )
        OR 
        (NOT EXISTS (SELECT 1 FROM public.projects WHERE projects.id = speakers.event_id))
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_speakers_event ON speakers(event_id);

-- Enable Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE speakers;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
