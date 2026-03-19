
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Use singleton
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Globe, Trash2, ExternalLink } from "lucide-react";

export default function WebsiteBuilderDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // const supabase = createClient(); // Removed

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Handled by layout, but safe to check
        return;
      }

      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setProjects(projectsData || []);
      setLoading(false);
    }
    init();
  }, []);

  const handleDelete = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await supabase.from("projects").delete().eq("id", projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: { color: "bg-neutral-800 text-neutral-400", label: "Draft" },
      researching: { color: "bg-blue-900/40 text-blue-400", label: "Researching" },
      generating: { color: "bg-purple-900/40 text-purple-400", label: "Generating" },
      ready: { color: "bg-green-900/40 text-green-400", label: "Ready" },
      deployed: { color: "bg-green-500 text-black font-bold", label: "Live" },
    };
    const s = map[status] || map.draft;
    return <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-primary" />
            Website Builder
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Create AI-powered event websites in minutes.
          </p>
        </div>
        <Link 
            href="/dashboard/website-builder/new" 
            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-16 text-center bg-neutral-900/50">
          <div className="text-4xl mb-4 opacity-50">🚀</div>
          <h2 className="text-lg font-semibold text-white mb-2">
            No projects yet
          </h2>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
            Create your first event website. Just describe your event and our AI will build it for you.
          </p>
          <Link href="/dashboard/website-builder/new" className="text-primary hover:underline text-sm">
            Start a new project &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="bg-neutral-900/50 border border-neutral-800 hover:border-primary/50 rounded-xl p-5 flex flex-col transition group">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold text-base truncate pr-2">
                  {project.name}
                </h3>
                {getStatusBadge(project.status)}
              </div>

              <p className="text-neutral-400 text-xs line-clamp-2 mb-4 flex-grow h-10">
                {project.prompt || "No description provided."}
              </p>

              <div className="text-[10px] text-neutral-600 mb-4 uppercase font-bold tracking-wider">
                Created {new Date(project.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                <Link
                  href={`/dashboard/website-builder/${project.id}`}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs py-2 rounded-lg text-center transition"
                >
                  Editor
                </Link>
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition"
                    title="View Live Site"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-900/10 hover:bg-red-900/30 text-red-500 p-2 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
