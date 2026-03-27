-- ============================================================
-- SPONSORSHIP MANAGEMENT SCHEMA
-- Adds support for tiered sponsors with status & scheduling.
-- ============================================================

-- Create Enum for Tiers
DO $$ BEGIN
    CREATE TYPE sponsor_tier AS ENUM ('Platinum', 'Gold', 'Silver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, -- No hard REFERENCES to avoid FK violations with legacy/demo data
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    tier sponsor_tier DEFAULT 'Silver',
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Policies (Defensive check against projects table)
DROP POLICY IF EXISTS "Sponsors visible to everyone" ON sponsors;
CREATE POLICY "Sponsors visible to everyone" ON sponsors
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Sponsors manageable by app owner" ON sponsors;
CREATE POLICY "Sponsors manageable by app owner" ON sponsors
    FOR ALL USING (
        -- Only check if record exists in projects, but don't force FK
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = sponsors.event_id 
            AND projects.user_id = auth.uid()
        )
        OR 
        -- Fallback for demo/legacy IDs not in projects table
        (NOT EXISTS (SELECT 1 FROM public.projects WHERE projects.id = sponsors.event_id))
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sponsors_event ON sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
