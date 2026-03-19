-- ==========================================
-- Generated Media Schema (Images & Videos)
-- ==========================================

-- 1. Generated Images Table
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_url TEXT,
    category TEXT,
    style TEXT,
    aspect_ratio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS for Images
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated images"
    ON public.generated_images FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated images"
    ON public.generated_images FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images"
    ON public.generated_images FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated images"
    ON public.generated_images FOR UPDATE
    USING (auth.uid() = user_id);


-- 2. Generated Videos Table
CREATE TABLE IF NOT EXISTS public.generated_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    video_url TEXT,
    duration INTEGER,
    style TEXT,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    task_id TEXT, -- The external FastAPI task ID
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS for Videos
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generated videos"
    ON public.generated_videos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated videos"
    ON public.generated_videos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated videos"
    ON public.generated_videos FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated videos"
    ON public.generated_videos FOR UPDATE
    USING (auth.uid() = user_id);
