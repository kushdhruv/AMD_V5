-- ============================================================
-- TICKETING & ATTENDEE MANAGEMENT SCHEMA (UPDATED)
-- Adds support for event tickets, user ticket purchases, and Direct UPI.
-- ============================================================

-- 1. Create Event Tickets Table
CREATE TABLE IF NOT EXISTS event_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL, -- Logical link to projects.id
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    upi_id TEXT, -- Added for Direct UPI
    total_quantity INTEGER DEFAULT NULL,
    sold_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for Event Tickets
DROP POLICY IF EXISTS "Tickets visible to everyone" ON event_tickets;
CREATE POLICY "Tickets visible to everyone" ON event_tickets
    FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Tickets manageable by app owner" ON event_tickets;
CREATE POLICY "Tickets manageable by app owner" ON event_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = event_tickets.event_id 
            AND projects.user_id = auth.uid()
        )
        OR 
        (NOT EXISTS (SELECT 1 FROM public.projects WHERE projects.id = event_tickets.event_id))
    );

-- 2. Create User Tickets (Purchased) Table
CREATE TABLE IF NOT EXISTS user_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users or user email mapping
    user_email TEXT,       -- Soft link to attendee email
    event_id UUID NOT NULL,
    ticket_id UUID REFERENCES event_tickets(id) ON DELETE RESTRICT,
    payment_id TEXT,       -- Razorpay payment ID (optional)
    status TEXT DEFAULT 'pending', -- pending, successful, failed
    qr_code TEXT,
    proof_utr TEXT,        -- Added for Direct UPI Verification
    proof_image_url TEXT,  -- Added for Direct UPI Verification
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for User Tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON user_tickets;
CREATE POLICY "Users can view their own tickets" ON user_tickets
    FOR SELECT USING (auth.uid() = user_id OR user_email = auth.email());

DROP POLICY IF EXISTS "Users can insert their own tickets" ON user_tickets;
CREATE POLICY "Users can insert their own tickets" ON user_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_email = auth.email());

DROP POLICY IF EXISTS "App owners can view event tickets" ON user_tickets;
CREATE POLICY "App owners can view event tickets" ON user_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = user_tickets.event_id 
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "App owners can update event tickets" ON user_tickets;
CREATE POLICY "App owners can update event tickets" ON user_tickets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = user_tickets.event_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_event ON user_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_user ON user_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_email ON user_tickets(user_email);

-- Enable Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE event_tickets;
  ALTER PUBLICATION supabase_realtime ADD TABLE user_tickets;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
