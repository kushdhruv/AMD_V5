"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";
import { clsx } from "clsx";

let toastCount = 0;

export const toast = {
  success: (message) => window.dispatchEvent(new CustomEvent("amd-toast", { detail: { id: ++toastCount, type: "success", message } })),
  error: (message) => window.dispatchEvent(new CustomEvent("amd-toast", { detail: { id: ++toastCount, type: "error", message } })),
  info: (message) => window.dispatchEvent(new CustomEvent("amd-toast", { detail: { id: ++toastCount, type: "info", message } })),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const newToast = e.detail;
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener("amd-toast", handleToast);
    return () => window.removeEventListener("amd-toast", handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            "pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-md rounded-xl border shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300",
            t.type === "success" && "bg-[#0A1A12] border-emerald-500/30 text-emerald-100",
            t.type === "error" && "bg-[#1A0A0A] border-red-500/30 text-red-100",
            t.type === "info" && "bg-[#0A121A] border-blue-500/30 text-blue-100"
          )}
        >
          <div className="shrink-0">
            {t.type === "success" && <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>}
            {t.type === "error" && <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-400" /></div>}
            {t.type === "info" && <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Info className="w-4 h-4 text-blue-400" /></div>}
          </div>
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="shrink-0 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
