
-- Add Stripe fields to profiles
ALTER TABLE profiles 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive', -- 'active', 'past_due', 'canceled'
ADD COLUMN subscription_id TEXT;
