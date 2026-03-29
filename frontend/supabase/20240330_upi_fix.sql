-- ============================================================
-- MIGRATION: ADD DIRECT UPI FIELDS (Mar 30)
-- This script ensures all tables have required columns for 
-- Manual UPI Verification.
-- ============================================================

-- 1. Add UPI ID to event_tickets (Admin's Receiving ID)
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- 2. Add Verification fields to user_tickets
ALTER TABLE public.user_tickets ADD COLUMN IF NOT EXISTS proof_utr TEXT;
ALTER TABLE public.user_tickets ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

-- 3. Ensure RLS allows the app to insert these fields
-- (Already handled by generic policies, but adding reload for cache)
NOTIFY pgrst, 'reload schema';
