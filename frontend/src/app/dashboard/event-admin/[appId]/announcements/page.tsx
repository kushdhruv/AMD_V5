"use client";
import React, { useState } from 'react';

const INITIAL_ALERTS = [
  { id: '1', title: 'Schedule Change', body: 'Hackathon hacking phase extended by 2 hours!', type: 'Alert', pinned: true, time: '2 mins ago' },
  { id: '2', title: 'Lunch Served', body: 'Head over to the cafeteria, lunch is now being served.', type: 'Update', pinned: false, time: '1 hour ago' },
];

export default function AnnouncementsAdminPage() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const togglePin = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Announcements & Push</h1>
          <p className="text-neutral-400 mt-1">Send real-time updates to all app users instantly.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + New Announcement
        </button>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="px-6 py-4 font-medium">Message</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Pinned</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-neutral-800/50">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{alert.title}</div>
                  <div className="text-neutral-400 text-xs mt-1 truncate max-w-xs">{alert.body}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium border
                    ${alert.type === 'Alert' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-neutral-800 text-neutral-300 border-neutral-700'}
                  `}>
                    {alert.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-400">{alert.time}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => togglePin(alert.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${alert.pinned ? 'bg-amber-500' : 'bg-neutral-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${alert.pinned ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => removeAlert(alert.id)} className="text-red-400 hover:text-red-300 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
