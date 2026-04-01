
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Rocket, Code2, ExternalLink, Loader2,
  CheckCircle, Copy, Check, Globe, X
} from "lucide-react";

export default function ActionBar({ sessionId, projectName, onViewCode, hasProject, liveUrl, onDeploy }) {
  const [downloading, setDownloading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!sessionId) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/website-maker/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(projectName || "website").replace(/\s+/g, "-").toLowerCase()}-project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDeploy = async () => {
    if (!sessionId) return;
    setDeploying(true);
    setDeployResult(null);
    try {
      const res = await fetch("/api/website-maker/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");

      setDeployResult(data);

      if (data.liveUrl && onDeploy) {
        onDeploy(data.liveUrl);
      }
    } catch (err) {
      setDeployResult({ status: "error", message: err.message });
    } finally {
      setDeploying(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasProject) return null;

  const currentUrl = deployResult?.liveUrl || liveUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full space-y-3"
    >
      {/* Action Buttons Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* View Code */}
        <button
          onClick={onViewCode}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-neutral-700 hover:border-neutral-600"
        >
          <Code2 size={16} />
          View Code
        </button>

        {/* Download ZIP */}
        <button
          onClick={handleDownload}
          disabled={downloading || !sessionId}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-neutral-700 hover:border-neutral-600"
        >
          {downloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {downloading ? "Preparing..." : "Download ZIP"}
        </button>

        {/* Publish Button */}
        <button
          onClick={handleDeploy}
          disabled={deploying || !sessionId}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-red-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95"
        >
          {deploying ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Rocket size={16} />
          )}
          {deploying ? "Publishing..." : "Publish Website"}
        </button>
      </div>

      {/* Deploy Result Card */}
      <AnimatePresence>
        {deployResult && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            {deployResult.status === "deployed" ? (
              /* ── Success Card ── */
              <div className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={18} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Website Published Successfully!
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Your site is now live on Vercel
                      </p>

                      {/* Live URL Display */}
                      <div className="mt-3 flex items-center gap-2 bg-neutral-900/80 rounded-xl border border-neutral-700/50 p-1 pl-3">
                        <Globe size={14} className="text-green-400 shrink-0" />
                        <code className="text-xs text-green-300 font-mono truncate flex-1">
                          {deployResult.liveUrl}
                        </code>
                        <button
                          onClick={() => copyUrl(deployResult.liveUrl)}
                          className="p-2 text-neutral-500 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition shrink-0"
                          title="Copy URL"
                        >
                          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        </button>
                        <a
                          href={deployResult.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-neutral-500 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition shrink-0"
                          title="Open in new tab"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => setDeployResult(null)}
                    className="text-neutral-600 hover:text-neutral-400 transition p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* ── Error Card ── */
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <X size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-300">Deployment Failed</p>
                    <p className="text-xs text-neutral-400 mt-1">{deployResult.message}</p>
                  </div>
                  <button
                    onClick={() => setDeployResult(null)}
                    className="text-neutral-600 hover:text-neutral-400 transition p-1 ml-auto"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
