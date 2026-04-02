"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Globe, MessageSquare, Database, Eye, Code, Rocket, Download, ExternalLink } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("preview");

  // Registration state
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

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

  useEffect(() => {
    if (activeTab === "registrations" && id) {
      setLoadingRegs(true);
      supabase
        .from("registrations")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setRegistrations(data);
          setLoadingRegs(false);
        });
    }
  }, [activeTab, id]);

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
              disabled={activeTab === "registrations"}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "registrations" ? "opacity-50 cursor-not-allowed bg-neutral-800" :
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

      {/* Tabs */}
      <div className="border-b border-neutral-800 bg-neutral-900/40 px-6 flex gap-6 shrink-0 z-20">
        <button
          onClick={() => setActiveTab("preview")}
          className={clsx(
            "py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
            activeTab === "preview" ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Eye size={16} />
          <span className="hidden md:inline">Preview Panel</span>
        </button>
        <button
          onClick={() => { setActiveTab("registrations"); setShowChat(false); }}
          className={clsx(
            "py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
            activeTab === "registrations" ? "border-primary text-primary" : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Database size={16} />
          Registrations
          {registrations.length > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full ml-1">
              {registrations.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "preview" ? (
          <>
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
          </>
        ) : (
          <div className="flex-1 overflow-auto p-6 bg-neutral-950">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Database className="text-primary" />
                Form Registrations
              </h2>
              {loadingRegs ? (
                <div className="text-center py-12 text-neutral-500">Loading registrations...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-neutral-800">
                  <p className="text-neutral-400">No registrations found yet.</p>
                  <p className="text-xs text-neutral-500 mt-2">When users submit forms on your site, they'll appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900">
                  <table className="w-full text-left text-sm text-neutral-300">
                    <thead className="text-xs text-neutral-500 uppercase bg-neutral-800/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {registrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-neutral-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(reg.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded bg-neutral-800 text-xs font-mono">
                              {reg.form_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 max-w-sm">
                              {Object.entries(reg.data).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="text-neutral-500">{key}:</span>{" "}
                                  <span className="text-neutral-200">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
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
