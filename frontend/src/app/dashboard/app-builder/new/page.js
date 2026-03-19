"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { APP_TEMPLATES } from "@/lib/app-builder/app-templates";
import Renderer from "@/components/app-builder/renderer";
import AdminPreview from "@/components/app-builder/admin-preview";
import { generateFlutterProject } from "@/lib/app-builder/flutter-gen";
import { Download, Smartphone, Layout, Palette, Settings, SmartphoneNfc, Edit3, Type, Image as ImageIcon, Box, Trash2, PlusCircle, MessageSquare } from "lucide-react";
import { ChatSidebar } from "@/components/website-builder/chat-sidebar";
import { clsx } from "clsx";
import { deductCredits, PRICING, getUserEconomy } from "@/lib/economy";
import { supabase } from "@/lib/supabase/client";

// Save project record to localStorage for landing page listing
function saveProjectToHistory(config, template, buildStatus = "exported") {
  const STORAGE_KEY = "appbuilder_projects";
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const project = {
      id: `app_${Date.now()}`,
      name: config.name || "Untitled App",
      template: template,
      screens: config.screens?.length || 0,
      components: config.screens?.reduce((sum, s) => sum + (s.components?.length || 0), 0) || 0,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      buildStatus,
    };
    // Avoid duplicates by name within last hour
    const filtered = existing.filter(p => !(p.name === project.name && Date.now() - new Date(p.date).getTime() < 3600000));
    filtered.unshift(project);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch (e) { console.error("Failed to save project history:", e); }
}

