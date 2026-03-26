"use client";

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { toggleLike, fetchLikes, checkIfLiked } from '@/lib/supabase/marketplace-v2';

export default function LikeButton({ entityId, entityType, initialCount = 0 }) {
    const [likes, setLikes] = useState(initialCount);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            const { count } = await fetchLikes(entityId, entityType);
            setLikes(count || 0);
            const liked = await checkIfLiked(entityId, entityType);
            setIsLiked(liked);
        }
        load();
    }, [entityId, entityType]);

    const handleLike = async () => {
        setLoading(true);
        try {
            await toggleLike(entityId, entityType);
            setIsLiked(!isLiked);
            setLikes(prev => isLiked ? prev - 1 : prev + 1);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1.5 transition-all ${isLiked ? 'text-pink-500 scale-110' : 'text-neutral-500 hover:text-pink-400'}`}
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
            )}
            <span className="text-[10px] font-bold">{likes}</span>
        </button>
    );
}
