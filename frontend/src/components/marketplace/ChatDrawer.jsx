"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/supabase-client';
import { MessageSquare, X, Send, User, CheckCircle2, Loader2, IndianRupee, ChevronLeft, ExternalLink, Sparkles } from 'lucide-react';
import { fetchUserConnections, fetchMessages, sendMessage, acceptConnection } from '@/lib/supabase/marketplace-v2';
import { useRouter } from 'next/navigation';

export default function ChatDrawer({ isOpen, onClose }) {
    const [connections, setConnections] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // connection object
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const scrollRef = useRef();
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            loadAllData();
        }
    }, [isOpen]);

    const loadAllData = async () => {
        setLoading(true);
        
        // Show demo connections immediately for instant feel
        const demoConns = [
            {
                id: 'demo-conn-1',
                sender_id: 'demo-1',
                receiver_id: 'current-user', 
                status: 'accepted',
                initial_message: "Hi! I'm interested in your SaaS Analytics project. Can we discuss?",
                created_at: new Date(Date.now() - 86400000).toISOString(),
                sender: { id: 'demo-1', full_name: 'Ananya Sharma', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
                receiver: { id: 'current-user', full_name: 'You', avatar_url: '' }
            },
            {
                id: 'demo-conn-2',
                sender_id: 'demo-2',
                receiver_id: 'current-user',
                status: 'pending',
                initial_message: "Hello! Can you help me with a mobile app UI design?",
                created_at: new Date(Date.now() - 3600000).toISOString(),
                sender: { id: 'demo-2', full_name: 'Marcus Chen', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                receiver: { id: 'current-user', full_name: 'You', avatar_url: '' }
            }
        ];
        setConnections(demoConns);

        try {
            // Fetch user and connections in parallel
            const [{ data: { user } }] = await Promise.all([
                supabase.auth.getUser()
            ]);
            
            if (user) {
                setCurrentUser(user);
                const { data } = await fetchUserConnections(user.id);
                setConnections([...demoConns, ...(data || [])]);
            }
        } catch (error) {
            console.error("Error loading chat data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeChat) {
            loadMessages();
            // Subscribe to new messages
            const channel = supabase
                .channel(`messages:${activeChat.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'marketplace_messages',
                    filter: `connection_id=eq.${activeChat.id}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [activeChat]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadMessages = async () => {
        // Mock messages for demo connections
        const isDemo = activeChat && (activeChat.sender_id?.toString().startsWith('demo-') || activeChat.receiver_id?.toString().startsWith('demo-'));
        
        if (isDemo) {
            const mockMsgs = [
                {
                    id: 'm1',
                    sender_id: activeChat.sender_id,
                    content: activeChat.initial_message || "Hi, I'm interested in your services!",
                    created_at: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: 'm2',
                    sender_id: activeChat.receiver_id,
                    content: "Hello! I'd be happy to help. What kind of project do you have in mind?",
                    created_at: new Date(Date.now() - 3000000).toISOString()
                },
                {
                    id: 'm3',
                    sender_id: activeChat.sender_id,
                    content: "I need a professional event website for a tech conference coming up in 2 months. Can you handle the AI integration part?",
                    created_at: new Date(Date.now() - 2400000).toISOString()
                },
                {
                    id: 'm4',
                    sender_id: activeChat.receiver_id,
                    content: "Absolutely! I specialize in AI-driven experiences. We can definitely build something state-of-the-art for your conference.",
                    created_at: new Date(Date.now() - 1800000).toISOString()
                }
            ];
            setMessages(mockMsgs);
            return;
        }

        const { data } = await fetchMessages(activeChat.id);
        setMessages(data || []);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        // Check limits if pending
        if (activeChat.status === 'pending') {
            const mySentMessages = messages.filter(m => m.sender_id === activeChat.sender_id);
            if (mySentMessages.length >= 2) {
                alert("You can only send 2 messages before the connection is accepted.");
                return;
            }
        }

        const msg = newMessage;
        setNewMessage("");

        if (activeChat.id.startsWith('demo-')) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender_id: currentUser?.id || 'me',
                content: msg,
                created_at: new Date().toISOString()
            }]);
            return;
        }

        await sendMessage(activeChat.id, msg);
    };

    const handleAccept = async (connId) => {
        await acceptConnection(connId);
        loadAllData();
        if (activeChat?.id === connId) {
            setActiveChat(prev => ({ ...prev, status: 'accepted' }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-neutral-900 border-l border-white/10 z-[110] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <MessageSquare size={20} />
                    </div>
                    <h2 className="font-bold text-white">Marketplace Messages</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-neutral-500 transition">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Connections List */}
                {!activeChat ? (
                    <div className="w-full overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        <div className="px-2 py-4">
                            <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Sparkles size={12} className="text-primary" /> Active Conversations
                                </span>
                                {loading && <Loader2 size={12} className="animate-spin text-primary" />}
                            </h3>
                            {connections.length === 0 && !loading && (
                                <div className="py-20 text-center text-neutral-600 px-8">
                                    <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 opacity-50">
                                        <MessageSquare size={32} />
                                    </div>
                                    <p className="text-sm font-medium">No conversations yet.</p>
                                    <p className="text-[10px] mt-1">Connect with freelancers to start chatting!</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                {connections.map(conn => {
                                    const isDemo = conn.id.startsWith('demo-');
                                    const other = isDemo 
                                        ? conn.sender 
                                        : (conn.sender_id === currentUser?.id ? conn.receiver : conn.sender);

                                    if (!other && !isDemo) return null;
                                    const displayName = isDemo ? other.full_name : (other?.full_name || 'User');
                                    const displayAvatar = other?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

                                    return (
                                        <div key={conn.id} className="relative group">
                                            <button 
                                                onClick={() => setActiveChat(conn)}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5 bg-neutral-900/30 group text-left"
                                            >
                                                <div 
                                                    className="relative shrink-0 cursor-pointer hover:scale-105 transition active:scale-95"
                                                    onClick={(e) => {
                                                        if (other?.id) {
                                                            e.stopPropagation();
                                                            router.push(`/dashboard/marketplace/${other.id}`);
                                                            onClose();
                                                        }
                                                    }}
                                                >
                                                    <img src={displayAvatar} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-lg" />
                                                    {conn.status === 'accepted' && (
                                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-neutral-900" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{displayName}</span>
                                                        <span className="text-[9px] text-neutral-500 font-black uppercase tracking-tighter tabular-nums">
                                                            {new Date(conn.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs text-neutral-500 truncate">{conn.initial_message || "Start of conversation"}</p>
                                                        {conn.status === 'pending' && <span className="shrink-0 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest">New</span>}
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Chat View */
                    <div className="w-full flex flex-col bg-black/40">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between bg-neutral-900 sticky top-0 z-10 shadow-lg">
                            <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/5 rounded-lg text-primary transition">
                                <ChevronLeft size={20} />
                            </button>
                            
                            <div 
                                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition"
                                onClick={() => {
                                    const isDemo = activeChat.id.startsWith('demo-');
                                    const other = isDemo ? activeChat.sender : (activeChat.sender_id === currentUser?.id ? activeChat.receiver : activeChat.sender);
                                    if (other?.id) {
                                        router.push(`/dashboard/marketplace/${other.id}`);
                                        onClose();
                                    }
                                }}
                            >
                                {(() => {
                                    const isDemo = activeChat.id.startsWith('demo-');
                                    const other = isDemo ? activeChat.sender : (activeChat.sender_id === currentUser?.id ? activeChat.receiver : activeChat.sender);
                                    const displayName = isDemo ? other.full_name : (other?.full_name || 'User');
                                    const displayAvatar = other?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
                                    
                                    return (
                                        <>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <img src={displayAvatar} className="w-6 h-6 rounded-lg object-cover border border-white/10" />
                                                <span className="text-[11px] font-black text-white hover:text-primary transition-colors">{displayName}</span>
                                            </div>
                                            <span className="text-[8px] text-neutral-500 uppercase font-bold tracking-[0.2em]">
                                                {activeChat.status === 'accepted' ? '● Connected' : '○ Connection Pending'}
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                            
                            <div className="w-10 flex justify-end">
                                <button className="p-2 text-neutral-500 hover:text-white transition">
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Connection Acceptance Notification */}
                        {activeChat.status === 'pending' && activeChat.receiver_id === activeChat.my_id && (
                            <div className="p-4 bg-primary/10 border-b border-primary/20 flex flex-col items-center gap-3 text-center">
                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">New Connection Request</p>
                                <p className="text-xs text-white px-4">"{activeChat.initial_message}"</p>
                                <button 
                                    onClick={() => handleAccept(activeChat.id)}
                                    className="px-4 py-2 bg-primary text-white text-[10px] font-black rounded-lg hover:scale-105 transition shadow-lg shadow-primary/20"
                                >
                                    ACCEPT CONNECTION
                                </button>
                            </div>
                        )}

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-neutral-950/20">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === currentUser?.id || msg.sender_id?.startsWith('me') || (msg.sender_id !== activeChat.sender_id && !activeChat.id.startsWith('demo-'));
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-[22px] text-[13px] leading-snug shadow-sm ${
                                            isMe 
                                                ? 'bg-primary text-white rounded-br-none shadow-primary/10' 
                                                : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-white/5'
                                        }`}>
                                            {msg.content}
                                            <span className={`block text-[9px] mt-1.5 font-bold tabular-nums ${isMe ? 'text-white/60' : 'text-neutral-500'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-neutral-900">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={activeChat.status === 'accepted' ? "Type a message..." : "Purpose of connection..."}
                                    className="flex-1 bg-neutral-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary transition"
                                />
                                <button 
                                    type="submit"
                                    disabled={!newMessage.trim() || (activeChat.status === 'pending' && messages.length >= 2)}
                                    className="p-2 bg-primary text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-30 shadow-lg shadow-primary/20"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                            {activeChat.status === 'pending' && (
                                <p className="text-[8px] text-neutral-600 mt-2 text-center uppercase font-bold tracking-widest">
                                    Limit: 2 messages until connected
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

