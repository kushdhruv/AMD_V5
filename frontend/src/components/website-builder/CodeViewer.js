
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, File, Folder, ChevronRight, ChevronDown, Copy, Check } from "lucide-react";

export default function CodeViewer({ files, isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [copied, setCopied] = useState(false);

  // Build file tree structure
  const fileTree = useMemo(() => {
    if (!files) return [];
    return buildTree(Object.keys(files));
  }, [files]);

  const copyCode = () => {
    if (selectedFile && files[selectedFile]) {
      navigator.clipboard.writeText(files[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-select first file
  useMemo(() => {
    if (!selectedFile && files) {
      const firstFile = Object.keys(files).find((f) => f.endsWith(".jsx") || f.endsWith(".js"));
      if (firstFile) setSelectedFile(firstFile);
    }
  }, [files, selectedFile]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[700px] bg-neutral-950 border-l border-neutral-800 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <File size={16} className="text-primary" />
            Project Files
            <span className="text-[10px] text-neutral-500 font-normal ml-2">
              {files ? Object.keys(files).length : 0} files
            </span>
          </h3>
          <button onClick={onClose} className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* File Tree */}
          <div className="w-56 border-r border-neutral-800 overflow-y-auto bg-neutral-900/50 p-2">
            {fileTree.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                depth={0}
              />
            ))}
          </div>

          {/* Code Display */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedFile && (
              <>
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900/30">
                  <span className="text-xs text-neutral-400 font-mono truncate">{selectedFile}</span>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                  >
                    {copied ? (
                      <>
                        <Check size={10} className="text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={10} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <pre className="text-xs font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
                    <code>{files[selectedFile] || ""}</code>
                  </pre>
                </div>
              </>
            )}
            {!selectedFile && (
              <div className="flex-1 flex items-center justify-center text-neutral-600 text-sm">
                Select a file to view its code
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function TreeNode({ node, selectedFile, onSelect, depth }) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Folder size={12} className="text-primary/60" />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children?.map((child) => (
          <TreeNode key={child.path} node={child} selectedFile={selectedFile} onSelect={onSelect} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const ext = node.name.split(".").pop();
  const extColors = {
    jsx: "text-blue-400",
    js: "text-yellow-400",
    css: "text-pink-400",
    json: "text-green-400",
    html: "text-orange-400",
    md: "text-neutral-400",
    env: "text-amber-600",
  };

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={`flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-xs transition ${
        selectedFile === node.path
          ? "bg-primary/10 text-primary"
          : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <File size={11} className={extColors[ext] || "text-neutral-600"} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function buildTree(paths) {
  const root = [];

  for (const path of paths.sort()) {
    const parts = path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const existingNode = current.find((n) => n.name === name);

      if (existingNode) {
        if (!isFile) {
          current = existingNode.children;
        }
      } else {
        const newNode = {
          name,
          path: parts.slice(0, i + 1).join("/"),
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        current.push(newNode);
        if (!isFile) {
          current = newNode.children;
        }
      }
    }
  }

  return root;
}
