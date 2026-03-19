"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Plus, Trash2, Download, Clock, ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const STYLE_LABELS = { realistic: "Cinematic", anime: "Anime", "3d": "3D Render" };

export default function VideoGeneratorLanding() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      // 1. Load from localStorage immediately for fast UI
      let localProjects = [];
      try {
        localProjects = JSON.parse(localStorage.getItem("videogen_projects") || "[]");
        setProjects(localProjects);
      } catch {}

      // 2. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // 3. Fetch from Supabase
      const { data: dbProjects, error } = await supabase
        .from('generated_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbProjects) {
        // Map DB projects to UI format
        const formattedDbProjects = dbProjects.map(p => ({
            id: p.id,
            prompt: p.prompt,
            style: p.style,
            duration: p.duration,
            status: p.status,
            videoUrl: p.video_url,
            taskId: p.task_id,
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
        localStorage.setItem("videogen_projects", JSON.stringify(merged.slice(0, 50)));
      }
    };

    fetchUserAndProjects();
  }, []);

  const deleteProject = async (id) => {
    // Optimistic UI update
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("videogen_projects", JSON.stringify(updated));

    // Delete from Supabase
    if (user) {
        await supabase.from('generated_videos').delete().eq('id', id);
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

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
            <Video size={40} className="text-neutral-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No videos yet</h2>
          <p className="text-neutral-500 max-w-sm mb-6">
            Generate your first AI video — enter a text prompt and the AnimateDiff model will create a cinematic clip for you.
          </p>
          <Link
            href="/dashboard/generators/video/new"
            className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Sparkles size={16} />
            Create Your First Video
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="bg-neutral-900/50 border border-neutral-800 hover:border-primary/50 rounded-xl overflow-hidden flex flex-col transition group">
              {/* Thumbnail */}
              <div className="h-40 overflow-hidden relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                {project.videoUrl ? (
                  <video src={project.videoUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <Video size={48} className="text-neutral-700" />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    project.status === "completed"
                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                      : project.status === "processing"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      : project.status === "failed"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
                  }`}>
                    {project.status || "pending"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-semibold text-base truncate mb-1">
                  {project.prompt?.slice(0, 60) || "Video Project"}
                  {project.prompt?.length > 60 ? "..." : ""}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
                  <span className="flex items-center gap-1"><Clock size={12} /> {project.date}</span>
                  <span>{STYLE_LABELS[project.style] || project.style}</span>
                  <span>{project.duration}s</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-neutral-800 mt-auto">
                  <Link
                    href="/dashboard/generators/video/new"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs py-2 rounded-lg text-center transition"
                  >
                    New Video
                  </Link>
                  {project.videoUrl && (
                    <a
                      href={project.videoUrl}
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