export default function AppBuilderPage() {
  // ... existing state ...
  

  const [selectedTemplate, setSelectedTemplate] = useState("announcement"); 
  const [config, setConfig] = useState(JSON.parse(JSON.stringify(APP_TEMPLATES["announcement"])));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); 
  const [buildStatus, setBuildStatus] = useState("idle");
  const [repoInfo, setRepoInfo] = useState(null);
  const [lastRunId, setLastRunId] = useState(null);
  const [viewMode, setViewMode] = useState("dual");

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  const CHAT_STORAGE_KEY = `ab_chat_session_${config.name}`;

  // Load chat history
  useEffect(() => {
      try {
          const saved = localStorage.getItem(CHAT_STORAGE_KEY);
          if (saved) setMessages(JSON.parse(saved));
      } catch (e) { console.error("Could not load chat history"); }
  }, [config.name]);

  // Save chat history
  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
  }, [messages, config.name]);

  const handleSendMessage = async (msg) => {
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setIsChatProcessing(true);

    try {
        const response = await fetch("/api/app-builder/chat-edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: msg,
                chatHistory: messages.slice(-5), // Send recent context
                currentConfig: config,
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to update app");
        }

        const data = await response.json();

        // 1. Update Config State (Immediate Preview Update)
        setConfig(data.config);

        // 2. Add Assistant Message
        setMessages(prev => [...prev, { 
            role: "assistant", 
            content: data.message || "Updated the app!" 
        }]);

    } catch (err) {
        setMessages(prev => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    } finally {
        setIsChatProcessing(false);
    }
  };

  // Enforce View Mode based on Template
  useEffect(() => {
      if (selectedTemplate === 'certificate') {
          setViewMode('single');
      } else {
          setViewMode('dual');
      }
  }, [selectedTemplate]);

  // Enforce Submit Button at bottom
  useEffect(() => {
    let hasChanges = false;
    const newScreens = config.screens.map(screen => {
        const comps = [...screen.components];
        const submitBtnIndex = comps.findIndex(c => 
            c.type === 'button' && 
            (c.props.action?.includes('save') || c.props.text?.toLowerCase().includes('submit'))
        );
        
        // If button exists and is NOT the last item
        if (submitBtnIndex !== -1 && submitBtnIndex !== comps.length - 1) {
            const [submitBtn] = comps.splice(submitBtnIndex, 1);
            comps.push(submitBtn);
            hasChanges = true;
            return { ...screen, components: comps };
        }
        return screen;
    });

    if (hasChanges) {
        setConfig(prev => ({ ...prev, screens: newScreens }));
    }
  }, [config.screens]);


  const handleTemplateChange = (key) => {
    setSelectedTemplate(key);
    setConfig(JSON.parse(JSON.stringify(APP_TEMPLATES[key])));
    setActiveTab("content");
  };

  const updateConfig = (key, value) => {
      setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateTheme = (key, value) => {
      setConfig(prev => ({
          ...prev,
          theme: { ...prev.theme, [key]: value }
      }));
  };

  const updateComponentProp = (screenIndex, compIndex, key, value, parentIndex = null) => {
      setConfig(prev => {
          const newScreens = [...prev.screens];
          const screen = newScreens[screenIndex];
          
          if (parentIndex !== null) {
              screen.components[parentIndex].children[compIndex].props[key] = value;
          } else {
              screen.components[compIndex].props[key] = value;
          }
          return { ...prev, screens: newScreens };
      });
  };

  const deleteComponent = (screenIndex, compIndex, parentIndex = null) => {
      if(!confirm("Delete this component?")) return;
      setConfig(prev => {
          return {
              ...prev,
              screens: prev.screens.map((screen, sIdx) => {
                  if (sIdx !== screenIndex) return screen;
                  
                  if (parentIndex !== null) {
                      const newComps = [...screen.components];
                      const parent = {...newComps[parentIndex]};
                      parent.children = parent.children.filter((_, cIdx) => cIdx !== compIndex);
                      newComps[parentIndex] = parent;
                      return { ...screen, components: newComps };
                  } else {
                      return {
                          ...screen,
                          components: screen.components.filter((_, cIdx) => cIdx !== compIndex)
                      };
                  }
              })
          };
      });
  };

  const addComponent = (screenIndex, type) => {
      const newComp = { type, props: {}, id: `new_${Date.now()}` };
      if(type === 'text_field') newComp.props = { label: "New Field", hint: "Enter value..." };
      if(type === 'text') newComp.props = { text: "New Text Block", fontSize: 16 };
      if(type === 'image') newComp.props = { url: "https://via.placeholder.com/300", height: 200 };
      if(type === 'divider') newComp.props = {};
      // Default Button
      if(type === 'button') newComp.props = { text: "Submit", action: "save_form", backgroundColor: "#FF5722", textColor: "#FFFFFF" };
      
      setConfig(prev => {
          return {
              ...prev,
              screens: prev.screens.map((screen, idx) => {
                  if (idx === screenIndex) {
                      const comps = [...screen.components];
                      
                      // Find Submit Button (Action or Text check)
                      const submitBtnIndex = comps.findIndex(c => 
                        c.type === 'button' && 
                        (c.props.action?.includes('save') || c.props.text?.toLowerCase().includes('submit'))
                      );

                      if (submitBtnIndex !== -1) {
                          // Remove button, add new comp, add button back at end
                          const [submitBtn] = comps.splice(submitBtnIndex, 1);
                          comps.push(newComp);
                          comps.push(submitBtn);
                      } else {
                          comps.push(newComp);
                      }

                      return {
                          ...screen,
                          components: comps
                      };
                  }
                  return screen;
              })
          };
      });
  };

  const renderPropEditor = (screenIndex, comp, compIndex, parentIndex = null) => {
      const props = comp.props || {};
      return Object.entries(props).map(([key, val]) => {
          if (key === "action" || key === "fullWidth" || key === "centered" || key === "multiline") return null; 
          
          return (
              <div key={key} className="mb-2">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold mb-1 block">{key}</label>
                  <input 
                      type="text"
                      value={val}
                      onChange={(e) => updateComponentProp(screenIndex, compIndex, key, e.target.value, parentIndex)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:border-primary outline-none"
                  />
              </div>
          );
      });
  };

  const handleExport = async () => {
      if (!config.adminPassword || config.adminPassword.trim().length < 4) {
          alert("⚠️ Admin Password Required!\n\nPlease set a secure admin password in the 'Theme' tab before exporting.");
          setActiveTab("theme");
          return;
      }

      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) throw new Error("Please login");

        const hasCredits = await deductCredits(user.id, PRICING.app, `Exported App: ${config.name}`);
        if(!hasCredits) throw new Error(`Insufficient credits! App export costs ${PRICING.app} credits.`);

        const files = generateFlutterProject(
            config, 
            process.env.NEXT_PUBLIC_SUPABASE_URL, 
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const zip = new JSZip();
        Object.entries(files).forEach(([path, content]) => zip.file(path, content));
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, `${config.name.replace(/\s+/g, '_').toLowerCase()}_flutter.zip`);
        saveProjectToHistory(config, selectedTemplate, "exported");
      } catch (e) { alert("Export failed: " + e.message); } finally { setLoading(false); }
  };

  // Build polling (Mocked API for now since we haven't migrated the API routes yet)
  // Build polling (Trigger GitHub Action)
  const handleCloudBuild = async () => {
      // 0. Validate Admin Password
      if (!config.adminPassword || config.adminPassword.trim().length < 4) {
          alert("⚠️ Admin Password Required!\n\nPlease set a secure admin password in the 'Theme' tab before building.");
          setActiveTab("theme");
          return;
      }

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          alert("⚠️ Configuration Error: Supabase credentials missing in .env.local!");
          return;
      }

      setLoading(true);
      setBuildStatus("building");
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if(!user) throw new Error("Please login first");

          // 1. Check Credits
          const hasCredits = await deductCredits(user.id, PRICING.app * 2, `Cloud Build: ${config.name}`);
          if(!hasCredits) throw new Error(`Insufficient credits! Cloud build costs ${PRICING.app * 2} credits.`);

          // 2. Trigger Build API
          const res = await fetch('/api/build', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                config,
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
              })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          const runId = data.runId;
          if (!runId) {
             alert("Build Triggered, but could not track Run ID. Check GitHub Actions manually.");
             setBuildStatus("success");
             return;
          }

          // 3. Poll for Status
          setBuildStatus("building");
          const pollInterval = setInterval(async () => {
              try {
                  const statusRes = await fetch(`/api/build/status?runId=${runId}`);
                  const statusData = await statusRes.json();
                  
                  if (statusData.status === "completed") {
                      clearInterval(pollInterval);
                      if (statusData.conclusion === "success") {
                          setBuildStatus("success");
                          setLastRunId(runId);
                          saveProjectToHistory(config, selectedTemplate, "success");
                          alert("✅ Build Success! Click the Download button.");
                      } else {
                          setBuildStatus("error");
                          alert("Build Failed on GitHub. Check Actions logs.");
                      }
                  } else {
                      console.log("Build Status:", statusData.status);
                  }
              } catch (err) {
                  console.error("Polling Error:", err);
                  // Don't stop polling on transient errors
              }
          }, 5000); // Check every 5s

      } catch (e) {
          alert("Build Failed: " + e.message);
          setBuildStatus("error");
          setLoading(false);
      }
      // Note: We don't set loading(false) immediately if polling, 
      // but maybe we should let user continue working while it builds?
      // For now, let's keep loading state until build starts, then just show status.
      setLoading(false); 
  };

  return (
    <div className="flex h-[calc(100vh-64px)] text-neutral-200 font-sans overflow-hidden relative">
      
      <ChatSidebar 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isChatProcessing}
      />

      {/* Sidebar */}
      <div className="w-96 border-r border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <SmartphoneNfc className="text-primary" size={20} />
                App Forge
            </h1>
            <select 
                value={selectedTemplate} 
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="bg-neutral-800 text-xs rounded px-2 py-1 border border-neutral-700 outline-none"
            >
                {Object.keys(APP_TEMPLATES).map(key => (
                    <option key={key} value={key}>{APP_TEMPLATES[key].name}</option>
                ))}
            </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800">
            <button onClick={() => setActiveTab("content")} className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition", activeTab === "content" ? "border-primary text-primary" : "border-transparent text-neutral-500 hover:text-neutral-300")}>Content</button>
            <button onClick={() => setActiveTab("theme")} className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition", activeTab === "theme" ? "border-primary text-primary" : "border-transparent text-neutral-500 hover:text-neutral-300")}>Theme</button>
            <button onClick={() => setActiveTab("export")} className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition", activeTab === "export" ? "border-primary text-primary" : "border-transparent text-neutral-500 hover:text-neutral-300")}>Export</button>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
            
            {/* TAB: CONTENT EDITOR */}
            {activeTab === "content" && (
                <div className="p-4 space-y-6">
                    {config.screens.map((screen, sIdx) => (
                        <div key={screen.id} className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900">
                            <div className="bg-neutral-800/50 px-3 py-2 text-xs font-bold uppercase text-neutral-500 flex justify-between">
                                {screen.name}
                                <span className="text-[10px] bg-neutral-700 px-1 rounded text-neutral-300">{screen.id}</span>
                            </div>
                            
                            <div className="p-3 space-y-4">
                                {screen.components.map((comp, cIdx) => (
                                    <div key={comp.id || cIdx} className="relative pl-3 border-l-2 border-neutral-800 hover:border-primary/50 transition group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs text-primary/80 flex items-center gap-1">
                                                {comp.type === 'hero' || comp.type === 'image' ? <ImageIcon size={12}/> : 
                                                comp.type === 'text' ? <Type size={12}/> : <Box size={12}/>}
                                                {comp.type}
                                            </div>
                                            <button onClick={() => deleteComponent(sIdx, cIdx)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        
                                        {comp.children ? (
                                            <div className="pl-2 space-y-2">
                                                {comp.children.map((child, chIdx) => (
                                                    <div key={chIdx} className="bg-neutral-950 p-2 rounded border border-neutral-800 group/child">
                                                        <div className="flex justify-end mb-1">
                                                            <button onClick={() => deleteComponent(sIdx, chIdx, cIdx)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover/child:opacity-100 transition">
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                        {renderPropEditor(sIdx, child, chIdx, cIdx)}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            renderPropEditor(sIdx, comp, cIdx)
                                        )}
                                    </div>
                                ))}

                                {/* Add Component Button */}
                                <div className="mt-4 pt-4 border-t border-dashed border-neutral-800">
                                    <div className="text-[10px] text-neutral-500 mb-2 font-bold uppercase text-center">Add Element</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => addComponent(sIdx, 'text_field')} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded text-xs text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1">
                                            <Edit3 size={10} /> Input Field
                                        </button>
                                        <button onClick={() => addComponent(sIdx, 'text')} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded text-xs text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1">
                                            <Type size={10} /> Text Block
                                        </button>
                                        <button onClick={() => addComponent(sIdx, 'image')} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded text-xs text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1">
                                            <ImageIcon size={10} /> Image
                                        </button>
                                        <button onClick={() => addComponent(sIdx, 'divider')} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded text-xs text-neutral-300 border border-neutral-700 flex items-center justify-center gap-1">
                                            <Box size={10} /> Separator
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: THEME EDITOR */}
            {activeTab === "theme" && (
                <div className="p-6 space-y-4">
                     <div>
                         <label className="block text-sm text-neutral-400 mb-1">App Name</label>
                         <input type="text" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                            value={config.name} onChange={(e) => updateConfig("name", e.target.value)} />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm text-neutral-400 mb-1">Primary</label>
                             <div className="flex items-center gap-2">
                                 <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                    value={config.theme.primary_color} onChange={(e) => updateTheme("primary_color", e.target.value)} />
                             </div>
                        </div>
                        <div>
                             <label className="block text-sm text-neutral-400 mb-1">Secondary</label>
                             <div className="flex items-center gap-2">
                                 <input type="color" className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                    value={config.theme.secondary_color} onChange={(e) => updateTheme("secondary_color", e.target.value)} />
                             </div>
                        </div>
                     </div>
                     <div className="mt-4 border-t border-neutral-800 pt-4">
                         <label className="block text-sm text-neutral-400 mb-1">Admin Password</label>
                         <div className="flex gap-2">
                             <input type="text" className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none text-white"
                                value={config.adminPassword || ''} onChange={(e) => updateConfig("adminPassword", e.target.value)} placeholder="Set a password for admin access" />
                             <button 
                                onClick={() => config.adminPassword?.length >= 4 ? alert("✅ Admin Password Set!") : alert("⚠️ Password too short (min 4 chars)")}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded-lg text-xs border border-neutral-700 font-bold"
                             >
                                 Set
                             </button>
                         </div>
                     </div>
                </div>
            )}

            {/* TAB: EXPORT */}
            {activeTab === "export" && (
                <div className="p-6 space-y-4">
                    <button onClick={handleExport} disabled={loading} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition flex items-center justify-center gap-2 text-sm">
                        {loading ? "..." : <><Download size={16} /> Download Code (ZIP)</>}
                    </button>
                    
                    <button 
                        onClick={handleCloudBuild}
                        disabled={loading || buildStatus === 'building'}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {buildStatus === 'building' ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"/> Building...</> : <><Smartphone size={16} /> Build APK</>}
                    </button>

                    {buildStatus === 'success' && lastRunId && (
                        <a 
                            href={`/api/build/download?runId=${lastRunId}`}
                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm mt-2"
                        >
                            <Download size={16} /> Download APK
                        </a>
                    )}
                    <p className="text-xs text-center text-neutral-500 mt-4">Cloud build requires backend setup. Use Local Export for now.</p>
                </div>
            )}

        </div>
      </div>

      {/* Main Area: Preview */}
      <div className={clsx("flex-1 bg-black/40 flex flex-col items-center justify-center p-8 relative overflow-x-auto transition-all duration-300", chatOpen && "mr-80 md:mr-96")}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-black to-black pointer-events-none" />
          
          <div className="mb-6 flex flex-col items-center z-10 gap-4">
              {/* Controls Row */}
              <div className="flex items-center gap-4 bg-neutral-900/80 p-2 rounded-2xl border border-neutral-800 backdrop-blur-md shadow-2xl">
                  <span className="bg-neutral-800 px-4 py-2 rounded-xl text-xs font-bold text-neutral-300 flex items-center gap-2 border border-neutral-700/50">
                      <Smartphone size={14} className="text-primary"/> 
                      {viewMode === 'dual' ? 'Dual Preview (User + Admin)' : 'App Preview'}
                  </span>
                  <button 
                      onClick={() => setChatOpen(!chatOpen)}
                      className={clsx(
                          "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-lg shadow-primary/10",
                          chatOpen ? "bg-primary text-white border-primary" : "bg-neutral-800 text-neutral-300 border-neutral-700/50 hover:bg-neutral-700 hover:text-white"
                      )}
                  >
                      <MessageSquare size={14} />
                      {chatOpen ? "Close AI Editor" : "Open AI Editor"}
                  </button>
              </div>
          </div>

          <div className="flex gap-8 items-start">
             {/* USER APP PREVIEW */}
             <div className="flex flex-col items-center gap-2">
                 {viewMode === "dual" && <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">User App</span>}
                 <div className="w-[375px] h-[812px] bg-black rounded-[3rem] border-8 border-neutral-800 shadow-2xl relative overflow-hidden ring-1 ring-white/10 shrink-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-neutral-800 rounded-b-3xl z-20" />
                    <div className="h-full w-full bg-white overflow-hidden relative pt-8">
                         {/* Pass Supabase Client */}
                         <Renderer initialConfig={config} supabaseClient={supabase} key={selectedTemplate} />
                    </div>
                 </div>
             </div>

             {/* ADMIN APP PREVIEW (Dual Mode Only) */}
             {viewMode === "dual" && (
                 <div className="flex flex-col items-center gap-2">
                     <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin Dashboard</span>
                     <div className="w-[375px] h-[812px] bg-black rounded-[3rem] border-8 border-neutral-800 shadow-2xl relative overflow-hidden ring-1 ring-primary/20 shrink-0">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-neutral-800 rounded-b-3xl z-20" />
                        <div className="h-full w-full bg-white overflow-hidden relative pt-8">
                             <AdminPreview config={config} supabaseClient={supabase} />
                        </div>
                     </div>
                 </div>
             )}
          </div>
      </div>

    </div>
  );
}
