
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // Use singleton
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Search, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { deductCredits, PRICING } from "@/lib/economy";

const TEMPLATE_OPTIONS = [
  {
    id: "tech",
    name: "Tech / Hackathon",
    icon: "💻",
    desc: "Dark theme, code-inspired, modern tech aesthetic",
  },
  {
    id: "cultural",
    name: "Cultural / Festival",
    icon: "🎭",
    desc: "Vibrant colors, artistic elements, celebration feel",
  },
  {
    id: "corporate",
    name: "Corporate / Conference",
    icon: "🏢",
    desc: "Professional, clean white design, business-ready",
  },
  {
    id: "minimal",
    name: "Minimal / Clean",
    icon: "✨",
    desc: "Ultra-clean, focused on content, elegant spacing",
  },
];

export default function NewWebsiteProjectPage() {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [template, setTemplate] = useState("tech");
  const [step, setStep] = useState(1); // 1: form, 2: enhancing, 3: researching, 4: generating
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [error, setError] = useState("");
  const [statusLog, setStatusLog] = useState([]);

  const router = useRouter();
  // const supabase = createClient(); // Removed

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    }
    check();
  }, []);

  const addLog = (msg) => setStatusLog((prev) => [...prev, { time: new Date(), msg }]);

  const handleGenerate = async () => {
    setError("");
    
    // Check & Deduct Credits
    addLog("💳 Checking credits...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const hasCredits = await deductCredits(user.id, PRICING.website, `Generated Website: ${name}`);
    if (!hasCredits) {
        setError(`Insufficient credits! Generating a website costs ${PRICING.website} credits.`);
        return;
    }

    setStep(2);
    addLog(`✅ Credits deducted (${PRICING.website}). Starting AI...`);
    addLog("🔄 Enhancing your prompt with AI...");

    try {
      // Step 1: Enhance prompt
      const enhanceRes = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!enhanceRes.ok) {
          // Fallback if API not ready
          addLog("⚠️ API not ready, using raw prompt...");
          setEnhancedPrompt(prompt);
      } else {
        const { enhanced } = await enhanceRes.json();
        setEnhancedPrompt(enhanced);
        addLog("✅ Prompt enhanced successfully");
      }

      // Step 2: Research
      setStep(3);
      addLog("🔍 Researching with AI Agents...");

      // Mock research for now if API missing
      let research = {};
      try {
          const researchRes = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: enhancedPrompt || prompt }),
          });
          if (researchRes.ok) {
              const resData = await researchRes.json();
              research = resData.research;
              addLog("✅ Research complete — facts gathered");
          } else {
              throw new Error("Research API failed");
          }
      } catch (e) {
          addLog("⚠️ Research skipped (API pending). Using default data.");
          research = { summary: "Research skipped." };
      }

      // Step 3: Generate blueprint
      setStep(4);
      addLog("📋 Generating structured blueprint...");

      let blueprint = null;
      try {
        const blueprintRes = await fetch("/api/generate-blueprint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            prompt: enhancedPrompt || prompt,
            research,
            template,
            }),
        });

        if (blueprintRes.ok) {
            const bpData = await blueprintRes.json();
            blueprint = bpData.project; // API returns { project: { blueprint, theme } }
            addLog("✅ Blueprint generated!");
        } else {
             throw new Error("Blueprint API failed");
        }
      } catch (e) {
          addLog("⚠️ Blueprint generation simulated (API pending).");
          // Mock blueprint
          blueprint = {
              blueprint: { event_name: name, hero: { headline: name, subheadline: prompt } },
              theme: { primary: "#000000" }
          };
      }

      // Save project
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newProject, error: dbError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name,
          prompt,
          enhanced_prompt: enhancedPrompt || prompt,
          research_data: research,
          blueprint_json: blueprint.blueprint,
          theme_json: blueprint.theme,
          template_type: template,
          status: "ready",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      addLog("🚀 Project saved! Redirecting...");
      setTimeout(() => router.push(`/dashboard/website-builder/${newProject.id}`), 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
      addLog(`❌ Error: ${err.message}`);
      setStep(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard/website-builder" className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm transition">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 md:p-12">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create New Event Website
        </h1>
        <p className="text-neutral-400 mb-8">
          Describe your event and our AI will research real facts to build your site.
        </p>

        {step === 1 ? (
          /* ─── Form Step ─── */
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                placeholder="e.g., AI Hackathon 2026"
                required
              />
            </div>

            {/* Event Prompt */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Describe Your Event</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition min-h-[140px] resize-y"
                placeholder="e.g., A 2-day AI and Machine Learning hackathon at MIT. 500 expected attendees, featuring workshops on LLMs..."
                required
              />
              <p className="text-xs text-neutral-500 mt-2">
                Be as specific as possible — the AI will research details.
              </p>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Choose Template Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {TEMPLATE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
                      template === t.id
                        ? "border-primary bg-primary/10"
                        : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                    }`}
                  >
                    <div className="text-2xl mt-1">{t.icon}</div>
                    <div>
                        <div className={`font-semibold text-sm ${template === t.id ? "text-primary": "text-white"}`}>
                        {t.name}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/10 border border-red-900/30 rounded-lg px-4 py-3 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!name.trim() || !prompt.trim()}
              className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles size={18} />
              Generate Event Website
            </button>
          </div>
        ) : (
          /* ─── Generation Progress ─── */
          <div className="py-8">
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              {[
                { n: 2, label: "Enhance", icon: Sparkles },
                { n: 3, label: "Research", icon: Search },
                { n: 4, label: "Blueprint", icon: FileText },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all border ${
                      step >= s.n
                        ? "bg-primary border-primary text-white"
                        : "bg-neutral-900 border-neutral-700 text-neutral-500"
                    }`}
                  >
                    {step > s.n ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
                  </div>
                  <span
                    className={`text-sm hidden sm:inline ${
                      step >= s.n ? "text-white" : "text-neutral-500"
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.n < 4 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        step > s.n ? "bg-primary" : "bg-neutral-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Status Log */}
            <div className="space-y-3 bg-black/30 rounded-xl p-6 border border-white/5 font-mono text-sm max-h-60 overflow-y-auto">
              {statusLog.map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-xs text-neutral-600 mt-0.5 shrink-0">
                    {log.time.toLocaleTimeString()}
                  </span>
                  <span className="text-neutral-300">{log.msg}</span>
                </div>
              ))}
              {step <= 4 && !error && (
                <div className="flex items-center gap-3 text-primary animate-pulse">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
