import { supabase } from './client';

/**
 * LIKES & ENGAGEMENT
 */

export async function toggleLike(entityId, entityType) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login to like");

    // Check if already liked
    const { data: existing } = await supabase
        .from('engagement_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .maybeSingle();

    if (existing) {
        // Unlike
        return await supabase
            .from('engagement_likes')
            .delete()
            .eq('id', existing.id);
    } else {
        // Like
        return await supabase
            .from('engagement_likes')
            .insert({
                user_id: user.id,
                entity_id: entityId,
                entity_type: entityType
            });
    }
}

export async function fetchLikes(entityId, entityType) {
    const { count, error } = await supabase
        .from('engagement_likes')
        .select('*', { count: 'exact', head: true })
        .eq('entity_id', entityId)
        .eq('entity_type', entityType);
    
    return { count: count || 0, error };
}

export async function checkIfLiked(entityId, entityType) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('engagement_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .maybeSingle();
    
    return !!data;
}

/**
 * COMMENTS
 */

export async function addComment(entityId, entityType, content) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login to comment");

    return await supabase
        .from('engagement_comments')
        .insert({
            user_id: user.id,
            entity_id: entityId,
            entity_type: entityType,
            content
        })
        .select('*, profiles:user_id(full_name, avatar_url)');
}

export async function fetchComments(entityId, entityType) {
    return await supabase
        .from('engagement_comments')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false });
}

/**
 * CONNECTIONS & CHAT
 */

export async function sendConnectionRequest(receiverId, initialMessage = "") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login to connect");

    return await supabase
        .from('marketplace_connections')
        .insert({
            sender_id: user.id,
            receiver_id: receiverId,
            initial_message: initialMessage,
            status: 'pending'
        });
}

export async function fetchUserConnections(userId = null) {
    let finalUserId = userId;
    if (!finalUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        finalUserId = user.id;
    }

    return await supabase
        .from('marketplace_connections')
        .select(`
            *,
            sender:sender_id(id, full_name, avatar_url),
            receiver:receiver_id(id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${finalUserId},receiver_id.eq.${finalUserId}`);
}

export async function acceptConnection(connectionId) {
    return await supabase
        .from('marketplace_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);
}

export async function sendMessage(connectionId, content) {
    const { data: { user } } = await supabase.auth.getUser();
    return await supabase
        .from('marketplace_messages')
        .insert({
            connection_id: connectionId,
            sender_id: user.id,
            content
        });
}

export async function fetchMessages(connectionId) {
    return await supabase
        .from('marketplace_messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });
}

/**
 * GITHUB PROJECTS
 */

export async function fetchGitHubProjects(freelancerId) {
    return await supabase
        .from('freelancer_github_projects')
        .select('*')
        .eq('freelancer_id', freelancerId);
}
