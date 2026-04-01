-- Final fix for Collaboration Permissions (Idempotent Version)
-- 1. Fix collaboration_invites RLS to avoid querying auth.users table
DROP POLICY IF EXISTS "Users can view invites for them" ON public.collaboration_invites;
CREATE POLICY "Users can view invites for them"
    ON public.collaboration_invites FOR SELECT
    USING (invitee_email = (auth.jwt() ->> 'email'));

-- 2. Relax profiles RLS so users can see who invited them
-- We allow everyone to see basic profile info (email, display_name) 
-- This is required for the join in InvitationsSection to work.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING ( true );

-- 3. Ensure foreign keys point to profiles for PostgREST joining
ALTER TABLE IF EXISTS public.collaboration_invites 
DROP CONSTRAINT IF EXISTS collaboration_invites_inviter_id_fkey;

ALTER TABLE public.collaboration_invites
ADD CONSTRAINT collaboration_invites_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Reload PostgREST cache
NOTIFY pgrst, 'reload schema';
