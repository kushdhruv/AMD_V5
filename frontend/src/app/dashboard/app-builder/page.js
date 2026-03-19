"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Smartphone, Plus, Trash2, Download, Clock, Package, Sparkles, Layout } from "lucide-react";

// ═══════════════════════════════════════════════
// App Builder — Project Listing (localStorage)
// ═══════════════════════════════════════════════
const STORAGE_KEY = "appbuilder_projects";

function getProjects() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects;
}

// Template thumbnails
const TEMPLATE_IMAGES = {
  announcement: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
  registration: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80",
  certificate: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
  default: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
};

export default function AppBuilderDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProjects(getProjects());
    setLoading(false);
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Delete this app project?")) return;
    setProjects(deleteProject(id));
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
            <Smartphone className="text-primary" />
            App Builder
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Build native Android apps for events — no coding required.
          </p>
        </div>
        <Link
          href="/dashboard/app-builder/new"
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-2xl p-16 text-center bg-neutral-900/50">
          <div className="text-4xl mb-4 opacity-50">📱</div>
          <h2 className="text-lg font-semibold text-white mb-2">
            No app projects yet
          </h2>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">
            Create your first mobile app. Pick a template, customize it, and export or build an APK.
          </p>
          <Link href="/dashboard/app-builder/new" className="text-primary hover:underline text-sm">
            Start a new project &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="bg-neutral-900/50 border border-neutral-800 hover:border-primary/50 rounded-xl overflow-hidden flex flex-col transition group">
              {/* Thumbnail */}
              <div className="h-36 overflow-hidden relative">
                <img
                  src={TEMPLATE_IMAGES[project.template] || TEMPLATE_IMAGES.default}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                    {project.template || "Custom"}
                  </span>
                  {project.buildStatus === "success" && (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">
                      APK Built
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-semibold text-base truncate mb-1">
                  {project.name}
                </h3>

                <p className="text-neutral-500 text-xs mb-3">
                  {project.screens || "?"} screen{project.screens !== 1 ? "s" : ""} • {project.components || "?"} components
                </p>

                <div className="text-[10px] text-neutral-600 mb-4 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Clock size={10} />
                  {project.date || "Unknown date"}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-800 mt-auto">
                  <Link
                    href="/dashboard/app-builder/new"
                    className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs py-2 rounded-lg text-center transition"
                  >
                    New App
                  </Link>
                  {project.downloadUrl && (
                    <a
                      href={project.downloadUrl}
                      className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition"
                      title="Download APK"
                    >
                      <Download size={14} />
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
            </div>
          ))}
        </div>
      )}
      {/* Coming Soon Section */}
      <div className="mt-16 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-500/20">
                    <Sparkles size={12} />
                    Coming Soon
                </span>
                <h2 className="text-3xl font-bold text-white mb-3">
                    Prompt-to-App AI
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    In the future, you won't even need to use the visual editor to start. Simply type a description of the app you want—like "A fitness tracking app with a dark theme and a daily log screen"—and our AI will generate the entire application structure instantly.
                </p>
                <div className="flex gap-4 items-center text-sm font-semibold text-neutral-300">
                    <div className="flex items-center gap-2"><Smartphone className="text-primary" size={16}/> Instant UI generation</div>
                    <div className="flex items-center gap-2"><Layout className="text-primary" size={16}/> Smart layout routing</div>
                </div>
            </div>

            <div className="hidden md:block w-72 h-48 bg-black rounded-xl border border-neutral-800 shadow-2xl relative overflow-hidden ring-1 ring-white/5 flex items-center justify-center">
                 {/* Mock UI for prompt */}
                 <div className="absolute inset-x-4 bottom-4 h-12 bg-neutral-900 rounded-xl border border-neutral-700/50 flex items-center px-4 justify-between opacity-80 backdrop-blur-md">
                     <span className="text-neutral-500 text-xs">"Create an app for..."</span>
                     <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white"><Sparkles size={14}/></div>
                 </div>
                 <div className="flex gap-2 mb-16">
                     <div className="w-24 h-32 bg-neutral-800/50 rounded-lg animate-pulse" />
                     <div className="w-24 h-32 bg-neutral-800/50 rounded-lg animate-pulse delay-75" />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
