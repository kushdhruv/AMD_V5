-- ═══════════════════════════════════════════════════════════
-- Marketplace Schema — Freelancer Profiles + Portfolios
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Freelancer Profiles ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.freelancers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    bio TEXT DEFAULT '',
    skills TEXT DEFAULT '',              -- Comma-separated: "React, Python, ML"
    profile_picture_url TEXT DEFAULT '',
    availability TEXT DEFAULT 'actively_looking',  -- actively_looking | taking_break
    contact_email TEXT DEFAULT '',
    contact_phone TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    portfolio_url TEXT DEFAULT '',
    hourly_rate TEXT DEFAULT '',          -- e.g. "$50-80/hr"
    location TEXT DEFAULT '',            -- e.g. "San Francisco, CA"
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one freelancer profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_freelancers_user_id ON public.freelancers(user_id);

-- ─── Portfolio Items (up to 4 per freelancer) ──────────────
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID REFERENCES public.freelancers(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    link TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    tech_stack TEXT DEFAULT '',           -- Comma-separated: "React, Node.js, PostgreSQL"
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_freelancer_id ON public.portfolios(freelancer_id);

-- ─── RLS Policies ──────────────────────────────────────────
ALTER TABLE public.freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Anyone can read (marketplace is public)
CREATE POLICY "Freelancers are publicly readable"
    ON public.freelancers FOR SELECT
    USING (true);

CREATE POLICY "Portfolios are publicly readable"
    ON public.portfolios FOR SELECT
    USING (true);

-- Only the owner can insert/update/delete their own profile
CREATE POLICY "Users can insert own freelancer profile"
    ON public.freelancers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own freelancer profile"
    ON public.freelancers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own freelancer profile"
    ON public.freelancers FOR DELETE
    USING (auth.uid() = user_id);

-- Only the freelancer owner can manage their portfolios
CREATE POLICY "Users can insert own portfolios"
    ON public.portfolios FOR INSERT
    WITH CHECK (
        freelancer_id IN (
            SELECT id FROM public.freelancers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own portfolios"
    ON public.portfolios FOR UPDATE
    USING (
        freelancer_id IN (
            SELECT id FROM public.freelancers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own portfolios"
    ON public.portfolios FOR DELETE
    USING (
        freelancer_id IN (
            SELECT id FROM public.freelancers WHERE user_id = auth.uid()
        )
    );
