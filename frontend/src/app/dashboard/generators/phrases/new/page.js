
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Copy, Check, Loader2, Wand2 } from "lucide-react";
import { clsx } from "clsx";
import { deductCredits } from "@/lib/economy";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase/supabase-client";
import { useSearchParams } from "next/navigation";


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
  const searchParams = useSearchParams();
  const existingId = searchParams.get('id');

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [platform, setPlatform] = useState("instagram");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(null);


  // Load existing context
  useState(() => {
    async function loadData() {
        if (existingId) {
            const { data: phraseData } = await supabase
                .from('generated_phrases')
                .select('*')
                .eq('id', existingId)
                .single();
            
            if (phraseData) {
                setTopic(phraseData.topic);
                setTone(phraseData.tone || "professional");
                setPlatform(phraseData.platform || "instagram");
                setResults(phraseData.phrases);
            }
        }
    }
    loadData();
  }, [existingId]);

  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
      if (!topic.trim() || isEnhancing || generating) return;
      setIsEnhancing(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const hasCredits = await deductCredits(user.id, PRICING.enhance, "Enhanced Phrase Prompt");
              if (!hasCredits) {
                  toast.error(`Insufficient credits. Needs ${PRICING.enhance}.`);
                  setIsEnhancing(false);
                  return;
              }
          }

          const res = await fetch("/api/enhance-prompt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: topic.trim(), type: "phrase" })
          });
          const data = await res.json();
          if (res.ok && data.enhanced) {
              setTopic(data.enhanced);
              toast.success("Topic enhanced successfully!");
          } else {
              toast.error("Failed to enhance topic.");
          }
      } catch (e) {
          toast.error("Error enhancing topic.");
      } finally {
          setIsEnhancing(false);
      }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setGenerating(true);
    setResults([]);

    const { data: { user } } = await supabase.auth.getUser();
    if(!user) {
        return;
    }

    const hasCredits = await deductCredits(user.id, PRICING.phrase, `Generated Phrases: ${platform}`);
    if(!hasCredits) {
        toast.error(`Insufficient credits! This tool costs ${PRICING.phrase} credits.`);
        setGenerating(false);
        return;
    }

    try {
      // Call backend API to generate AI-powered phrases
      const resp = await fetch("/api/generate-phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, platform }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const generatedPhrases = data.phrases || [];
      setResults(generatedPhrases);

      // Save to Supabase
      const { data: dbData } = await supabase
          .from('generated_phrases')
          .insert([{
              user_id: user.id,
              topic,
              tone,
              platform,
              phrases: generatedPhrases
          }])
          .select()
          .single();

      // Save to LocalStorage
      try {
          const projects = JSON.parse(localStorage.getItem("phrasegen_projects") || "[]");
          projects.unshift({
              id: dbData?.id || Date.now().toString(),
              topic,
              tone,
              platform,
              phrases: generatedPhrases,
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          });
          localStorage.setItem("phrasegen_projects", JSON.stringify(projects.slice(0, 50)));
      } catch {}
    } catch (err) {
      console.error("Phrase generation error:", err);
      alert("Failed to generate phrases: " + err.message);
    }

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
                <Sparkles className="text-primary" size={24} />
                Phrase Generator
            </h1>
        </div>

        {/* Input */}
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-neutral-300">Topic / Keyword</label>
                <button 
                    onClick={handleEnhance}
                    disabled={!topic.trim() || isEnhancing || generating}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-purple-500/30 ${topic.trim() ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white' : 'bg-neutral-800 text-neutral-500'}`}
                >
                    {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                    Enhance Text
                </button>
            </div>
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
                    <Sparkles size={40} className="text-neutral-600" />
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
