
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Sparkles, Copy, Check } from "lucide-react";
import { clsx } from "clsx";
import { deductCredits } from "@/lib/economy";

function savePhrasesToHistory(topic, tone, platform, phrases) {
    try {
        const projects = JSON.parse(localStorage.getItem("phrasegen_projects") || "[]");
        projects.unshift({
            id: Date.now().toString(),
            topic,
            tone,
            platform,
            phrases,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        });
        localStorage.setItem("phrasegen_projects", JSON.stringify(projects.slice(0, 50)));
    } catch {}
}
import { supabase } from "@/lib/supabase/client";

const TONES = [
  { id: "professional", name: "Professional", emoji: "👔" },
  { id: "funny", name: "Funny/Witty", emoji: "🤪" },
  { id: "inspirational", name: "Inspirational", emoji: "✨" },
  { id: "dramatic", name: "Dramatic", emoji: "🎭" },
  { id: "urgency", name: "Urgency/FOMO", emoji: "⏰" },
];

const PLATFORMS = [
  { id: "instagram", name: "Instagram Caption" },
  { id: "twitter", name: "Twitter / X Post" },
  { id: "linkedin", name: "LinkedIn Post" },
  { id: "email", name: "Email Subject Line" },
  { id: "tagline", name: "Brand Tagline" },
];

export default function PhraseGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [platform, setPlatform] = useState("instagram");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setGenerating(true);
    setResults([]);

    // Check Credits (Low cost: 5 credits)
    const COST = 5;
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) {
        alert("Please login");
        setGenerating(false);
        return;
    }

    const hasCredits = await deductCredits(user.id, COST, `Generated Phrases: ${platform}`);
    if(!hasCredits) {
        alert(`Insufficient credits! This tool costs ${COST} credits.`);
        setGenerating(false);
        return;
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock Results based on inputs
    const mockPhrases = [
        `Unlock the power of ${topic} today! 🚀 #Innovation`,
        `Don't just dream about ${topic}, make it happen. ✨`,
        `The secret to ${topic} isn't what you think... 👀`,
        `Why everyone is talking about ${topic} this week! 🔥`,
        `Ready to level up your ${topic} game? Let's go! 💪`
    ];
    
    if (tone === "funny") {
        mockPhrases[0] = `Warning: ${topic} may cause extreme happiness. 😂`;
        mockPhrases[1] = `If ${topic} was a sport, I'd be Olympic gold. 🥇`;
    } else if (tone === "urgency") {
         mockPhrases[0] = `Last chance to master ${topic}! ⏳`;
         mockPhrases[1] = `Stop scrolling! You need to see this about ${topic}. 🚨`;
    }

    setResults(mockPhrases);
    savePhrasesToHistory(topic, tone, platform, mockPhrases);
    setGenerating(false);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8 p-4 md:p-8">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-[400px] flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar">
        <div className="flex items-center gap-4 mb-2">
            <Link href="/dashboard/generators/phrases" className="p-2 hover:bg-neutral-800 rounded-full transition">
                <ArrowLeft size={20} className="text-neutral-400" />
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-primary" size={24} />
                Phrase Generator
            </h1>
        </div>

        {/* Input */}
        <div>
            <label className="block text-sm font-bold text-neutral-300 mb-2">Topic / Keyword</label>
            <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition min-h-[100px] resize-none"
                placeholder="e.g. New AI Coffee Machine launch, Summer Music Festival, Fitness App sale..."
            />
        </div>

        {/* Platform Selection */}
        <div>
             <label className="block text-sm font-bold text-neutral-300 mb-2">Platform / Format</label>
             <select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
             >
                 {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
        </div>

        {/* Tone Selection */}
        <div>
            <label className="block text-sm font-bold text-neutral-300 mb-3">Tone of Voice</label>
            <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={clsx(
                            "p-3 rounded-lg border text-left flex items-center gap-2 transition-all text-xs font-bold",
                            tone === t.id ? "border-primary bg-primary/10 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700"
                        )}
                    >
                        <span className="text-lg">{t.emoji}</span> {t.name}
                    </button>
                ))}
            </div>
        </div>

        <button
            onClick={handleGenerate}
            disabled={!topic.trim() || generating}
            className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-auto shadow-lg shadow-primary/20"
        >
            {generating ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                </>
            ) : (
                <>
                    <Sparkles size={20} />
                    Generate Phrases
                </>
            )}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 bg-black/40 rounded-2xl border border-neutral-800 p-8 overflow-y-auto">
         
         {!results.length && !generating && (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                 <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-neutral-800">
                    <MessageSquare size={40} className="text-neutral-600" />
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">Ready to Write</h2>
                 <p className="text-neutral-500 max-w-sm">
                    Enter a topic and select a vibe. AI will generate catchy hooks and captions for you.
                 </p>
             </div>
         )}
         
         {generating && (
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-neutral-900/50 rounded-xl animate-pulse" />
                ))}
            </div>
         )}

         {results.length > 0 && !generating && (
             <div className="space-y-4 animate-fade-in-up">
                 <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Generated Results</h3>
                 {results.map((phrase, i) => (
                     <div key={i} className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
                         <p className="text-lg font-medium text-white leading-relaxed">
                             {phrase}
                         </p>
                         <div className="flex justify-end">
                             <button 
                                onClick={() => copyToClipboard(phrase, i)}
                                className={clsx("flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors", 
                                    copied === i ? "bg-green-500/20 text-green-500" : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                                )}
                             >
                                 {copied === i ? <Check size={14} /> : <Copy size={14} />}
                                 {copied === i ? "Copied" : "Copy"}
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
         )}

      </div>

    </div>
  );
}
