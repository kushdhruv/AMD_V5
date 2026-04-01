"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Wand2, Image as ImageIcon, X, UploadCloud } from "lucide-react";

export default function PromptBar({ onGenerate, isGenerating, progress }) {
  const [prompt, setPrompt] = useState("");
  // Now supports an array of Base64 strings (the first is used for vision, all are used for content)
  const [images, setImages] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          // Severe compression bound (1200px max) protects against the 4MB Node API limit crash!
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
          // 0.7 quality forces sub-150KB sizes. Blazing fast transfer overhead.
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
      if (!file.type.startsWith('image/')) continue;
      const base64 = await compressImage(file);
      if (base64) compressedQueue.push(base64);
    }
    setImages(prev => [...prev, ...compressedQueue].slice(0, 10)); // Cap at 10 max images
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;
    
    // Explicitly pass the first image as 'image' for backward compatibility (Vision API)
    // and pass the full array as 'userImages' to seamlessly integrate into website templates!
    const visionContext = images.length > 0 ? images[0] : null;
    onGenerate({ prompt: prompt.trim(), image: visionContext, userImages: images });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Uploaded Images Strip */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="mb-4 flex flex-wrap gap-3 overflow-hidden"
          >
            {images.map((imgSrc, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-neutral-900 border border-primary/30 rounded-2xl shadow-lg ring-1 ring-primary/20 flex flex-col items-center justify-center overflow-hidden w-24 h-24"
              >
                <img src={imgSrc} alt={`Upload ${i}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                
                {/* Visual Label for Context vs Content */}
                {i === 0 && <span className="absolute bottom-1 right-1 bg-primary/90 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow-lg backdrop-blur">Vision</span>}
                
                <button 
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 shadow-lg hover:bg-red-500/90 rounded-full text-white flex items-center justify-center backdrop-blur transition-all scale-0 group-hover:scale-100"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
            
            {/* Add More Button */}
            {images.length < 10 && (
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-neutral-700 hover:border-primary/50 text-neutral-500 hover:text-primary rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary/5 cursor-pointer"
               >
                 <UploadCloud size={20} />
                 <span className="text-[10px] uppercase font-bold tracking-widest text-center px-2">Add<br/>Photo</span>
               </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Prompt Area */}
      <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-300 hover:border-neutral-700 focus-within:border-primary/50 focus-within:shadow-[0_0_50px_rgba(255,106,0,0.15)]">
        
        {/* Header Label */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">
             <Sparkles size={12} className="text-primary" />
             AI WEBSITE GENERATOR
           </div>

           {/* Hidden File Input (Multiple Enable) */}
           <input 
             type="file" 
             ref={fileInputRef}
             className="hidden" 
             accept="image/*"
             multiple
             onChange={handleImageChange}
            />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${images.length > 0 ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700 hover:text-neutral-300'}`}
           >
             <ImageIcon size={10} />
             {images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''} Attached` : "Attach Photos"}
           </button>
        </div>

        {/* Textarea + Submit */}
        <div className="flex flex-col md:flex-row items-end gap-4 p-6 pt-2">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe your dream website in detail... (e.g. 'A futuristic SaaS landing page for an space tourism company with dark glassmorphism and bento grids')"
            rows={3}
            className="flex-1 bg-transparent text-white resize-none focus:outline-none placeholder:text-neutral-600 text-base md:text-lg leading-relaxed min-h-[100px]"
            disabled={isGenerating}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isGenerating}
            className="shrink-0 w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Building...</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Generate Website</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isGenerating && progress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-neutral-900/60 backdrop-blur border border-neutral-800 rounded-2xl p-5"
          >
            <div className="space-y-3">
              {progress.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 text-xs"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${p.stage === "error" ? "bg-red-400" : i === progress.length - 1 ? "bg-primary animate-pulse" : "bg-neutral-700"}`} />
                  <span className={`${p.stage === "error" ? "text-red-400" : i === progress.length - 1 ? "text-primary font-medium" : "text-neutral-500"}`}>
                    {p.message}
                  </span>
                </motion.div>
              ))}
              {!progress.some(p => p.stage === "complete" || p.stage === "error") && (
                <div className="flex items-center gap-3 text-primary text-[10px] pl-4 font-bold uppercase tracking-widest opacity-60">
                  <Loader2 size={10} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
