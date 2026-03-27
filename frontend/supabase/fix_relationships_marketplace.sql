-- Fix missing relationships for PostgREST joins
-- engagement_comments and engagement_likes currently reference auth.users
-- We need them to reference public.profiles to allow joining profiles in the frontend

-- 0. Ensure profiles table has expected fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update full_name from display_name if null
UPDATE public.profiles 
SET full_name = display_name 
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- 1. Fix engagement_comments
ALTER TABLE engagement_comments
DROP CONSTRAINT IF EXISTS engagement_comments_user_id_fkey;

ALTER TABLE engagement_comments
ADD CONSTRAINT engagement_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Fix engagement_likes
ALTER TABLE engagement_likes
DROP CONSTRAINT IF EXISTS engagement_likes_user_id_fkey;

ALTER TABLE engagement_likes
ADD CONSTRAINT engagement_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Fix marketplace_connections (sender_id and receiver_id)
ALTER TABLE marketplace_connections
DROP CONSTRAINT IF EXISTS marketplace_connections_sender_id_fkey,
DROP CONSTRAINT IF EXISTS marketplace_connections_receiver_id_fkey;

ALTER TABLE marketplace_connections
ADD CONSTRAINT marketplace_connections_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT marketplace_connections_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Fix marketplace_messages (sender_id)
ALTER TABLE marketplace_messages
DROP CONSTRAINT IF EXISTS marketplace_messages_sender_id_fkey;

ALTER TABLE marketplace_messages
ADD CONSTRAINT marketplace_messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. Fix projects (user_id)
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

ALTER TABLE projects
ADD CONSTRAINT projects_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. Fix generated_images (user_id)
ALTER TABLE generated_images
DROP CONSTRAINT IF EXISTS generated_images_user_id_fkey;

ALTER TABLE generated_images
ADD CONSTRAINT generated_images_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. Fix generated_videos (user_id)
ALTER TABLE generated_videos
DROP CONSTRAINT IF EXISTS generated_videos_user_id_fkey;

ALTER TABLE generated_videos
ADD CONSTRAINT generated_videos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. Fix app_builder_projects (user_id) if exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'app_builder_projects') THEN
        ALTER TABLE app_builder_projects DROP CONSTRAINT IF EXISTS app_builder_projects_user_id_fkey;
        ALTER TABLE app_builder_projects ADD CONSTRAINT app_builder_projects_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 9. Ensure profiles are selectable by anyone for marketplace profile views
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
