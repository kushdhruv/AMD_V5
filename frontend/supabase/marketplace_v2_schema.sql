-- Marketplace V2: Engagement, Reputation, and Communication

-- 1. Reputation Fields for Freelancers
ALTER TABLE freelancers 
ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_top_performer BOOLEAN DEFAULT FALSE;

-- 2. Likes Table
CREATE TABLE IF NOT EXISTS engagement_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- UUID of Project, Video, Image, or App
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'video', 'image', 'app', 'portfolio')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, entity_id, entity_type)
);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS engagement_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'video', 'image', 'app', 'portfolio')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Connections Table (Marketplace Networking)
CREATE TABLE IF NOT EXISTS marketplace_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    initial_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- 5. Messaging Table
CREATE TABLE IF NOT EXISTS marketplace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES marketplace_connections(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GitHub Projects Table
CREATE TABLE IF NOT EXISTS freelancer_github_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freelancer_id UUID REFERENCES freelancers(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    description TEXT,
    stars INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Row Level Security (RLS)
ALTER TABLE engagement_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_github_projects ENABLE ROW LEVEL SECURITY;

-- 7a. Likes Policies
CREATE POLICY "Anyone can view likes" ON engagement_likes 
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON engagement_likes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their likes" ON engagement_likes 
    FOR DELETE USING (auth.uid() = user_id);

-- 7b. Comments Policies
CREATE POLICY "Anyone can view comments" ON engagement_comments 
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON engagement_comments 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit/delete their own comments" ON engagement_comments 
    FOR ALL USING (auth.uid() = user_id);

-- 7c. Connections Policies
CREATE POLICY "Users can see their own connections" ON marketplace_connections 
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can initiate connections" ON marketplace_connections 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can update connection status" ON marketplace_connections 
    FOR UPDATE USING (auth.uid() = receiver_id);

-- 7d. Messages Policies
CREATE POLICY "Users can read messages in their connections" ON marketplace_messages 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM marketplace_connections 
            WHERE id = connection_id 
            AND (sender_id = auth.uid() OR receiver_id = auth.uid())
            AND status = 'accepted'
        )
    );
CREATE POLICY "Users can send messages to accepted connections" ON marketplace_messages 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketplace_connections 
            WHERE id = connection_id 
            AND (sender_id = auth.uid() OR receiver_id = auth.uid())
            AND status = 'accepted'
        )
    );

-- 7e. GitHub Projects Policies
CREATE POLICY "Anyone can view GitHub projects" ON freelancer_github_projects 
    FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage their GitHub projects" ON freelancer_github_projects 
    FOR ALL USING (
        freelancer_id IN (SELECT id FROM freelancers WHERE user_id = auth.uid())
    );
