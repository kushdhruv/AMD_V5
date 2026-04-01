-- generation_chat_history.sql
-- Create table for storing AI chat history across all generators (Web, Video, Image, App, Text)

CREATE TABLE IF NOT EXISTS generation_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL, -- The ID of the Project, Video, Image, or App
    entity_type TEXT NOT NULL CHECK (entity_type IN ('website', 'video', 'image', 'app', 'text')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE generation_chat_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own generation's chat history"
    ON generation_chat_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own generation's chat history"
    ON generation_chat_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_gen_chat_entity ON generation_chat_history(entity_id, entity_type);
