
-- Add Stripe fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive', -- 'active', 'past_due', 'canceled'
ADD COLUMN IF NOT EXISTS subscription_id TEXT;
