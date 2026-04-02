"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, Sparkles, FileEdit, Zap, Layout, Palette, Type, Plus, Minus } from "lucide-react";
import { clsx } from "clsx";

export function ChatSidebar({ 
  isOpen, 
  onClose, 
  messages, 
  onSendMessage, 
  isProcessing,
  title = "Edit with AI",
}) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput("");
  };

  const quickEdits = [
    { icon: Palette, label: "Change color to purple", prompt: "Change the primary color to purple" },
    { icon: Type, label: "Update hero title", prompt: "Change the hero title to TECH SUMMIT 2026" },
    { icon: Plus, label: "Add sponsors section", prompt: "Add a sponsors section after about with popular tech companies" },
    { icon: Layout, label: "Add FAQ section", prompt: "Add a FAQ section before footer with 5 common questions" },
    { icon: Minus, label: "Remove gallery", prompt: "Remove the gallery section" },
    { icon: Zap, label: "Change theme to dark blue", prompt: "Change the color scheme to dark blue" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-80 md:w-96 border-l border-neutral-800 bg-neutral-900/95 backdrop-blur-xl flex flex-col h-full absolute right-0 top-0 bottom-0 z-40 shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileEdit size={13} className="text-primary" />
              </div>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition p-1.5 hover:bg-neutral-800 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <div className="space-y-5">
                {/* Welcome */}
                <div className="text-center py-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-orange-600/20 border border-primary/30 flex items-center justify-center mb-4">
                    <Sparkles size={24} className="text-primary" />
                  </div>
                  <p className="text-white text-sm font-semibold">What would you like to change?</p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Describe any edit — text, colors, add/remove sections...
                  </p>
                </div>

                {/* Quick Edit Chips */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-bold px-1">Quick Edits</p>
                  {quickEdits.map((edit, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(edit.prompt)}
                      className="w-full flex items-center gap-2.5 text-left text-[11px] px-3 py-2.5 bg-neutral-800/60 hover:bg-neutral-800 rounded-xl text-neutral-400 hover:text-neutral-200 transition border border-transparent hover:border-neutral-700"
                    >
                      <edit.icon size={13} className="text-neutral-500 shrink-0" />
                      {edit.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col max-w-[90%] ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : msg.content.startsWith("❌")
                        ? "bg-red-500/10 text-red-300 rounded-tl-sm border border-red-500/20"
                        : "bg-neutral-800/80 text-neutral-200 rounded-tl-sm border border-neutral-700/50"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {/* Live progress indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mr-auto flex items-center gap-2.5 bg-neutral-800/60 border border-neutral-700/50 rounded-2xl rounded-tl-sm px-3.5 py-2.5"
              >
                <Loader2 size={13} className="animate-spin text-primary" />
                <span className="text-xs text-neutral-300">Processing...</span>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex flex-col gap-2">
            <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your edit..."
                className="flex-1 bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 border border-neutral-700/50 focus:border-primary/50 placeholder:text-neutral-600"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="p-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition disabled:opacity-20 disabled:bg-neutral-800 shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
