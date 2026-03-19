"use client";

import React, { useState, useEffect } from "react";
import { User, Calendar, Mail, FileText } from "lucide-react";

// --- Styles Helper (Matches Renderer) ---
const getThemeStyles = (theme) => ({
  primary: theme?.primary_color || "#6366F1",
  secondary: theme?.secondary_color || "#EC4899",
  background: theme?.background_color || "#ffffff",
  surface: theme?.surface_color || "#F3F4F6",
  text: theme?.text_color || "#1F2937",
  font: theme?.font_family || "sans-serif",
});

export default function AdminPreview({ config, supabaseClient }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = getThemeStyles(config.theme);

  useEffect(() => {
    if (!supabaseClient || !config.name) return;

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabaseClient
            .from('registrations')
            .select('*')
            .eq('app_name', config.name)
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (data) setRegistrations(data);
        setLoading(false);
    };
    
    fetchData();

    // Subscription
    const channel = supabaseClient
        .channel(`admin-${config.name}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'registrations',
            filter: `app_name=eq.${config.name}`
        }, (payload) => {
            setRegistrations(prev => [payload.new, ...prev]);
        })
        .subscribe();

    return () => {
        supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, config.name]);

  // Build Field Map (ID -> Label/Title)
  const fieldMap = React.useMemo(() => {
      const map = {};
      // Recursive helper
      const traverse = (components) => {
          if (!components) return;
          components.forEach(comp => {
              if (comp.id) {
                  // Prefer label, then title, then fallback to nothing (let ID show if no label)
                  if (comp.props?.label) map[comp.id] = comp.props.label;
                  else if (comp.props?.title) map[comp.id] = comp.props.title;
              }
              if (comp.children) traverse(comp.children);
          });
      };
      
      if (config?.screens) {
          config.screens.forEach(s => traverse(s.components));
      }
      return map;
  }, [config]);

  // Check if Announcement App
  const isAnnouncementApp = React.useMemo(() => {
      return config?.screens?.some(s => s.components?.some(c => c.type === 'announcement_feed'));
  }, [config]);

  const [postTitle, setPostTitle] = useState("");
  const [postMsg, setPostMsg] = useState("");
  const [postImage, setPostImage] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleAI = async (action) => {
      const input = postMsg; 
      if (!input && action === 'enhance') return alert("Please write a message to enhance!");
      if (!input && action === 'generate') return alert("Please enter keywords/topic in the message box!");

      setIsPosting(true);
      try {
          const res = await fetch('/api/app-builder/ai', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ action, text: input || "General Event Update", context: { appName: config.name } })
          });
          const data = await res.json();
          if (data.result) {
              setPostMsg(data.result);
              if (!postTitle && action === 'generate') setPostTitle("✨ New Announcement"); 
          } else {
              alert("AI Failed: " + (data.error || "Unknown"));
          }
      } catch (e) {
          alert("AI Error: " + e.message);
      }
      setIsPosting(false);
  };

  const handlePost = async () => {
      if (!postTitle || !postMsg) return alert("Please fill title and message.");
      setIsPosting(true);
      
      if (supabaseClient) {
          console.log("AdminPreview: Posting...", { title: postTitle, msg: postMsg, img: postImage });
          console.log("AdminPreview: Posting to", config.name);
          const { error } = await supabaseClient.from('announcements').insert({
              app_name: config.name,
              title: postTitle,
              message: postMsg,
              data: postImage ? { image: postImage } : {},
              created_at: new Date().toISOString()
          });
          if (error) alert("Error: " + error.message);
          else {
              alert("Published!");
              setPostTitle("");
              setPostMsg("");
              setPostImage("");
          }
      } else {
          alert("Mock Publish!\n" + postTitle);
      }
      setIsPosting(false);
  };

  // If Announcement App -> Show Compose UI
  if (isAnnouncementApp) {
      return (
        <div 
            style={{ backgroundColor: theme.background, fontFamily: theme.font }}
            className="w-full h-full min-h-[600px] overflow-y-auto relative no-scrollbar flex flex-col"
        >
          <div style={{ backgroundColor: theme.surface, color: theme.text }} className="h-14 px-4 flex items-center shadow-sm mb-4 sticky top-0 z-10">
            <h1 className="font-bold text-lg">Admin: Post Update</h1>
          </div>
          

          
          <div className="p-4 pt-0">
             <div className="flex gap-2 mb-4">
               <button 
                  onClick={() => handleAI('generate')}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-200 transition"
                  disabled={isPosting}
               >
                  ✨ Generate with AI
               </button>
               <button 
                  onClick={() => handleAI('enhance')}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
                  disabled={isPosting}
               >
                  🪄 Enhance with AI
               </button>
             </div>

             <div className="mb-4">
                 <label className="text-xs font-bold uppercase opacity-50 mb-1 block" style={{color: theme.text}}>Title</label>
                 <input 
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/50"
                    placeholder="e.g. Lunch is served!"
                    style={{color: theme.text, borderColor: theme.text + "20"}}
                 />
             </div>
             <div className="mb-4">
                 <label className="text-xs font-bold uppercase opacity-50 mb-1 block" style={{color: theme.text}}>Message</label>
                 <textarea 
                    value={postMsg}
                    onChange={e => setPostMsg(e.target.value)}
                    className="w-full p-3 rounded-xl border bg-white/50 h-32 resize-none"
                    placeholder="Write details here..."
                    style={{color: theme.text, borderColor: theme.text + "20"}}
                 />
             </div>

             <div className="mb-4">
                 <label className="text-[10px] font-bold text-neutral-400 uppercase mb-1 block">Image URL (Optional)</label>
                 <input 
                    type="text" 
                    className="w-full bg-white/50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:border-neutral-400 outline-none"
                    placeholder="https://example.com/image.jpg"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                 />
             </div>
             
             <button 
                onClick={handlePost}
                disabled={isPosting}
                className="w-full py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition"
                style={{backgroundColor: theme.primary, opacity: isPosting ? 0.7 : 1}}
             >
                {isPosting ? "Publishing..." : "Post Announcement"}
             </button>

             <div className="mt-8 pt-8 border-t border-black/10">
                 <h3 className="font-bold text-sm mb-4 opacity-50" style={{color: theme.text}}>Recent Posts</h3>
                 {/* Re-use registration list logic but for announcements? Or just fetch them? */}
                 {/* For now, just a placeholder or simple list if we want to add fetching here too. */}
                 <p className="text-xs opacity-40 italic">Check the User App preview to see usage.</p>
             </div>
          </div>
        </div>
      );
  }

  // ... (Normal Dashboard for Registrations) ...
  return (
    <div 
        style={{ backgroundColor: theme.background, fontFamily: theme.font }}
        className="w-full h-full min-h-[600px] overflow-y-auto relative no-scrollbar flex flex-col"
    >
      {/* App Bar */}
      <div 
        style={{ backgroundColor: theme.surface, color: theme.text }}
        className="h-14 px-4 flex items-center shadow-sm mb-4 sticky top-0 z-10"
      >
        <h1 className="font-bold text-lg">Admin Dashboard</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pt-0 pb-20">
          {loading && registrations.length === 0 ? (
             <div className="text-center py-10 opacity-50">Loading...</div>
          ) : registrations.length === 0 ? (
             <div className="text-center py-10 opacity-50 flex flex-col items-center">
                <FileText size={48} className="mb-4 opacity-20"/>
                <p>No registrations yet.</p>
                <p className="text-xs mt-2">Submit form in User App to see it here.</p>
             </div>
          ) : (
             registrations.map(reg => {
                 const data = reg.data || {};
                 // Try to find common fields for the Header
                 const name = data.name || data.fullname || data['Full Name'] || 'Unknown';
                 const email = data.email || data['Email'] || 'No Email';
                 const date = new Date(reg.created_at).toLocaleDateString();

                 return (
                     <div key={reg.id} className="mb-3 rounded-xl p-4 shadow-sm" style={{ backgroundColor: theme.surface }}>
                         <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-opacity-20" style={{ backgroundColor: theme.primary }}>
                                 {name[0].toUpperCase()}
                             </div>
                             <div>
                                 <h3 className="font-bold text-sm" style={{ color: theme.text }}>{name}</h3>
                                 <p className="text-xs opacity-70" style={{ color: theme.text }}>{email}</p>
                             </div>
                             <div className="ml-auto text-[10px] opacity-50" style={{ color: theme.text }}>{date}</div>
                         </div>
                         
                         {/* Expanded Data snippet */}
                         <div className="text-xs opacity-60 pl-13 pt-2 border-t border-black/5 mt-2" style={{ color: theme.text }}>
                             {Object.entries(data).slice(0, 5).map(([k, v]) => (
                                 <div key={k} className="flex gap-2 justify-between">
                                     <span className="font-semibold">{fieldMap[k] || k}:</span>
                                     <span className="truncate max-w-[150px] text-right">{String(v)}</span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 );
             })
          )}
      </div>
    </div>
  );
}
