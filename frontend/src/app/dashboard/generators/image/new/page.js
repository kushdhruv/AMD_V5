
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Sparkles, Download, Layers, Palette, Layout, AlertCircle, Loader2, ImagePlus } from "lucide-react";
import { clsx } from "clsx";
import { supabase } from "@/lib/supabase/client";

// saveImageToHistory logic is now moved directly into handleGenerate
// so we can access the Supabase user id and wait for the DB insertion

// Map to PosterForge backend categories & styles
const CATEGORIES = [
    { id: "Hackathon", name: "Hackathon", icon: "💻" },
    { id: "Cultural Fest", name: "Cultural Fest", icon: "🎭" },
    { id: "Workshop", name: "Workshop", icon: "🛠️" },
    { id: "Tech Talk", name: "Tech Talk", icon: "🎤" },
    { id: "Sports Meet", name: "Sports Meet", icon: "🏆" },
    { id: "Freshers Party", name: "Freshers Party", icon: "🎉" },
    { id: "Farewell", name: "Farewell", icon: "👋" },
    { id: "Annual Day", name: "Annual Day", icon: "🏅" },
];

const STYLES = [
    { id: "Minimalist", name: "Minimalist", icon: "⚪" },
    { id: "Vibrant", name: "Vibrant", icon: "🌈" },
    { id: "Retro", name: "Retro", icon: "📻" },
    { id: "Neon Glow", name: "Neon Glow", icon: "🌃" },
    { id: "Elegant", name: "Elegant", icon: "✨" },
    { id: "Futuristic", name: "Futuristic", icon: "🚀" },
    { id: "Watercolor", name: "Watercolor", icon: "🎨" },
    { id: "3D Render", name: "3D Render", icon: "🧊" },
];

const FORMATS = [
    { id: "poster", name: "Event Poster", ratio: "2:3", width: "w-[200px]", height: "h-[300px]" },
    { id: "banner", name: "Web Banner", ratio: "16:9", width: "w-[300px]", height: "h-[169px]" },
    { id: "social", name: "Social Post", ratio: "1:1", width: "w-[250px]", height: "h-[250px]" },
];

