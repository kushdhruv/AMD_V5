"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Globe, MessageSquare, Code, Rocket, Download, ExternalLink } from "lucide-react";
import PreviewPanel from "@/components/website-builder/PreviewPanel";
import ActionBar from "@/components/website-builder/ActionBar";
import CodeViewer from "@/components/website-builder/CodeViewer";
import { EditChatSidebar } from "@/components/website-builder/EditChatSidebar";
import { supabase } from "@/lib/supabase/supabase-client";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export default function ProjectDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();

  // Core state
  const [sessionId, setSessionId] = useState(null);
  const [previewHTML, setPreviewHTML] = useState(null);
  const [projectFiles, setProjectFiles] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [plan, setPlan] = useState(null);
  const [dbProject, setDbProject] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [liveUrl, setLiveUrl] = useState(null);

  // Load session from backend
  useEffect(() => {
    async function restoreSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const { data } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (!data) { router.push("/dashboard/website-builder"); return; }
        
        setDbProject(data);
        setProjectName(data.name || "AI Website");
        setLiveUrl(data.live_url || null);

        // Immediate preview render from DB if possible
        if (data.blueprint_json?._preview) {
           setPreviewHTML(data.blueprint_json._preview);
        }

        // Restore backend session to enable CodeViewer and EditChatSidebar
        const res = await fetch(`/api/website-maker/restore`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blueprint: data.blueprint_json }),
        });

        if (!res.ok) {
           throw new Error("Failed to restore active editing session");
        }

        const resultData = await res.json();
        
        setSessionId(resultData.sessionId);
        setPreviewHTML(resultData.preview);
        setPlan(resultData.plan);

        // Merge files for CodeViewer
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

        setIsLoading(false);
      } catch (err) {
        console.error("Restore error:", err);
        toast.error(err.message);
        setIsLoading(false);
      }
    }

    restoreSession();
  }, [id, router]);

  const handlePreviewUpdate = useCallback((newPreview, updatedFiles) => {
    if (newPreview) {
      setPreviewHTML(newPreview);
    }
    if (updatedFiles) {
      setProjectFiles((prev) => ({ ...prev, ...updatedFiles }));
    }
  }, []);

  if (isLoading && !previewHTML) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
           <div className="spinner w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
           <p className="text-neutral-500 animate-pulse text-sm">Validating Source Code and Restoring Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-xl px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-30">
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
              <h1 className="text-white font-bold text-sm truncate max-w-[150px] md:max-w-full">
                {projectName}
              </h1>
              <p className="text-[10px] text-neutral-500 -mt-0.5">
                {isLoading ? "Restoring Active Session..." : `${Object.keys(projectFiles || {}).length} files ready`}
              </p>
            </div>
          </div>
          {!isLoading && (
            <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase">
              Ready
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && (
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
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                isLoading={isLoading}
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
        </div>

        {/* Right Panel: Edit Chat */}
        <AnimatePresence>
          {showChat && (
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
      {projectFiles && (
        <CodeViewer
          files={projectFiles}
          isOpen={showCode}
          onClose={() => setShowCode(false)}
        />
      )}
    </div>
  );
}
