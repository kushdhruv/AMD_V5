import { supabase } from './supabase-client';

/**
 * Fetches chat history for any generation entity (website, video, image, app, text)
 */
export const fetchGenChatHistory = async (entityId, entityType) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Unauthenticated' };

    return await supabase
        .from('generation_chat_history')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
};

/**
 * Adds a chat message for any generation entity
 */
export const addGenChatMessage = async (entityId, entityType, role, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Unauthenticated' };

    return await supabase
        .from('generation_chat_history')
        .insert([{
            entity_id: entityId,
            entity_type: entityType,
            user_id: user.id,
            role,
            content
        }])
        .select();
};

/**
 * Syncs localStorage chat to Supabase for the specified entity
 */
export const syncGenChat = async (entityId, entityType, storageKey) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
        const messages = JSON.parse(saved);
        if (messages.length > 0) {
            // Check if DB is empty for this entity
            const { count } = await supabase
                .from('generation_chat_history')
                .select('*', { count: 'exact', head: true })
                .eq('entity_id', entityId)
                .eq('entity_type', entityType)
                .eq('user_id', user.id);

            if (count === 0) {
                // Bulk insert
                const toInsert = messages.map(m => ({
                    entity_id: entityId,
                    entity_type: entityType,
                    user_id: user.id,
                    role: m.role,
                    content: m.content
                }));
                const { error } = await supabase.from('generation_chat_history').insert(toInsert);
                if (!error) localStorage.removeItem(storageKey);
            }
        }
    } catch (e) {
        console.error("Migration failed for " + entityType, e);
    }
};
