import { supabase } from './client';

export const fetchWebsiteChatHistory = async (projectId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: 'Unauthenticated' };

    return await supabase
        .from('website_chat_history')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
};

export const addWebsiteChatMessage = async (projectId, role, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Unauthenticated' };

    return await supabase
        .from('website_chat_history')
        .insert([{
            project_id: projectId,
            user_id: user.id,
            role,
            content
        }])
        .select();
};

export const syncLocalStorageChat = async (projectId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const saved = localStorage.getItem(`wb_chat_${projectId}`);
    if (!saved) return;

    try {
        const messages = JSON.parse(saved);
        if (messages.length > 0) {
            // Check if DB is empty for this project
            const { count } = await supabase
                .from('website_chat_history')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId)
                .eq('user_id', user.id);

            if (count === 0) {
                // Bulk insert
                const toInsert = messages.map(m => ({
                    project_id: projectId,
                    user_id: user.id,
                    role: m.role,
                    content: m.content
                }));
                const { error } = await supabase.from('website_chat_history').insert(toInsert);
                if (!error) localStorage.removeItem(`wb_chat_${projectId}`);
            }
        }
    } catch (e) {
        console.error("Migration failed", e);
    }
};
