"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { addComment, fetchComments } from '@/lib/supabase/marketplace-v2';

export default function CommentSection({ entityId, entityType }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            // Mock comments for demo/demo projects
            if (entityId && (entityId.toString().startsWith('demo-') || entityId.toString().startsWith('ai-') || entityId.toString().startsWith('dp-') || entityId.toString().startsWith('gh-'))) {
                const mockData = [
                    {
                        id: 'm-1',
                        content: "This looks absolutely stunning! Love the color palette.",
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        profiles: { full_name: "Sarah J.", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" }
                    },
                    {
                        id: 'm-2',
                        content: "Incredible work. The performance is top-notch too.",
                        created_at: new Date(Date.now() - 172800000).toISOString(),
                        profiles: { full_name: "Mike Ray", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" }
                    }
                ];
                setComments(mockData);
                return;
            }

            const { data, error } = await fetchComments(entityId, entityType);
            if (!error) setComments(data || []);
        }
        load();
    }, [entityId, entityType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const { data, error } = await addComment(entityId, entityType, newComment);
            if (error) throw error;
            setComments(prev => [data[0], ...prev]);
            setNewComment("");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={12} /> Comments
            </h4>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-primary"
                />
                <button 
                    type="submit" 
                    disabled={loading || !newComment.trim()}
                    className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition disabled:opacity-50"
                >
                    <Send size={14} />
                </button>
            </form>

            {/* List */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-[10px] text-neutral-600 italic">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User size={12} className="text-neutral-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-white">{comment.profiles?.full_name || "Anonymous"}</span>
                                    <span className="text-[8px] text-neutral-600 underline font-semibold">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[10px] text-neutral-400 leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
