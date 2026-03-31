-- ==============================================================================
-- DATABASE SECURITY HARDENING (LINTER FIXES)
-- Resolves: 0011_function_search_path_mutable & 0024_permissive_rls_policy
-- ==============================================================================

-- 1. FIX FUNCTION SEARCH PATHS (Security Best Practice)
-- Prevents search path hijacking by pinning to the public schema.
ALTER FUNCTION public.deduct_credits(UUID, INTEGER, TEXT) SET search_path = public;
ALTER FUNCTION public.refill_credits_if_needed(UUID) SET search_path = public;
ALTER FUNCTION public.give_demo_credits(UUID) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. HARDEN RLS POLICIES (Data Isolation)
-- Replacing 'USING (true)' with explicit project owner checks.

-- 2.1 STALLS
DROP POLICY IF EXISTS "Admin CRUD Stalls" ON public.stalls;
CREATE POLICY "Admin CRUD Stalls" ON public.stalls FOR ALL 
USING (
  (event_id::TEXT IN (SELECT id::TEXT FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.2 ANNOUNCEMENTS
DROP POLICY IF EXISTS "Admin CRUD Announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin Manage Announcements" ON public.announcements;
CREATE POLICY "Admin CRUD Announcements" ON public.announcements FOR ALL 
USING (
  (event_id::TEXT IN (SELECT id::TEXT FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.3 EVENT LEADERBOARD
DROP POLICY IF EXISTS "Admin CRUD Leaderboard" ON public.event_leaderboard;
CREATE POLICY "Admin CRUD Leaderboard" ON public.event_leaderboard FOR ALL 
USING (
  (event_id::TEXT IN (SELECT id::TEXT FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.4 APP REGISTRATIONS
DROP POLICY IF EXISTS "Admin CRUD Registrations" ON public.app_registrations;
CREATE POLICY "Admin CRUD Registrations" ON public.app_registrations FOR ALL 
USING (
  (app_name IN (SELECT name FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.5 SONG REQUESTS
DROP POLICY IF EXISTS "Admin CRUD Songs" ON public.song_requests;
DROP POLICY IF EXISTS "Admin Manage Songs" ON public.song_requests;
CREATE POLICY "Admin CRUD Songs" ON public.song_requests FOR ALL 
USING (
  (event_id::TEXT IN (SELECT id::TEXT FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.6 SPONSORS
DROP POLICY IF EXISTS "Admin Manage Sponsors" ON public.sponsors;
CREATE POLICY "Admin Manage Sponsors" ON public.sponsors FOR ALL 
USING (
  (event_id::TEXT IN (SELECT id::TEXT FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.7 REGISTRATIONS (Public Insert allowed, but view/delete restricted)
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.registrations;
DROP POLICY IF EXISTS "Public Insert Registrations" ON public.registrations;
CREATE POLICY "Public Insert Registrations" ON public.registrations FOR INSERT 
WITH CHECK (true); -- Keep public for event signups

DROP POLICY IF EXISTS "Project owners can view registrations" ON public.registrations;
CREATE POLICY "Project owners can view registrations" ON public.registrations FOR SELECT 
USING (
  (project_id::UUID IN (SELECT id::UUID FROM public.projects WHERE user_id = auth.uid()))
);

-- 2.8 BUILDER ANNOUNCEMENTS (Used for internal platform news)
DROP POLICY IF EXISTS "Staff CRUD Builder Announcements" ON public.builder_announcements;
CREATE POLICY "Staff CRUD Builder Announcements" ON public.builder_announcements FOR ALL 
USING (
  auth.email() IN ('dhruvstudy77@gmail.com') -- Replace with your actual admin emails or role check
);

-- ==============================================================================
-- END OF SECURITY HARDENING
-- ==============================================================================
