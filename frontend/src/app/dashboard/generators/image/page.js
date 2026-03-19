"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image as ImageIcon, Plus, Trash2, Download, Clock, ArrowLeft, Sparkles, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ImageGeneratorLanding() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      // 1. Load from localStorage immediately for fast UI
      let localProjects = [];
      try {
        localProjects = JSON.parse(localStorage.getItem("imagegen_projects") || "[]");
        setProjects(localProjects);
      } catch {}

      // 2. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 3. Fetch from Supabase
      const { data: dbProjects, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbProjects) {
        // Map DB projects to UI format
        const formattedDbProjects = dbProjects.map(p => ({
            id: p.id,
            prompt: p.prompt,
            category: p.category,
            style: p.style,
            imageUrl: p.image_url,
            date: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }));
        
        // Merge them. DB takes precedence.
        const merged = [...formattedDbProjects];
        // Add any local ones that don't have a matching DB id
        const dbIds = new Set(formattedDbProjects.map(p => p.id));
        localProjects.forEach(lp => {
            if (!dbIds.has(lp.id)) {
                merged.push(lp);
            }
        });
        
        // Update state and localStorage
        setProjects(merged);
        localStorage.setItem("imagegen_projects", JSON.stringify(merged.slice(0, 50)));
      }
    };

    fetchUserAndProjects();
  }, []);

  const deleteProject = async (id) => {
    // Optimistic UI update
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("imagegen_projects", JSON.stringify(updated));

    // Delete from Supabase
    if (user) {
        await supabase.from('generated_images').delete().eq('id', id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/generators" className="p-2 hover:bg-neutral-800 rounded-full transition">
            <ArrowLeft size={20} className="text-neutral-400" />
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

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
            <ImageIcon size={40} className="text-neutral-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No images yet</h2>
          <p className="text-neutral-500 max-w-sm mb-6">
            Create stunning event posters, banners, and social media graphics with AI. Choose from multiple styles and categories.
          </p>
          <Link
            href="/dashboard/generators/image/new"
            className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Sparkles size={16} />
            Create Your First Image
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="bg-neutral-900/50 border border-neutral-800 hover:border-primary/50 rounded-xl overflow-hidden flex flex-col transition group">
              {/* Thumbnail */}
              <div className="h-48 overflow-hidden relative bg-gradient-to-br from-orange-900/20 to-pink-900/20">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-neutral-700" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur border border-white/10">
                    {project.category || "Custom"}
                  </span>
                </div>
                {project.style && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur border border-white/10 flex items-center gap-1">
                      <Palette size={10} /> {project.style}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-white text-sm line-clamp-2 mb-2 leading-relaxed">
                  {project.prompt || "Generated Image"}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {project.date}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-800 mt-auto">
                  {project.imageUrl && (
                    <a
                      href={project.imageUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs py-2 rounded-lg text-center transition flex items-center justify-center gap-1"
                    >
                      <Download size={12} /> Download
                    </a>
                  )}
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
