"use client";
import React, { useState } from 'react';

const INITIAL_TEAMS = [
  { id: '1', rank: 1, name: 'HabitatAI', college: 'VJTI', score: 2450, track: 'AI/ML' },
  { id: '2', rank: 2, name: 'HealthBot', college: 'SPIT', score: 2210, track: 'Healthcare Tech' },
  { id: '3', rank: 3, name: 'Edumate', college: 'ICT', score: 1980, track: 'EdTech' },
];

export default function LeaderboardAdminPage() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);

  const incrementScore = (id: string, amount: number) => {
    setTeams([...teams.map(t => t.id === id ? { ...t, score: t.score + amount } : t)]
      .sort((a, b) => b.score - a.score)
      .map((t, idx) => ({ ...t, rank: idx + 1 }))
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard Scores</h1>
          <p className="text-neutral-400 mt-1">Update scores and the app will re-render podiums instantly via sync.</p>
        </div>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium w-16">Rank</th>
              <th className="px-6 py-4 font-medium">Team Name</th>
              <th className="px-6 py-4 font-medium">Track</th>
              <th className="px-6 py-4 font-medium">Score</th>
              <th className="px-6 py-4 font-medium text-right">Quick Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-neutral-800/50">
                <td className="px-6 py-4 font-bold text-xl text-neutral-300 text-center">
                  #{team.rank}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{team.name}</div>
                  <div className="text-neutral-400 text-xs mt-1">{team.college}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded text-xs">
                    {team.track}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xl text-blue-400 font-bold">{team.score}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => incrementScore(team.id, 50)} className="bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/30 px-3 py-1 rounded text-xs font-bold mr-2">
                    +50
                  </button>
                  <button onClick={() => incrementScore(team.id, 100)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold">
                    +100
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
