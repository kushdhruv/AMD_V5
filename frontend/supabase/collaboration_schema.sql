-- Collaboration & Privacy Schema
-- Run this in your Supabase SQL Editor

-- 1. Create App Builder Projects table (migrated from localStorage)
CREATE TABLE IF NOT EXISTS public.app_builder_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Add is_public column to existing tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_public') THEN
        ALTER TABLE projects ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_images' AND column_name = 'is_public') THEN
        ALTER TABLE generated_images ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_videos' AND column_name = 'is_public') THEN
        ALTER TABLE generated_videos ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Create Collaboration Invites table
CREATE TABLE IF NOT EXISTS public.collaboration_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL, -- 'project', 'video', 'image', 'app'
    status TEXT DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Create Collaborators table
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    role TEXT DEFAULT 'editor', -- editor, viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(user_id, entity_id, entity_type)
);

-- 5. Enable RLS
ALTER TABLE public.app_builder_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for app_builder_projects
DROP POLICY IF EXISTS "Users can manage own app projects" ON public.app_builder_projects;
CREATE POLICY "Users can manage own app projects"
    ON public.app_builder_projects FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared app projects"
    ON public.app_builder_projects FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collaborators 
        WHERE entity_id = id AND entity_type = 'app' AND user_id = auth.uid()
    ));

CREATE POLICY "Public can view public app projects"
    ON public.app_builder_projects FOR SELECT
    USING (is_public = true);

-- 7. Update RLS for projects (Websites)
DROP POLICY IF EXISTS "Collaborators can view shared projects" ON projects;
CREATE POLICY "Collaborators can view shared projects"
    ON projects FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collaborators 
        WHERE entity_id = id AND entity_type = 'project' AND user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Public can view public projects" ON projects;
CREATE POLICY "Public can view public projects"
    ON projects FOR SELECT
    USING (is_public = true);

-- 8. Update RLS for generated_images
DROP POLICY IF EXISTS "Collaborators can view shared images" ON generated_images;
CREATE POLICY "Collaborators can view shared images"
    ON generated_images FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collaborators 
        WHERE entity_id = id AND entity_type = 'image' AND user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Public can view public images" ON generated_images;
CREATE POLICY "Public can view public images"
    ON generated_images FOR SELECT
    USING (is_public = true);

-- 9. Update RLS for generated_videos
DROP POLICY IF EXISTS "Collaborators can view shared videos" ON generated_videos;
CREATE POLICY "Collaborators can view shared videos"
    ON generated_videos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collaborators 
        WHERE entity_id = id AND entity_type = 'video' AND user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Public can view public videos" ON generated_videos;
CREATE POLICY "Public can view public videos"
    ON generated_videos FOR SELECT
    USING (is_public = true);

-- 10. RLS for Collaboration Invites
CREATE POLICY "Users can view invites for them"
    ON public.collaboration_invites FOR SELECT
    USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create invites"
    ON public.collaboration_invites FOR INSERT
    WITH CHECK (auth.uid() = inviter_id);

-- 11. RLS for Collaborators
CREATE POLICY "Users can view their own collaborations"
    ON public.collaborators FOR SELECT
    USING (auth.uid() = user_id);
