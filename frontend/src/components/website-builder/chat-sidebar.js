"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, Loader2, Sparkles } from "lucide-react";
import { clsx } from "clsx";

export function ChatSidebar({ isOpen, onClose, messages, onSendMessage, isProcessing }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={onClose} // Actually onToggle
        className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition z-50 animate-bounce-in"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="w-80 md:w-96 border-l border-neutral-800 bg-neutral-900 flex flex-col h-full absolute right-0 top-0 bottom-0 z-40 transition-transform duration-300 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
        <h3 className="font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI Editor
        </h3>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition">
            <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
            <div className="text-center text-neutral-500 mt-10 text-sm">
                <p>👋 Hi! I can help you edit your site.</p>
                <p className="mt-2 text-xs">Try: "Change hero background to blue" or "Add a testimonial section".</p>
            </div>
        )}
        
        {messages.map((msg, i) => (
            <div key={i} className={clsx("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={clsx(
                    "px-4 py-2 rounded-2xl text-sm",
                    msg.role === "user" 
                        ? "bg-primary text-white rounded-tr-sm" 
                        : "bg-neutral-800 text-neutral-200 rounded-tl-sm border border-neutral-700"
                )}>
                    {msg.content}
                </div>
            </div>
        ))}
        
        {isProcessing && (
            <div className="mr-auto flex items-center gap-2 text-neutral-500 text-xs">
                <Loader2 size={12} className="animate-spin" />
                Thinking...
            </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950">
        <form onSubmit={handleSubmit} className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for changes..."
                className="w-full bg-neutral-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary/50 placeholder:text-neutral-500"
                disabled={isProcessing}
            />
            <button 
                type="submit" 
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 top-2 p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition disabled:opacity-50"
            >
                <Send size={16} />
            </button>
        </form>
      </div>
    </div>
  );
}
