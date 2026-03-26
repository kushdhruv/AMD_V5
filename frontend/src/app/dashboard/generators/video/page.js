"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Video, Play, Download, Trash2, Clock, Zap, 
  ExternalLink, Plus, Layout, Share2, Users 
} from 'lucide-react';
import { getCollaboratedItems } from '@/lib/supabase/collaboration';
import CollaborationModal from '@/components/collaboration/CollaborationModal';
import VisibilityToggle from '@/components/collaboration/VisibilityToggle';
import InvitationsSection from '@/components/collaboration/InvitationsSection';
import { supabase } from "@/lib/supabase/client";

const STYLE_LABELS = { realistic: "Cinematic", anime: "Anime", "3d": "3D Render" };

export default function VideoGeneratorLanding() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchVideos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch owned videos
      const { data: ownedData, error: ownedError } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('user_id', user.id);

      // 2. Fetch collaborated IDs
      const collabIds = await getCollaboratedItems('video');

      // 3. Fetch collaborated videos
      let collabData = [];
      if (collabIds.length > 0) {
        const { data } = await supabase
          .from('generated_videos')
          .select('*')
          .in('id', collabIds);
        collabData = data || [];
      }

      const merged = [
        ...(ownedData || []).map(v => ({ ...v, is_owner: true })),
        ...(collabData || []).map(v => ({ ...v, is_owner: false }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (ownedError) console.error("Error fetching videos:", ownedError);
      setVideos(merged);
      setLoading(false);
    }
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    // Optimistic UI update
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);

    // Delete from Supabase
    await supabase.from('generated_videos').delete().eq('id', id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/generators" className="p-2 hover:bg-neutral-800 rounded-full transition">
            <Layout size={20} className="text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Video className="text-primary" />
              Video Generator
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Create AI-generated videos from text prompts using AnimateDiff.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/generators/video/new"
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} />
          New Video
        </Link>
      </div>

      <InvitationsSection />

      {/* Video Content */}
      {loading ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your studio...</p>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div key={vid.id} className="glass-card group flex flex-col overflow-hidden border-white/5 hover:border-primary/30 transition-all">
              {/* Thumbnail Area */}
              <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                {vid.thumbnail_url ? (
                  <img src={vid.thumbnail_url} alt={vid.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
                    <Video className="text-neutral-700" size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={vid.url} target="_blank" className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <Play size={18} fill="currentColor" />
                  </a>
                  <a href={vid.url} download className="w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Download size={18} />
                  </a>
                </div>
                
                {/* Visibility Toggle Badge (Top Right) */}
                {vid.is_owner && (
                  <div className="absolute top-2 right-2">
                    <VisibilityToggle 
                        entityId={vid.id} 
                        entityType="video" 
                        initialIsPublic={vid.is_public} 
                    />
                  </div>
                )}
                
                {/* ID Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[8px] font-mono text-white/50 px-2 py-0.5 rounded border border-white/10 uppercase">
                  {vid.id.slice(0, 8)}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{vid.prompt}</h3>
                    {!vid.is_owner && (
                      <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/10 flex items-center gap-1 font-bold">
                        <Users size={8} /> SHARED
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-text-secondary mb-4">
                  <div className="flex items-center gap-1 text-[10px]">
                    <Clock size={10} />
                    {new Date(vid.created_at).toLocaleDateString()}
                  </div>
                  {vid.is_owner && (
                    <button 
                      onClick={() => setSelectedVideo(vid)}
                      className="flex items-center gap-1 text-[10px] hover:text-primary transition font-bold uppercase tracking-wider ml-auto"
                    >
                      <Share2 size={10} />
                      Invite
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                      <Zap size={10} className="text-yellow-400" />
                    </div>
                    <span className="text-[10px] text-text-secondary font-medium">8 Credits used</span>
                  </div>
                  {vid.is_owner && (
                    <button 
                        onClick={() => handleDelete(vid.id)}
                        className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="text-white/20" size={30} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No videos yet</h3>
          <p className="text-text-secondary text-sm max-w-xs mx-auto mb-6">Create your first cinematic event video and it will appear here.</p>
          <Link href="/dashboard/generators/video" className="btn-primary px-6 py-2 rounded-xl text-white inline-flex items-center gap-2">
            <Plus size={18} /> Create Video
          </Link>
        </div>
      )}

      {/* Collaboration Modal */}
      {selectedVideo && (
        <CollaborationModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          entityId={selectedVideo.id}
          entityType="video"
          entityName={selectedVideo.prompt.slice(0, 20) + '...'}
        />
      )}
    </div>
  );
}
