
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Video, Clapperboard, MonitorPlay, Smartphone, Clock, Sparkles, AlertCircle, Loader2, Download } from "lucide-react";
import { deductCredits, PRICING } from "@/lib/economy";
import { supabase } from "@/lib/supabase/client";
import { clsx } from "clsx";
// We manage localStorage persistence directly inside the component now so we can 
// sync the Supabase generated IDs correctly.

const STYLES = [
    { id: "realistic", name: "Cinematic Realism", desc: "Photorealistic, movie-like quality", color: "from-blue-500 to-indigo-600" },
    { id: "anime", name: "Anime Style", desc: "Japanese animation aesthetic", color: "from-pink-500 to-rose-500" },
    { id: "3d", name: "3D Render", desc: "Clean, modern 3D motion graphics", color: "from-purple-500 to-violet-600" },
];

const STATUS_MESSAGES = {
    pending: "⏳ Queued — waiting for processing...",
    processing: "🎬 Generating your video — this may take a few minutes...",
    completed: "✅ Done! Your video is ready.",
    failed: "❌ Generation failed. Please try again.",
};

export default function VideoGeneratorPage() {
    const [script, setScript] = useState("");
    const [style, setStyle] = useState("realistic");
    const [duration, setDuration] = useState("5");
    const [aspect, setAspect] = useState("16:9");
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [taskStatus, setTaskStatus] = useState(null); // pending | processing | completed | failed
    const pollingRef = useRef(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const pollTask = (taskId, dbId) => {
        pollingRef.current = setInterval(async () => {
            try {
                const resp = await fetch(`/api/generators/video?taskId=${taskId}`);
                const data = await resp.json();

                setTaskStatus(data.status);

                if (data.status === "completed" && data.video_url) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    setResult(data.video_url);
                    setGenerating(false);
                    
                    // Update Supabase
                    if (dbId) {
                        await supabase
                            .from('generated_videos')
                            .update({ status: 'completed', video_url: data.video_url })
                            .eq('id', dbId);
                    }
                    
                    // Update localStorage
                    try {
                        let projects = JSON.parse(localStorage.getItem("videogen_projects") || "[]");
                        const index = projects.findIndex(p => p.id === dbId);
                        if (index !== -1) {
                            projects[index] = { ...projects[index], status: 'completed', videoUrl: data.video_url };
                            localStorage.setItem("videogen_projects", JSON.stringify(projects));
                        }
                    } catch {}

                } else if (data.status === "failed") {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    setError("Video generation failed on the server. Please try again.");
                    setGenerating(false);
                    
                    // Update Supabase
                    if (dbId) {
                        await supabase
                            .from('generated_videos')
                            .update({ status: 'failed' })
                            .eq('id', dbId);
                    }

                    // Update localStorage
                    try {
                        let projects = JSON.parse(localStorage.getItem("videogen_projects") || "[]");
                        const index = projects.findIndex(p => p.id === dbId);
                        if (index !== -1) {
                            projects[index] = { ...projects[index], status: 'failed' };
                            localStorage.setItem("videogen_projects", JSON.stringify(projects));
                        }
                    } catch {}
                }
            } catch (err) {
                console.warn("Poll error:", err);
            }
        }, 5000); // Poll every 5 seconds
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        setResult(null);
        setTaskStatus(null);

        // Check Credits
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            alert("Please login");
            setGenerating(false);
            return;
        }

        const hasCredits = await deductCredits(user.id, PRICING.video, `Generated Video (${duration}s)`);
        if (!hasCredits) {
            alert(`Insufficient credits! Video generation costs ${PRICING.video} credits.`);
            setGenerating(false);
            return;
        }

        try {
            // Enhance prompt with style hint
            const styleHint = style === "anime" ? ", anime style" : style === "3d" ? ", 3D rendered" : ", cinematic";
            const fullPrompt = script.trim() + styleHint;

            const resp = await fetch("/api/generators/video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: fullPrompt, duration: parseInt(duration) }),
            });

            const data = await resp.json();

            if (!resp.ok) {
                setError(data.error || data.detail || "Failed to create video task");
                setGenerating(false);
                return;
            }

            // Store initial pending state in Supabase
            let dbId = Date.now().toString();
            const { data: dbData, error: dbError } = await supabase
                .from('generated_videos')
                .insert([
                    {
                        user_id: user.id,
                        prompt: fullPrompt,
                        duration: parseInt(duration),
                        style,
                        status: 'pending',
                        task_id: data.id,
                        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    }
                ])
                .select()
                .single();
            
            if (!dbError && dbData) {
                dbId = dbData.id;
            }

            // Save to LocalStorage with DB ID
            try {
                const projects = JSON.parse(localStorage.getItem("videogen_projects") || "[]");
                projects.unshift({
                    id: dbId,
                    prompt: fullPrompt,
                    style,
                    duration: parseInt(duration),
                    status: 'pending',
                    videoUrl: null,
                    taskId: data.id,
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                });
                localStorage.setItem("videogen_projects", JSON.stringify(projects.slice(0, 50)));
            } catch {}

            // Task created — start polling
            setTaskStatus("pending");
            pollTask(data.id, dbId);
        } catch (err) {
            setError("Could not connect to Video backend. Is it running on port 8000?");
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8 p-4 md:p-8">
            {/* Sidebar Controls */}
            <div className="w-full md:w-[400px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar">
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard/generators/video" className="p-2 hover:bg-neutral-800 rounded-full transition">
                        <ArrowLeft size={20} className="text-neutral-400" />
                    </Link>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Video className="text-primary" size={24} />
                        Video Generator
                    </h1>
                </div>

                {/* Script Input */}
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-2">Video Script / Prompt</label>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition min-h-[120px] resize-none"
                        placeholder="Describe your video scene... e.g. A futuristic city timeline showing the evolution of AI technology, cinematic lighting, 4k."
                    />
                    <p className="text-xs text-neutral-500 mt-2 text-right">{script.length}/500 chars</p>
                </div>

                {/* Style Selection */}
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-3">Visual Style</label>
                    <div className="grid gap-3">
                        {STYLES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStyle(s.id)}
                                className={clsx(
                                    "p-3 rounded-xl border text-left flex items-center gap-4 transition-all relative overflow-hidden",
                                    style === s.id ? "border-primary bg-primary/10" : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
                                        s.color
                                    )}
                                >
                                    <Clapperboard size={20} />
                                </div>
                                <div>
                                    <div className={clsx("font-bold text-sm", style === s.id ? "text-white" : "text-neutral-300")}>{s.name}</div>
                                    <div className="text-xs text-neutral-500">{s.desc}</div>
                                </div>
                                {style === s.id && (
                                    <div className="absolute right-4 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Duration</label>
                        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                            {["5", "10", "15", "30"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={clsx(
                                        "flex-1 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1",
                                        duration === d
                                            ? "bg-neutral-800 text-white shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    <Clock size={12} /> {d}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Aspect Ratio</label>
                        <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                            {[
                                { id: "16:9", icon: MonitorPlay, label: "Landscape" },
                                { id: "9:16", icon: Smartphone, label: "Portrait" },
                            ].map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setAspect(a.id)}
                                    className={clsx(
                                        "flex-1 py-2 rounded-md text-xs font-bold transition flex items-center justify-center gap-1",
                                        aspect === a.id
                                            ? "bg-neutral-800 text-white shadow-sm"
                                            : "text-neutral-500 hover:text-neutral-300"
                                    )}
                                >
                                    <a.icon size={12} /> {a.id}
                                </button>
                            ))}
                        </div>
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
                    disabled={!script.trim() || generating}
                    className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-auto shadow-lg shadow-primary/20"
                >
                    {generating ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            {taskStatus ? STATUS_MESSAGES[taskStatus]?.split("—")[0] || "Working..." : "Submitting..."}
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            Generate Video
                        </>
                    )}
                </button>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-black rounded-2xl border border-neutral-800 overflow-hidden relative flex items-center justify-center group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-black to-black opacity-50" />

                {result ? (
                    <div className="relative w-full max-w-4xl aspect-video bg-black shadow-2xl rounded-lg overflow-hidden border border-neutral-800">
                        <video src={result} controls autoPlay loop className="w-full h-full object-contain" />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <span className="px-3 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono text-white border border-white/10">
                                AI Generated • {style} • {duration}s
                            </span>
                            <a
                                href={result}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-primary/80 backdrop-blur rounded text-xs font-bold text-white border border-primary/30 flex items-center gap-1 hover:bg-primary transition"
                            >
                                <Download size={12} /> Download
                            </a>
                        </div>
                    </div>
                ) : generating && taskStatus ? (
                    <div className="text-center relative z-10 px-6">
                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30 animate-pulse">
                            <Loader2 className="text-primary animate-spin" size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">{STATUS_MESSAGES[taskStatus]}</h2>
                        <p className="text-neutral-500 max-w-md mx-auto text-sm">
                            The AI worker is processing your request. This can take 2-5 minutes depending on duration.
                        </p>

                        {/* Progress Dots */}
                        <div className="flex items-center justify-center gap-3 mt-6">
                            {["pending", "processing", "completed"].map((s, i) => (
                                <div key={s} className="flex items-center gap-3">
                                    <div
                                        className={clsx(
                                            "w-3 h-3 rounded-full transition-all duration-500",
                                            taskStatus === s
                                                ? "bg-primary scale-125 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                : ["pending", "processing", "completed"].indexOf(taskStatus) > i
                                                ? "bg-green-500"
                                                : "bg-neutral-700"
                                        )}
                                    />
                                    {i < 2 && <div className="w-8 h-0.5 bg-neutral-800" />}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center relative z-10 px-6">
                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-800 group-hover:border-primary/50 transition duration-500">
                            <Video className="text-neutral-600 group-hover:text-primary transition duration-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Preview Canvas</h2>
                        <p className="text-neutral-500 max-w-md mx-auto">
                            Your generated video will appear here. Enter a prompt and select a style to begin.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
