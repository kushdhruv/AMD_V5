
"use client";

import Link from "next/link";
import { Sparkles, Video, Image as ImageIcon, MessageSquare, ArrowRight } from "lucide-react";

export default function GeneratorsPage() {
  const tools = [
    { 
        id: "video",
        icon: Video, 
        title: "Video Generator", 
        desc: "Create promotional videos from text scripts using AI.",
        href: "/dashboard/generators/video",
        active: true
    },
    { 
        id: "image",
        icon: ImageIcon, 
        title: "Image Studio", 
        desc: "Generate posters, banners, and social assets.",
        href: "/dashboard/generators/image",
        active: true
    },
    { 
        id: "phrases",
        icon: MessageSquare, 
        title: "Catchy Phrase Generator", 
        desc: "Generate creative captions & hooks for your posts and events.",
        href: "/dashboard/generators/phrases",
        active: true
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6 animate-pulse-slow">
            <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">AI Generators Suite</h1>
        <p className="text-neutral-400 max-w-lg mx-auto text-lg">
            Unleash your creativity with our suite of AI-powered tools. 
            Create professional content for your events in seconds.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {tools.map((tool) => (
            <Link 
                key={tool.id} 
                href={tool.href}
                className={`group relative p-8 rounded-3xl border transition-all duration-300 flex flex-col items-start h-full
                    ${tool.active 
                        ? "bg-neutral-900/50 border-neutral-800 hover:border-primary/50 hover:bg-neutral-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10" 
                        : "bg-neutral-900/20 border-neutral-800 opacity-60 cursor-not-allowed"
                    }`}
            >
                <div className={`p-3 rounded-2xl mb-6 transition-colors ${tool.active ? "bg-neutral-800 group-hover:bg-primary/20 text-neutral-200 group-hover:text-primary" : "bg-neutral-800/50 text-neutral-600"}`}>
                    <tool.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {tool.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
                    {tool.desc}
                </p>

                <div className="w-full mt-auto">
                    {tool.active ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 transition-all">
                            Launch Tool <ArrowRight size={16} className="text-primary" />
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-neutral-800 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-500 inline-block border border-neutral-700">
                            {tool.status}
                        </div>
                    )}
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
}
