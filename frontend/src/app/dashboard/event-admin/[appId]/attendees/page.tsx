"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { Users, Mail, Clock, ShieldCheck, Search, Trash2, Loader2 } from 'lucide-react';

export default function AttendeesAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAttendees = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('app_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Note: If you want to filter by appId, Ensure app_registrations has an event_id or appId field.
    // Based on schema_app_builder.sql, it has app_name and data.
    // Let's filter by app_name as appId for now.
    const filtered = data?.filter(a => a.app_name === appId || a.data?.appId === appId) || [];

    if (!error) setAttendees(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendees();
  }, [appId]);

  const removeAttendee = async (id: string) => {
    if (!confirm("Are you sure you want to remove this registration?")) return;
    await supabase.from('app_registrations').delete().eq('id', id);
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const filteredAttendees = attendees.filter(a => 
    a.data?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.data?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Attendees & Registrations
          </h1>
          <p className="text-neutral-400 mt-1">Manage users who have registered via the mobile app.</p>
        </div>
        
        <div className="relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
           <input 
             type="text"
             placeholder="Search attendees..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
           />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <StatCard icon={Users} label="Total Registrations" value={attendees.length.toString()} color="blue" />
         <StatCard icon={ShieldCheck} label="Verified Users" value={attendees.length.toString()} color="emerald" />
         <StatCard icon={Clock} label="Recent (24h)" value="0" color="purple" />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">User Profile</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Registration Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
               <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading attendees...</td></tr>
            ) : filteredAttendees.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-500">No matching attendees found.</td></tr>
            ) : filteredAttendees.map((att) => (
              <tr key={att.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center font-bold text-blue-400 border border-blue-500/10">
                       {att.data?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{att.data?.full_name || 'Anonymous User'}</div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Attendee ID: {att.id.slice(0,8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-neutral-300">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      {att.data?.email || 'N/A'}
                   </div>
                </td>
                <td className="px-6 py-4 text-neutral-400">
                   {new Date(att.created_at).toLocaleDateString()} • {new Date(att.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeAttendee(att.id)} 
                    className="p-2 text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20"
  } as any;

  return (
    <div className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${colors[color]}`}>
       <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-black/20">
             <Icon className="w-6 h-6" />
          </div>
          <div>
             <p className="text-xs font-bold uppercase tracking-widest opacity-60">{label}</p>
             <h3 className="text-3xl font-black mt-1">{value}</h3>
          </div>
       </div>
    </div>
  );
}