export default function ImageGeneratorPage() {
    const [prompt, setPrompt] = useState("");
    const [category, setCategory] = useState("Hackathon");
    const [style, setStyle] = useState("Vibrant");
    const [format, setFormat] = useState("poster");
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState([]); // Array of { url, prompt }
    const [error, setError] = useState(null);
    const [gallery, setGallery] = useState([]);

    // Load gallery on mount
    useEffect(() => {
        fetch("/api/generators/image?action=gallery")
            .then((r) => r.json())
            .then((data) => {
                if (data.images) setGallery(data.images);
            })
            .catch(() => {}); // Silently fail if backend not running
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setError(null);

        try {
            const resp = await fetch("/api/generators/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, category, style }),
            });

            const data = await resp.json();

            if (!resp.ok) {
                setError(data.error || "Generation failed");
                setGenerating(false);
                return;
            }

            // 1. Get user for Supabase
            const { data: { user } } = await supabase.auth.getUser();
            let dbId = Date.now().toString();

            if (user) {
                // 2. Save to Supabase
                const { data: dbData, error: dbError } = await supabase
                    .from('generated_images')
                    .insert([
                        {
                            user_id: user.id,
                            prompt,
                            image_url: data.image_url,
                            category,
                            style,
                            aspect_ratio: format
                        }
                    ])
                    .select()
                    .single();
                
                if (!dbError && dbData) {
                    dbId = dbData.id;
                }
            }

            // 3. Save to localStorage with the DB ID
            try {
                const projects = JSON.parse(localStorage.getItem("imagegen_projects") || "[]");
                projects.unshift({
                    id: dbId,
                    prompt,
                    category,
                    style,
                    imageUrl: data.image_url,
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                });
                localStorage.setItem("imagegen_projects", JSON.stringify(projects.slice(0, 50)));
            } catch {}

            // Add to UI results (prepend)
            setResults((prev) => [
                { url: data.image_url, prompt: data.prompt_used, cached: data.cached },
                ...prev,
            ]);
        } catch (err) {
            setError("Could not connect to Image backend. Is PosterForge running on port 5000?");
        }

        setGenerating(false);
    };

    const allImages = [...results, ...gallery.map((g) => ({ url: g.url, prompt: g.prompt }))];
    // Deduplicate by URL
    const uniqueImages = allImages.filter((img, i, arr) => arr.findIndex((x) => x.url === img.url) === i);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8">
            {/* Sidebar Controls */}
            <div className="w-full md:w-[350px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar shrink-0">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard/generators/image" className="p-2 hover:bg-neutral-800 rounded-full transition">
                        <ArrowLeft size={20} className="text-neutral-400" />
                    </Link>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="text-primary" size={24} />
                        Image Studio
                    </h1>
                </div>

                {/* Prompt */}
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-2">Image Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition min-h-[100px] resize-none"
                        placeholder="A futuristic conference poster with glowing neon typography..."
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-3 flex items-center gap-2">
                        <Layers size={14} /> Event Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCategory(c.id)}
                                className={clsx(
                                    "p-2 rounded-lg border text-left transition-all flex items-center gap-2 text-sm",
                                    category === c.id
                                        ? "border-primary bg-primary/10 text-white"
                                        : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700"
                                )}
                            >
                                <span>{c.icon}</span>
                                <span className="font-medium truncate">{c.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style */}
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-3 flex items-center gap-2">
                        <Palette size={14} /> Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {STYLES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStyle(s.id)}
                                className={clsx(
                                    "p-2 rounded-lg border text-left transition-all flex items-center gap-2 text-sm",
                                    style === s.id
                                        ? "border-primary bg-primary/10 text-white"
                                        : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:border-neutral-700"
                                )}
                            >
                                <span>{s.icon}</span>
                                <span className="font-medium">{s.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Format */}
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-3 flex items-center gap-2">
                        <Layout size={14} /> Format
                    </label>
                    <div className="space-y-2">
                        {FORMATS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFormat(f.id)}
                                className={clsx(
                                    "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between group",
                                    format === f.id
                                        ? "border-primary bg-primary/10"
                                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={clsx(
                                            "border border-dashed rounded-sm border-current w-6 h-6 flex items-center justify-center text-[8px]",
                                            format === f.id ? "text-primary" : "text-neutral-500"
                                        )}
                                    >
                                        {f.ratio}
                                    </div>
                                    <span className={clsx("text-sm font-medium", format === f.id ? "text-white" : "text-neutral-400")}>
                                        {f.name}
                                    </span>
                                </div>
                                {format === f.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || generating}
                    className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-auto shadow-lg shadow-primary/20"
                >
                    {generating ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate Image
                        </>
                    )}
                </button>
            </div>

            {/* Gallery Area */}
            <div className="flex-1 bg-neutral-950 rounded-2xl border border-neutral-800 p-6 overflow-y-auto custom-scrollbar">
                {uniqueImages.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {uniqueImages.map((img, i) => (
                            <div
                                key={i}
                                className="group relative rounded-xl overflow-hidden bg-neutral-900 aspect-[2/3] border border-neutral-800 hover:border-primary transition"
                            >
                                <img src={img.url} alt="Generated" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4">
                                    <p className="text-white text-xs text-center line-clamp-3">{img.prompt}</p>
                                    <div className="flex gap-2">
                                        <a
                                            href={img.url}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white rounded-full text-black hover:scale-110 transition"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <ImagePlus size={64} className="mb-4 text-neutral-600" />
                        <h2 className="text-2xl font-bold text-white mb-2">Image Studio</h2>
                        <p className="max-w-sm mx-auto text-neutral-400">
                            Generate professional event posters, banners, and social media content.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
