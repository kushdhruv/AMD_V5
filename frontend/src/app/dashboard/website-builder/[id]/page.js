
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client"; // Use singleton
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generatePreviewHTML } from "@/lib/website-builder/previewGenerator";
import { ArrowLeft, Edit, Download, Rocket, ExternalLink, Code, Database, Users, Eye, MessageSquare } from "lucide-react";
import { ChatSidebar } from "@/components/website-builder/chat-sidebar";
import { clsx } from "clsx";

export default function ProjectDetailPage({ params }) {
  const { id } = params;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Chat State
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    if (id) {
        try {
            const saved = localStorage.getItem(`wb_chat_${id}`);
            if (saved) setMessages(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }
  }, [id]);

  // Save chat history on update
  useEffect(() => {
     if (id && messages.length > 0) {
         localStorage.setItem(`wb_chat_${id}`, JSON.stringify(messages));
     }
  }, [messages, id]);

  const handleSendMessage = async (msg) => {
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setIsChatProcessing(true);

    try {
        const response = await fetch("/api/chat-edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: msg,
                chatHistory: messages.slice(-5), // Send last 5 messages for context
                currentBlueprint: bp, // Send current state
                currentTheme: project?.theme_json, // Send theme
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to update website");
        }

        const data = await response.json();

        // 1. Update Blueprint and Theme State (Immediate Preview)
        setProject(prev => ({ 
            ...prev, 
            blueprint_json: data.blueprint || prev.blueprint_json,
            theme_json: data.theme || prev.theme_json
        }));

        // 2. Add Assistant Message
        setMessages(prev => [...prev, { 
            role: "assistant", 
            content: data.message || "Updated the website!" 
        }]);

        // 3. Save to Supabase (Background)
        const { error: dbError } = await supabase
            .from("projects")
            .update({ 
                blueprint_json: data.blueprint || bp,
                theme_json: data.theme || project?.theme_json,
                updated_at: new Date().toISOString()
            })
            .eq("id", id);
        
        if (dbError) console.error("Failed to save blueprint:", dbError);

    } catch (err) {
        setMessages(prev => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    } finally {
        setIsChatProcessing(false);
    }
  };

  const router = useRouter();
  // const supabase = createClient(); // Removed

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) { router.push("/dashboard/website-builder"); return; }
      setProject(data);
      setLoading(false);
    }
    load();
  }, [id]);

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

  const handleDeploy = async () => {
    if (!confirm("This will create a public GitHub repository and deploy your site. Continue?")) return;
    setDeploying(true);
    try {
      // Mock deploy for now
      await new Promise(r => setTimeout(r, 2000));
      // const res = await fetch("/api/deploy", ...);
      alert("Deployment logic pending API migration.\nCurrently simulated.");
    } catch (err) {
      alert("Deploy failed: " + err.message);
    } finally {
      setDeploying(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      const html = generatePreviewHTML(bp, project?.theme_json, project?.template_type, id);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const bp = project?.blueprint_json;

  // Generate preview HTML client-side
  const previewUrl = useMemo(() => {
    if (!bp) return null;
    const html = generatePreviewHTML(bp, project?.theme_json, project?.template_type, id);
    const blob = new Blob([html], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [bp, project?.theme_json, project?.template_type, id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      <ChatSidebar 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(!chatOpen)} 
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isChatProcessing}
      />

      {/* Top Bar */}
      <nav className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur px-6 py-3 sticky top-0 z-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/website-builder" className="text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-neutral-700 mx-2" />
            <h1 className="text-white font-bold truncate max-w-[200px] md:max-w-md">
              {project.name}
            </h1>
            <span className={clsx(
                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                project.status === "deployed" ? "bg-green-500 text-black" : "bg-neutral-800 text-neutral-400"
            )}>
              {project.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={clsx("p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold", chatOpen ? "bg-primary text-white" : "text-neutral-400 hover:text-white")}
            >
                <MessageSquare size={16} />
                <span className="hidden md:inline">AI Editor</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 transition"
            >
              <Download size={14} />
              {downloading ? "Downloading..." : "Download HTML"}
            </button>
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="bg-primary hover:bg-orange-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 transition"
            >
              {deploying ? <div className="spinner w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Rocket size={14} />}
              Deploy
            </button>
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-2 transition"
              >
                <ExternalLink size={14} />
                Live Site
              </a>
            )}
          </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Tabs */}
        <div className="border-b border-neutral-800 bg-neutral-900 px-6">
            <div className="flex gap-6">
                {[
                    { id: "preview", label: "Preview", icon: Eye },
                    { id: "blueprint", label: "Blueprint", icon: Code },
                    { id: "research", label: "Research", icon: Database },
                    { id: "registrations", label: "Registrations", icon: Users },
                ].map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                        "py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition",
                        activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-neutral-500 hover:text-neutral-300"
                    )}
                    >
                    <tab.icon size={14} />
                    {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Tab Content */}
        <div className={clsx("flex-1 bg-neutral-950 overflow-hidden transition-all duration-300", activeTab === "preview" ? "p-0" : "p-6", chatOpen && "mr-80 md:mr-96")}>
            
            {activeTab === "preview" && (
            <div className="h-full flex flex-col">
                <div className="bg-neutral-900 border-b border-neutral-800 p-2 flex items-center gap-2">
                    <div className="flex gap-1.5 ml-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <div className="flex-1 bg-black/50 rounded text-center text-[10px] text-neutral-500 py-1 mx-4 font-mono flex items-center justify-center gap-2 hover:text-neutral-300 transition group cursor-pointer" onClick={() => window.open(previewUrl, '_blank')}>
                        {project.live_url || "localhost:3000"}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100" />
                    </div>
                    <button onClick={() => window.open(previewUrl, '_blank')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition" title="Open in new tab">
                        <ExternalLink size={14} />
                    </button>
                </div>
                <div className="flex-1 bg-white overflow-hidden relative">
                     {bp ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            title="Website Preview"
                        />
                     ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                            No preview available
                        </div>
                     )}
                </div>
            </div>
            )}

            {activeTab === "blueprint" && (
            <div className="h-full bg-neutral-900 rounded-xl border border-neutral-800 p-4 overflow-auto custom-scrollbar">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {JSON.stringify(bp, null, 2) || "No blueprint."}
                </pre>
            </div>
            )}

            {activeTab === "research" && (
            <div className="h-full bg-neutral-900 rounded-xl border border-neutral-800 p-6 overflow-auto custom-scrollbar">
                {project.research_data ? (
                <div className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {typeof project.research_data === "string"
                    ? project.research_data
                    : JSON.stringify(project.research_data, null, 2)}
                </div>
                ) : (
                <p className="text-neutral-500 italic">No research data available.</p>
                )}
            </div>
            )}

            {activeTab === "registrations" && (
            <div className="h-full bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-neutral-800">
                     <h3 className="text-white font-bold text-sm">Event Registrations</h3>
                 </div>
                <div className="flex-1 overflow-auto custom-scrollbar p-4">
                    {loadingRegs ? (
                         <div className="text-center py-8 text-neutral-500">Loading...</div>
                    ) : registrations.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            No registrations yet. Share your site link!
                        </div>
                    ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-neutral-500 border-b border-neutral-800">
                        <tr>
                            <th className="p-3 font-medium">Name</th>
                            <th className="p-3 font-medium">Email</th>
                            <th className="p-3 font-medium">Date</th>
                            <th className="p-3 font-medium">Details</th>
                        </tr>
                        </thead>
                        <tbody className="text-neutral-300">
                        {registrations.map((reg) => (
                            <tr key={reg.id} className="border-b border-neutral-800 hover:bg-neutral-800/30">
                            <td className="p-3">{reg.name || "N/A"}</td>
                            <td className="p-3">{reg.email || "N/A"}</td>
                            <td className="p-3 text-neutral-500">
                                {new Date(reg.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                                <details className="text-xs text-primary cursor-pointer">
                                <summary>View JSON</summary>
                                <pre className="mt-2 p-2 bg-black rounded text-neutral-400 overflow-x-auto max-w-xs">
                                    {JSON.stringify(reg.form_data, null, 2)}
                                </pre>
                                </details>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
