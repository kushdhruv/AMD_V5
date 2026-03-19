"use client";

import { AppConfig } from "@/lib/app-builder-v2/schema/configSchema";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, AlertCircle, Wand2, Sparkles } from "lucide-react";
import { clsx } from "clsx";

type Props = {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  setUpdating: (status: boolean) => void;
};

export default function ChatPanel({ config, onUpdateConfig, setUpdating }: Props) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hi! I am the **AI App Architect**. You can ask me to re-theme the app, add modules, or intelligently shape the UI for your exact event." }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const SUGGESTIONS = [
    "Switch to a Neon Cyberpunk UI theme",
    "Add Leaderboard & Live Scores",
    "Enable Sponsors & Coupons",
    "Set the font to Space Grotesk"
  ];

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setUpdating(true);

    try {
      const res = await fetch("/api/config-v2/chat-patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentConfig: config,
          prompt: text
        })
      });

      const data = await res.json();

      if (data.success) {
        onUpdateConfig(data.config);
        setMessages(prev => [...prev, { role: 'ai', content: `Done! I've automatically updated your app configuration in the central preview. Let me know what else to tweak.` }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `**Error:** ${data.error}` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I failed to process that request.` }]);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-black/0 via-purple-500/5 to-black/0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Wand2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">AI App Architect</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Context-Aware Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={clsx("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "")}>
             <div className={clsx(
               "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
               m.role === 'user' ? "bg-white/10 border-white/20" : "bg-purple-900/40 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
             )}>
                {m.role === 'user' ? <div className="text-xs font-bold text-white/60">U</div> : <Sparkles className="w-4 h-4 text-purple-400" />}
             </div>
             <div className={clsx(
               "px-4 py-3 rounded-2xl max-w-[85%] text-[13px] leading-relaxed",
               m.role === 'user' 
                 ? "bg-white/10 text-white rounded-tr-sm border border-white/5" 
                 : "bg-purple-500/10 text-purple-100/90 rounded-tl-sm border border-purple-500/20"
             )}>
               <div dangerouslySetInnerHTML={{__html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
             </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="pt-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4">
             <span className="text-[10px] text-white/30 uppercase tracking-widest px-2">Suggestions</span>
             {SUGGESTIONS.map((s, i) => (
               <button 
                 key={i} 
                 onClick={() => handleSend(s)}
                 className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-white/70 flex items-center gap-3 group"
               >
                 <Sparkles className="w-3 h-3 text-white/20 group-hover:text-purple-400 transition-colors" />
                 "{s}"
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/50 border-t border-white/5 shrink-0">
         {config.app_state === 'GENERATED' || config.app_state === 'LIVE' ? (
           <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
             <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
             <p className="text-xs text-red-200">
               App structural configuration is locked in {config.app_state} state. Use the Admin Dashboard to manage event data.
             </p>
           </div>
         ) : (
           <>
             <div className="relative flex items-center">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="e.g. Generate a Hackathon theme..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-14 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
                <button 
                  onClick={() => handleSend()}
                  className="absolute right-2 w-9 h-9 flex items-center justify-center rounded-full bg-purple-500 text-white hover:bg-purple-400 hover:scale-105 transition-all shadow-lg"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
             </div>
             <p className="text-center text-[10px] text-white/20 mt-3 font-medium tracking-wide">
               Powered by Groq & Llama 3.3
             </p>
           </>
         )}
      </div>
    </div>
  );
}
