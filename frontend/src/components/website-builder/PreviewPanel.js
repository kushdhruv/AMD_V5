
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw, Maximize2 } from "lucide-react";

const DEVICE_PRESETS = {
  desktop: { width: "100%", label: "Desktop", icon: Monitor },
  tablet: { width: "768px", label: "Tablet", icon: Tablet },
  mobile: { width: "375px", label: "Mobile", icon: Smartphone },
};

export default function PreviewPanel({ previewHTML, projectName, isLoading }) {
  const [device, setDevice] = useState("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  const openInNewTab = () => {
    if (!previewHTML) return;
    const blob = new Blob([previewHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const refresh = () => {
    setIframeKey((k) => k + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden min-h-0"
    >
      {/* Browser Chrome */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center gap-3 shrink-0">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>

        {/* Device Toggles */}
        <div className="flex items-center bg-neutral-800/60 rounded-lg p-0.5 gap-0.5">
          {Object.entries(DEVICE_PRESETS).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={`p-1.5 rounded-md transition-all ${
                device === key
                  ? "bg-primary/20 text-primary"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        {/* URL Bar */}
        <div className="flex-1 bg-neutral-800/60 rounded-lg text-center text-[11px] text-neutral-500 py-1.5 px-4 font-mono flex items-center justify-center gap-2 group cursor-pointer hover:text-neutral-300 transition" onClick={openInNewTab}>
          <span className="truncate">{projectName ? `${projectName.toLowerCase().replace(/\s+/g, "-")}.vercel.app` : "preview://localhost"}</span>
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={openInNewTab}
            className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition"
            title="Open in new tab"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Preview Area — stretches to fill all remaining space */}
      <div className="flex-1 flex items-stretch justify-center bg-neutral-950 overflow-hidden min-h-0">
        <div
          className="h-full transition-all duration-500 ease-in-out mx-auto"
          style={{
            width: DEVICE_PRESETS[device].width,
            maxWidth: "100%",
          }}
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-neutral-950">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-primary/30 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-neutral-500 text-sm">Generating your website...</p>
            </div>
          ) : previewHTML ? (
            <iframe
              key={iframeKey}
              srcDoc={previewHTML}
              className="w-full h-full border-0 bg-white"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="eager"
              style={{ colorScheme: "light" }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 bg-neutral-950">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <Monitor size={32} className="text-neutral-700" />
              </div>
              <div className="text-center">
                <p className="text-neutral-400 text-sm font-medium">No preview yet</p>
                <p className="text-neutral-600 text-xs mt-1">Enter a prompt above to generate your website</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

