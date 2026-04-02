"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, Sparkles, FileEdit, Image as ImageIcon, Zap, Layout, Palette, Type, Plus, Minus } from "lucide-react";
import { getUserEconomy, deductCredits, PRICING } from "@/lib/economy";
import { supabase } from "@/lib/supabase/supabase-client";
import { toast } from "@/components/ui/toast";

export function EditChatSidebar({
  isOpen,
  onClose,
  sessionId,
  onPreviewUpdate,
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [editStage, setEditStage] = useState(""); // real-time progress
  const endRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, editStage]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX = 1200;
          if (width > height && width > MAX) {
            height *= MAX / width;
            width = MAX;
          } else if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const compressedQueue = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const base64 = await compressImage(file);
      if (base64) compressedQueue.push(base64);
    }
    setAttachedImages((prev) => [...prev, ...compressedQueue].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !sessionId) return;

    const userMsg = input.trim();
    const imagesToUpload = [...attachedImages];

    let displayMsg = userMsg;
    if (imagesToUpload.length > 0) {
      displayMsg += `\n📎 ${imagesToUpload.length} image(s) attached`;
    }

    setMessages((prev) => [...prev, { role: "user", content: displayMsg }]);
    setInput("");
    setAttachedImages([]);
    setIsProcessing(true);
    setEditStage("🔍 Analyzing your instruction...");

    try {
      // Simulate stage progression
      const stageTimer = setTimeout(() => setEditStage("✏️ Modifying website plan..."), 1500);
      const stageTimer2 = setTimeout(() => setEditStage("🔨 Rebuilding templates..."), 3500);
      const stageTimer3 = setTimeout(() => setEditStage("🖥️ Generating preview..."), 5000);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please login"); return; }
      
      const hasCredits = await deductCredits(user.id, PRICING.website_edit, "AI Website Edit");
      if (!hasCredits) {
          setEditStage("");
          setIsProcessing(false);
          toast.error(`Insufficient credits. Need ${PRICING.website_edit}.`);
          return;
      }

      const res = await fetch(`/api/website-maker/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, prompt: userMsg, userImages: imagesToUpload }),
      });

      clearTimeout(stageTimer);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      const assistantMsg = `✅ ${data.summary || "Changes applied successfully"}`;
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMsg }]);

      if (data.preview && onPreviewUpdate) {
        onPreviewUpdate(data.preview, data.updatedFiles);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${err.message}` },
      ]);
    } finally {
      setIsProcessing(false);
      setEditStage("");
    }
  };

  const quickEdits = [
    { icon: Palette, label: "Change color to purple", prompt: "Change the primary color to purple" },
    { icon: Type, label: "Update hero title", prompt: "Change the hero title to TECH SUMMIT 2026" },
    { icon: Plus, label: "Add sponsors section", prompt: "Add a sponsors section after about with popular tech companies" },
    { icon: Layout, label: "Add FAQ section", prompt: "Add a FAQ section before footer with 5 common questions" },
    { icon: Minus, label: "Remove gallery", prompt: "Remove the gallery section" },
    { icon: Zap, label: "Change theme to dark blue", prompt: "Change the color scheme to dark blue" },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="w-80 md:w-96 border-l border-neutral-800 bg-neutral-900/95 backdrop-blur-xl flex flex-col h-full z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm">
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileEdit size={13} className="text-primary" />
          </div>
          Edit with AI
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white transition p-1.5 hover:bg-neutral-800 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-5">
            {/* Welcome */}
            <div className="text-center py-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-orange-600/20 border border-primary/30 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-primary" />
              </div>
              <p className="text-white text-sm font-semibold">What would you like to change?</p>
              <p className="text-neutral-500 text-xs mt-1">
                Describe any edit — text, colors, add/remove sections, images...
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
            <span className="text-xs text-neutral-300">{editStage || "Processing..."}</span>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex flex-col gap-2">
        {/* Attached Images */}
        <AnimatePresence>
          {attachedImages.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 px-1 overflow-x-auto"
            >
              {attachedImages.map((src, i) => (
                <div key={i} className="relative w-12 h-12 rounded-lg border border-neutral-700 overflow-hidden shrink-0 group">
                  <img src={src} className="w-full h-full object-cover" alt="upload" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl transition-colors border ${
              attachedImages.length > 0
                ? "text-primary border-primary/30 bg-primary/10"
                : "text-neutral-500 border-neutral-800 bg-neutral-800 hover:text-white hover:border-neutral-700"
            }`}
          >
            <ImageIcon size={16} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your edit..."
            className="flex-1 bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 border border-neutral-700/50 focus:border-primary/50 placeholder:text-neutral-600"
            disabled={isProcessing || !sessionId}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing || !sessionId}
            className="p-2.5 bg-primary hover:bg-primary/80 text-white rounded-xl transition disabled:opacity-20 disabled:bg-neutral-800 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
