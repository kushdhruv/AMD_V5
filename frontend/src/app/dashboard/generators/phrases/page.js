"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Trash2, Copy, Check, Clock, ArrowLeft, Sparkles } from "lucide-react";

const TONE_EMOJIS = {
  professional: "👔", funny: "🤪", inspirational: "✨", dramatic: "🎭", urgency: "⏰"
};

export default function PhraseGeneratorLanding() {
  const [projects, setProjects] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("phrasegen_projects") || "[]");
      setProjects(stored);
    } catch { setProjects([]); }
  }, []);

  const deleteProject = (id) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    localStorage.setItem("phrasegen_projects", JSON.stringify(updated));
  };

  const copyPhrase = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
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
              <MessageSquare className="text-primary" />
              Catchy Phrase Generator
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              Generate creative captions, hooks, and taglines for your events and posts.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/generators/phrases/new"
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition"
        >
          <Plus size={16} />
          New Phrases
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
            <MessageSquare size={40} className="text-neutral-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No phrases yet</h2>
          <p className="text-neutral-500 max-w-sm mb-6">
            Generate catchy captions, hooks, and taglines for Instagram, Twitter, LinkedIn, and more. Pick a tone and let AI do the rest.
          </p>
          <Link
            href="/dashboard/generators/phrases/new"
            className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Sparkles size={16} />
            Generate Your First Phrases
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="bg-neutral-900/50 border border-neutral-800 hover:border-primary/50 rounded-xl overflow-hidden flex flex-col transition group">
              {/* Header */}
              <div className="p-5 pb-3 border-b border-neutral-800/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold text-base leading-tight flex-1 mr-2">
                    {project.topic?.slice(0, 50) || "Phrase Set"}
                    {project.topic?.length > 50 ? "..." : ""}
                  </h3>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-1.5 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded-lg transition shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {project.date}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded-full">{project.platform}</span>
                  <span>{TONE_EMOJIS[project.tone] || ""} {project.tone}</span>
                </div>
              </div>

              {/* Phrases */}
              <div className="p-4 flex-1 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {(project.phrases || []).slice(0, 3).map((phrase, i) => (
                  <div
                    key={i}
                    className="group/phrase flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition"
                  >
                    <p className="text-neutral-300 text-xs leading-relaxed flex-1">{phrase}</p>
                    <button
                      onClick={() => copyPhrase(phrase, `${project.id}-${i}`)}
                      className="shrink-0 p-1 rounded text-neutral-500 hover:text-white transition opacity-0 group-hover/phrase:opacity-100"
                    >
                      {copied === `${project.id}-${i}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
                {(project.phrases?.length || 0) > 3 && (
                  <p className="text-xs text-neutral-600 text-center pt-1">
                    +{project.phrases.length - 3} more phrases
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4 pt-2 border-t border-neutral-800/50">
                <Link
                  href="/dashboard/generators/phrases/new"
                  className="w-full bg-white/5 hover:bg-white/10 text-neutral-300 text-xs py-2 rounded-lg text-center transition block"
                >
                  Generate More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
