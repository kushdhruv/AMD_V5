"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Trash2, Clock, Zap, ExternalLink, Plus, Image as ImageIcon, Layout, Share2, Users } from "lucide-react";
import { getCollaboratedItems } from '@/lib/supabase/collaboration';
import CollaborationModal from '@/components/collaboration/CollaborationModal';
import VisibilityToggle from '@/components/collaboration/VisibilityToggle';
import InvitationsSection from '@/components/collaboration/InvitationsSection';
import { supabase } from "@/lib/supabase/client";

export default function ImageGeneratorLanding() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch owned images
      const { data: ownedData, error: ownedError } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id);

      // 2. Fetch collaborated IDs
      const collabIds = await getCollaboratedItems('image');

      // 3. Fetch collaborated images
      let collabData = [];
      if (collabIds.length > 0) {
        const { data } = await supabase
          .from('generated_images')
          .select('*')
          .in('id', collabIds);
        collabData = data || [];
      }

      const merged = [
        ...(ownedData || []).map(img => ({ ...img, is_owner: true })),
        ...(collabData || []).map(img => ({ ...img, is_owner: false }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (ownedError) console.error("Error fetching images:", ownedError);
      setImages(merged);
      setLoading(false);
    }
    fetchImages();
  }, []);

  const handleDelete = async (id) => {
    // Optimistic UI update
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);

    // Delete from Supabase
    await supabase.from('generated_images').delete().eq('id', id);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/generators" className="p-2 hover:bg-neutral-800 rounded-full transition">
            <Users size={20} className="text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="text-primary" />
              Image Studio
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Generate posters, banners, and social assets.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/generators/image/new"
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} />
          New Image
        </Link>
      </div>

      <InvitationsSection />

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your gallery...</p>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="glass-card group flex flex-col overflow-hidden border-white/5 hover:border-primary/30 transition-all">
              {/* Image Preview */}
              <div className="aspect-[3/4] bg-neutral-900 relative overflow-hidden">
                <img src={img.image_url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={img.image_url} target="_blank" className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <ExternalLink size={18} />
                  </a>
                  <a href={img.image_url} download className="w-10 h-10 rounded-full bg-white/10 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Download size={18} />
                  </a>
                </div>

                {/* Visibility Toggle Badge (Top Right) */}
                {img.is_owner && (
                  <div className="absolute top-2 right-2">
                    <VisibilityToggle 
                        entityId={img.id} 
                        entityType="image" 
                        initialIsPublic={img.is_public} 
                    />
                  </div>
                )}

                {/* ID Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[8px] font-mono text-white/50 px-2 py-0.5 rounded border border-white/10 uppercase">
                  {img.id.slice(0, 8)}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-xs font-bold text-white line-clamp-2 leading-relaxed flex-1">{img.prompt}</h3>
                    {!img.is_owner && (
                      <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/10 flex items-center gap-1 font-bold">
                        <Users size={8} /> SHARED
                      </span>
                    )}
                </div>
                
                <div className="flex items-center gap-3 text-neutral-500 mb-4 mt-auto">
                  <div className="flex items-center gap-1 text-[10px]">
                    <Clock size={10} />
                    {new Date(img.created_at).toLocaleDateString()}
                  </div>
                  {img.is_owner && (
                    <button 
                      onClick={() => setSelectedImage(img)}
                      className="flex items-center gap-1 text-[10px] hover:text-primary transition font-bold uppercase tracking-wider ml-auto"
                    >
                      <Share2 size={10} />
                      Invite
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                      <Zap size={8} className="text-yellow-400" />
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-tight">1 Credit</span>
                  </div>
                  {img.is_owner && (
                    <button 
                        onClick={() => handleDelete(img.id)}
                        className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="text-white/20" size={30} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No posters yet</h3>
          <p className="text-neutral-500 text-sm max-w-xs mx-auto mb-6">Your stunning AI-generated event posters will appear here.</p>
          <Link href="/dashboard/generators/image/new" className="btn-primary px-6 py-2 rounded-xl text-white inline-flex items-center gap-2">
            <Plus size={18} /> Design Poster
          </Link>
        </div>
      )}

      {/* Collaboration Modal */}
      {selectedImage && (
        <CollaborationModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          entityId={selectedImage.id}
          entityType="image"
          entityName={selectedImage.prompt.slice(0, 20) + '...'}
        />
      )}
    </div>
  );
}
