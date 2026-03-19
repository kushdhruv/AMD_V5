"use client";

import React, { useState, useEffect } from "react";
import {
  Newspaper, Sparkles, Video, Image, Bot, Cpu, Globe, Mic,
  ArrowUpRight, Clock, TrendingUp, Zap, ChevronRight, RefreshCw,
  ExternalLink, Loader2
} from "lucide-react";

// Icon lookup from string name (API returns icon names as strings)
const ICON_MAP = { Video, Image, Bot, Cpu, Globe, Mic, Zap, Sparkles };

// ═══════════════════════════════════════════════
// Fallback content (shown while API loads or on error)
// ═══════════════════════════════════════════════
const FALLBACK_NEWS = [
  {
    id: 1, category: "Video Generation", categoryIcon: "Video",
    categoryColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    title: "AI Can Now Create Full Videos from Just a Text Prompt",
    summary: "New AI tools like Sora and Kling let you type a simple description and get a realistic video clip in minutes. No camera, no editing software needed.",
    whyItMatters: "Anyone can now create professional-looking video content for social media, presentations, or fun — no skills required.",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
    date: "Recent", trending: true,
  },
  {
    id: 2, category: "Image Generation", categoryIcon: "Image",
    categoryColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    title: "Create Stunning Posters & Art with AI in Seconds",
    summary: "AI image generators can turn your ideas into beautiful posters, logos, and artwork. Just describe what you want in plain English.",
    whyItMatters: "You don't need to hire a designer anymore for basic marketing materials, event posters, or social media graphics.",
    thumbnail: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=800&q=80",
    date: "Recent",
  },
  {
    id: 3, category: "Chatbots & Assistants", categoryIcon: "Bot",
    categoryColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "AI Assistants Are Getting Smarter — and Free to Use",
    summary: "ChatGPT, Gemini, and Claude can help you write emails, plan events, summarize documents, and even tutor you. Many are completely free.",
    whyItMatters: "Think of it as having a personal assistant available 24/7 — for writing, learning, brainstorming, or answering questions.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
    date: "Recent", trending: true,
  },
  {
    id: 4, category: "Voice & Music", categoryIcon: "Mic",
    categoryColor: "text-green-400 bg-green-500/10 border-green-500/20",
    title: "Generate Music, Voiceovers & Sound Effects with AI",
    summary: "Tools like Suno and ElevenLabs let you generate original music tracks, realistic voiceovers, and custom sound effects — all from text.",
    whyItMatters: "Perfect for podcasts, YouTube videos, event background music — no talent or equipment needed.",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80",
    date: "Recent",
  },
];

const ALL_CATEGORIES = [
  "All", "Video Generation", "Image Generation", "Chatbots & Assistants",
  "Voice & Music", "Coding with AI", "AI Hardware", "Education", "AI News"
];

function NewsCard({ item }) {
  const IconComp = ICON_MAP[item.categoryIcon] || Sparkles;

  return (
    <div className="glass-card overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-neutral-900">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
            <IconComp size={36} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm ${item.categoryColor}`}>
            <IconComp size={12} />
            {item.category}
          </span>
        </div>

        {/* Trending badge */}
        {item.trending && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/20 backdrop-blur-sm">
              <TrendingUp size={10} /> Trending
            </span>
          </div>
        )}

        {/* Date + source */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[11px] text-white/70">
          <span>{item.date}</span>
          {item.source && <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{item.source}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed flex-1">
          {item.summary}
        </p>

        {/* Why it matters callout */}
        {item.whyItMatters && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold mb-1">
              <Sparkles size={12} /> Why It Matters
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {item.whyItMatters}
            </p>
          </div>
        )}

        {/* Read more link */}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium pt-1">
            Read full article <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function WhatsNewPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai-news");
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setLastRefresh(new Date().toLocaleTimeString());
      } else {
        setArticles(FALLBACK_NEWS);
      }
    } catch (err) {
      console.error("Failed to fetch AI news:", err);
      setArticles(FALLBACK_NEWS);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const filtered = activeCategory === "All"
    ? articles
    : articles.filter(n => n.category === activeCategory);

  const trendingItems = articles.filter(n => n.trending);

  // Collect only categories that exist in the data
  const availableCategories = ["All", ...new Set(articles.map(a => a.category))];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={28} className="text-primary" />
            <h1 className="text-3xl font-bold">
              What's <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">New in AI</span>
            </h1>
          </div>
          <p className="text-text-secondary text-sm">
            AI explained simply — fresh news from TechCrunch, The Verge & more, rewritten for everyone.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[11px] text-text-secondary">Updated {lastRefresh}</span>
          )}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Trending ticker */}
      {trendingItems.length > 0 && !loading && (
        <div className="glass-card p-4 flex items-center gap-4 overflow-x-auto">
          <span className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
            <TrendingUp size={12} /> Trending
          </span>
          {trendingItems.map((item, i) => (
            <React.Fragment key={item.id}>
              <span className="shrink-0 text-sm text-white font-medium">{item.title}</span>
              {i < trendingItems.length - 1 && <span className="text-white/10 shrink-0">•</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary text-white shadow-[0_0_15px_rgba(255,106,0,0.3)]"
                : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card animate-pulse">
              <div className="aspect-video bg-white/[0.02]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-white/[0.05] rounded w-3/4" />
                <div className="h-3 bg-white/[0.03] rounded w-full" />
                <div className="h-3 bg-white/[0.03] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Error banner */}
          {error && (
            <div className="glass-card p-3 flex items-center gap-2 text-sm text-yellow-400 border-yellow-500/20">
              ⚠️ Couldn't fetch live news — showing curated content instead
            </div>
          )}

          {/* News grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="glass-card p-16 text-center text-text-secondary">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="font-bold text-white mb-2">No news in this category yet</h3>
              <p className="text-sm">Try selecting a different category or refresh.</p>
            </div>
          )}
        </>
      )}

      {/* Bottom CTA */}
      <div className="glass-card p-8 text-center space-y-3 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <Sparkles size={24} className="mx-auto text-primary" />
        <h3 className="font-bold text-xl text-white">AI is for Everyone</h3>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          You don't need to be a developer to use AI. These tools are designed for everyone — students, creators, event organizers, and anyone with an idea.
        </p>
      </div>
    </div>
  );
}
