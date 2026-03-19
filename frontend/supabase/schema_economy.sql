
-- 1. Add Economy Fields to Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free', -- 'free', 'creator', 'pro'
ADD COLUMN IF NOT EXISTS billing_cycle_start TIMESTAMPTZ DEFAULT NOW();

-- 2. Create Ledger for Credit History
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL, -- Negative for spend, Positive for buy/refill
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies (Security)
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
ON credit_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- 4. RPC Function to Deduct Credits
CREATE OR REPLACE FUNCTION deduct_credits(p_user_id UUID, p_amount INTEGER, p_desc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits FROM profiles WHERE id = p_user_id;
  
  -- Check sufficient funds
  IF current_credits >= p_amount THEN
    -- Deduct from profile
    UPDATE profiles SET credits = credits - p_amount WHERE id = p_user_id;
    
    -- Log transaction
    INSERT INTO credit_transactions (user_id, amount, description)
    VALUES (p_user_id, -p_amount, p_desc);
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


-- 5. RPC Function to Refill Credits (Monthly)
CREATE OR REPLACE FUNCTION refill_credits_if_needed(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan TEXT;
  v_cycle_start TIMESTAMPTZ;
  v_refill_amount INTEGER;
BEGIN
  SELECT plan_tier, billing_cycle_start INTO v_plan, v_cycle_start 
  FROM profiles WHERE id = p_user_id;
  
  -- Check if 30 days passed
  IF v_cycle_start < NOW() - INTERVAL '30 days' THEN
    -- Determine amount
    IF v_plan = 'creator' THEN v_refill_amount := 1000;
    ELSIF v_plan = 'pro' THEN v_refill_amount := 5000;
    ELSE v_refill_amount := 100; -- free
    END IF;
    
    -- Update credits & cycle
    UPDATE profiles 
    SET credits = v_refill_amount, billing_cycle_start = NOW()
    WHERE id = p_user_id;
    
    -- Log
    INSERT INTO credit_transactions (user_id, amount, description)
    VALUES (p_user_id, v_refill_amount, 'Monthly Plan Refill');
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;


-- 6. Demo Credit Function
CREATE OR REPLACE FUNCTION give_demo_credits(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user credits
  UPDATE profiles 
  SET credits = credits + 1000
  WHERE id = p_user_id;
  
  -- Log Transaction
  INSERT INTO credit_transactions (user_id, amount, description)
  VALUES (p_user_id, 1000, 'Demo Credits Grant');

  RETURN TRUE;
END;
$$;

-- 7. Registrations Table for Generated Apps
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  app_name TEXT,
  data JSONB
);

-- Allow public access for now (since apps are distributed APKs without user auth)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for all users" ON public.registrations FOR SELECT USING (true);
