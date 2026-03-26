-- generated_phrases.sql
-- Create table for storing AI generated phrases/captions

CREATE TABLE IF NOT EXISTS generated_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    tone TEXT,
    platform TEXT,
    phrases JSONB NOT NULL, -- Store array of phrases
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE generated_phrases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own phrases" ON generated_phrases 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phrases" ON generated_phrases 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public phrases" ON generated_phrases 
    FOR SELECT USING (is_public = TRUE);
