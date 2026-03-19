"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';

export default function StallsAdminPage() {
  const params = useParams();
  const appId = params?.appId as string;
  
  const [stalls, setStalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStalls = async () => {
    if (!appId) return;
    const { data, error } = await supabase
      .from('stalls')
      .select('*')
      .eq('event_id', appId)
      .order('is_featured', { ascending: false });

    if (!error && data) setStalls(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStalls();
  }, [appId]);

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    // 1. Optimistic Update
    setStalls(stalls.map(s => s.id === id ? { ...s, is_featured: !currentStatus } : s));
    // 2. Network Update
    await supabase.from('stalls').update({ is_featured: !currentStatus }).eq('id', id);
  };

  const addMockStall = async () => {
    if (!appId) return;
    const newStall = {
      event_id: appId,
      name: `New Stall ${Math.floor(Math.random() * 1000)}`,
      category: 'Food',
      price_range: '₹100-200',
      is_featured: false,
      emoji: '🌭'
    };
    const { data, error } = await supabase.from('stalls').insert([newStall]).select();
    if (!error && data) {
      setStalls([data[0], ...stalls]);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Stalls & Menu Management</h1>
          <p className="text-neutral-400 mt-1">Control the stalls appearing in the Explore tab.</p>
        </div>
        <button 
          onClick={addMockStall}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Stall
        </button>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">Stall Name</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price Range</th>
              <th className="px-6 py-4 font-medium">Featured</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Loading stalls...</td></tr>
            ) : stalls.map((stall) => (
              <tr key={stall.id} className="hover:bg-neutral-800/50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <span className="text-2xl">{stall.emoji}</span>
                  <span className="font-medium">{stall.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-xs">
                    {stall.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-400">{stall.price_range}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleFeatured(stall.id, stall.is_featured)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${stall.is_featured ? 'bg-blue-600' : 'bg-neutral-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${stall.is_featured ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-400 hover:text-blue-300 font-medium mr-4">Edit Menu</button>
                  <button onClick={async () => {
                    setStalls(stalls.filter(s => s.id !== stall.id));
                    await supabase.from('stalls').delete().eq('id', stall.id);
                  }} className="text-red-400 hover:text-red-300 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {stalls.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            No stalls found. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
