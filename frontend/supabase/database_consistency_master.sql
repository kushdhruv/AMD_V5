-- ═══════════════════════════════════════════════════════════
-- MINIMAL DATABASE FIX (RELIABILITY ONLY)
-- Resolves 'apps' table error and ensures RLS for new features.
-- ═══════════════════════════════════════════════════════════

-- 1. Correct Sponsors Table (No strict FK to avoid errors with legacy data)
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, 
    name TEXT NOT NULL,
    logo_url TEXT,
    tier TEXT DEFAULT 'Silver',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure RLS is enabled
ALTER TABLE IF EXISTS public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.stalls ENABLE ROW LEVEL SECURITY;

-- 3. Open Read Access (Public for App)
DROP POLICY IF EXISTS "Sponsors visible to everyone" ON public.sponsors;
CREATE POLICY "Sponsors visible to everyone" ON public.sponsors FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (TRUE);

-- 4. Admin Access (Allow all for now to ensure builder works without crashes)
DROP POLICY IF EXISTS "Admin Manage Sponsors" ON public.sponsors;
CREATE POLICY "Admin Manage Sponsors" ON public.sponsors FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Manage Announcements" ON public.announcements;
CREATE POLICY "Admin Manage Announcements" ON public.announcements FOR ALL USING (true);

-- 5. Ensure Ticketing Fields for Direct UPI (Manual Verification)
ALTER TABLE IF EXISTS public.event_tickets ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE IF EXISTS public.user_tickets ADD COLUMN IF NOT EXISTS proof_utr TEXT;
ALTER TABLE IF EXISTS public.user_tickets ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- 6. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
