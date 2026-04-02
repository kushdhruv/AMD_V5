
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Globe, MessageSquare, Sparkles } from "lucide-react";
import PromptBar from "@/components/website-builder/PromptBar";
import PreviewPanel from "@/components/website-builder/PreviewPanel";
import ActionBar from "@/components/website-builder/ActionBar";
import CodeViewer from "@/components/website-builder/CodeViewer";
import { EditChatSidebar } from "@/components/website-builder/EditChatSidebar";
import { getUserEconomy, deductCredits, PRICING } from "@/lib/economy";
import { supabase } from "@/lib/supabase/supabase-client";
import { toast } from "@/components/ui/toast";

export default function WebsiteBuilderPage() {
  // Core state
  const [sessionId, setSessionId] = useState(null);
  const [previewHTML, setPreviewHTML] = useState(null);
  const [projectFiles, setProjectFiles] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [plan, setPlan] = useState(null);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState([]);
  const [showCode, setShowCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [liveUrl, setLiveUrl] = useState(null);

  // State machine: idle → generating → preview
  const state = isGenerating ? "generating" : sessionId ? "preview" : "idle";

  const handleGenerate = useCallback(async ({ prompt, links, template, image, userImages }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please login"); return; }
    
    // Deduct
    const hasCredits = await deductCredits(user.id, PRICING.website, `Generated AI Website`);
    if (!hasCredits) {
        toast.error(`Insufficient credits. Need ${PRICING.website}.`);
        return;
    }

    setIsGenerating(true);
    setProgress([]);
    setSessionId(null);
    setPreviewHTML(null);
    setProjectFiles(null);
    setShowChat(false);
    setShowCode(false);

    // Add initial progress
    setProgress([{ stage: "init", message: "🚀 Starting AI Website Builder..." }]);

    try {
      const startRes = await fetch(`/api/website-maker/build-async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, links, template, image, userImages, userId: user.id }),
      });

      const startData = await startRes.json();

      if (!startRes.ok) {
        throw new Error(startData.error || "Failed to start generation job");
      }

      const jobId = startData.jobId;
      
      // Polling function
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/website-maker/build-status?jobId=${jobId}`);
          const statusData = await statusRes.json();
          
          if (!statusRes.ok) {
            clearInterval(pollInterval);
            throw new Error(statusData.error || "Failed to check status");
          }

          if (statusData.progressLog) {
            setProgress(statusData.progressLog);
          }

          if (statusData.status === "failed") {
            clearInterval(pollInterval);
            throw new Error(statusData.error || "Generation crashed on the server.");
          }

          if (statusData.status === "completed") {
            clearInterval(pollInterval);
            const resultData = statusData.result;
            
            // Set results
            setSessionId(resultData.sessionId);
            setPreviewHTML(resultData.preview);
            setProjectName(resultData.plan?.projectName || "My Website");
            setPlan(resultData.plan);

            if (resultData.dbProject) {
              console.log("Saved to Supabase:", resultData.dbProject.id);
            }

            // Merge all files for code viewer
            const allFiles = {};
            if (resultData.project?.frontend?.files) {
              for (const [path, code] of Object.entries(resultData.project.frontend.files)) {
                allFiles[`frontend/${path}`] = code;
              }
            }
            if (resultData.project?.backend?.files) {
              for (const [path, code] of Object.entries(resultData.project.backend.files)) {
                allFiles[`backend/${path}`] = code;
              }
            }
            setProjectFiles(allFiles);

            setIsGenerating(false);
            
            // Show toast and reload to force clean slate
            toast.success("Website Generated successfully!");
            if (resultData.dbProject?.id) {
               router.push(`/dashboard/website-builder/${resultData.dbProject.id}`);
            }
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          console.error("Polling Error:", pollErr);
          setProgress((prev) => [
            ...prev,
            { stage: "error", message: `❌ ${pollErr.message}` },
          ]);
          setIsGenerating(false);
        }
      }, 3000); // Check every 3 seconds

    } catch (err) {
      console.error("AI Generation Error:", err);
      setProgress((prev) => [
        ...prev,
        { stage: "error", message: `❌ ${err.message}` },
      ]);
      setIsGenerating(false);
    }
  }, []);

  const handlePreviewUpdate = useCallback((newPreview, updatedFiles) => {
    if (newPreview) {
      setPreviewHTML(newPreview);
    }
    if (updatedFiles) {
      setProjectFiles((prev) => ({ ...prev, ...updatedFiles }));
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/website-builder"
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="h-5 w-px bg-neutral-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
              <Globe size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">
                {projectName || "AI Website Builder"}
              </h1>
              {state === "preview" && (
                <p className="text-[10px] text-neutral-500 -mt-0.5">
                  {Object.keys(projectFiles || {}).length} files generated
                </p>
              )}
            </div>
          </div>
          {state === "preview" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase">
              Ready
            </span>
          )}
        </div>

        {state === "preview" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                showChat
                  ? "bg-primary text-white"
                  : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              }`}
            >
              <MessageSquare size={14} />
              <span className="hidden md:inline">Edit with AI</span>
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel (Prompt + Preview + Actions) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Idle State — Hero + Prompt */}
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center px-6 py-12"
              >
                {/* Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-10"
                >
                  <div className="w-20 h-20 mx-auto mb-8 rounded-[2rem] bg-gradient-to-br from-primary/20 to-orange-600/20 border border-primary/30 flex items-center justify-center shadow-[0_0_60px_rgba(255,106,0,0.15)]">
                    <Sparkles size={40} className="text-primary" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                    Build anything with{" "}
                    <span className="bg-gradient-to-r from-primary via-orange-400 to-red-400 bg-clip-text text-transparent">
                      AI
                    </span>
                  </h2>
                  <p className="text-neutral-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                    Just describe your vision. Our advanced agents will generate a 
                    complete, high-end website using <span className="text-neutral-300 font-semibold">Vanilla HTML5, CSS3, and JavaScript</span>.
                  </p>
                </motion.div>

                {/* Prompt Bar */}
                <div className="w-full max-w-4xl">
                  <PromptBar
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    progress={progress}
                  />
                </div>
              </motion.div>
            )}

            {/* Generating State */}
            {state === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Full-screen Loading Preview */}
                <div className="flex-1 px-4 py-4 min-h-0">
                  <PreviewPanel
                    previewHTML={null}
                    projectName=""
                    isLoading={true}
                  />
                </div>
              </motion.div>
            )}

            {/* Preview State */}
            {state === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Preview - Full Vertical Space */}
                <div className="flex-1 px-4 py-3 overflow-hidden min-h-0">
                  <PreviewPanel
                    previewHTML={previewHTML}
                    projectName={projectName}
                    isLoading={false}
                  />
                </div>

                {/* Action Bar */}
                <div className="px-4 pb-3">
                  <ActionBar
                    sessionId={sessionId}
                    projectName={projectName}
                    onViewCode={() => setShowCode(!showCode)}
                    hasProject={!!sessionId}
                    liveUrl={liveUrl}
                    onDeploy={(url) => setLiveUrl(url)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Edit Chat */}
        <AnimatePresence>
          {showChat && state === "preview" && (
            <EditChatSidebar
              isOpen={showChat}
              onClose={() => setShowChat(false)}
              sessionId={sessionId}
              onPreviewUpdate={handlePreviewUpdate}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Code Viewer Overlay */}
      <CodeViewer
        files={projectFiles}
        isOpen={showCode}
        onClose={() => setShowCode(false)}
      />
    </div>
  );
}
