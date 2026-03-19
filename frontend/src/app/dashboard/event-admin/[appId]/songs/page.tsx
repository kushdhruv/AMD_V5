"use client";
import React, { useState } from 'react';

const INITIAL_SONGS = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', requestedBy: 'Dhruv P.', votes: 42, status: 'playing' },
  { id: '2', title: 'Kesariya', artist: 'Arijit Singh', requestedBy: 'Priya M.', votes: 38, status: 'queued' },
  { id: '3', title: 'Levitating', artist: 'Dua Lipa', requestedBy: 'Rahul S.', votes: 27, status: 'queued' },
];

export default function SongsAdminPage() {
  const [songs, setSongs] = useState(INITIAL_SONGS);

  const setPlaying = (id: string) => {
    setSongs(songs.map(s => {
      if (s.id === id) return { ...s, status: 'playing' };
      if (s.status === 'playing') return { ...s, status: 'played' };
      return s;
    }));
  };

  const removeSong = (id: string) => {
    setSongs(songs.filter(s => s.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">DJ Song Queue</h1>
        <p className="text-neutral-400 mt-1">Manage song requests and what's currently playing.</p>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">Song Title</th>
              <th className="px-6 py-4 font-medium">Requested By</th>
              <th className="px-6 py-4 font-medium">Votes</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {songs.map((song) => (
              <tr key={song.id} className="hover:bg-neutral-800/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{song.title}</div>
                  <div className="text-neutral-400 text-xs mt-1">{song.artist}</div>
                </td>
                <td className="px-6 py-4 text-neutral-300">{song.requestedBy}</td>
                <td className="px-6 py-4">
                  <span className="font-mono text-blue-400 font-bold">{song.votes}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider
                    ${song.status === 'playing' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      song.status === 'queued' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                      'bg-neutral-800 text-neutral-400 border border-neutral-700'}
                  `}>
                    {song.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {song.status === 'queued' && (
                    <button 
                      onClick={() => setPlaying(song.id)}
                      className="text-green-400 hover:text-green-300 font-medium mr-4"
                    >
                      ▶ Play Next
                    </button>
                  )}
                  <button 
                    onClick={() => removeSong(song.id)}
                    className="text-red-400 hover:text-red-300 font-medium"
                  >
                    Delete
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
