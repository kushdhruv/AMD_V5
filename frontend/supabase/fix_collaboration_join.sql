-- Fix for collaboration_invites join issue
-- The front-end needs to join with profiles to get inviter name/email.
-- Reference public.profiles(id) instead of auth.users(id) to allow PostgREST to see the relationship.

-- 1. Drop existing constraint
ALTER TABLE IF EXISTS public.collaboration_invites 
DROP CONSTRAINT IF EXISTS collaboration_invites_inviter_id_fkey;

-- 2. Add new constraint to public.profiles
ALTER TABLE public.collaboration_invites
ADD CONSTRAINT collaboration_invites_inviter_id_fkey 
FOREIGN KEY (inviter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. Repeat for collaborators table just in case
ALTER TABLE IF EXISTS public.collaborators
DROP CONSTRAINT IF EXISTS collaborators_user_id_fkey;

ALTER TABLE public.collaborators
ADD CONSTRAINT collaborators_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
