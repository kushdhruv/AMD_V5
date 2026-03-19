import React from 'react';

export default function AdminOverview({ params }: { params: { appId: string } }) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-neutral-400 mt-2">Manage live data for your event app in real-time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Total Stalls</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Pending Songs</h3>
          <p className="text-3xl font-bold text-amber-500">8</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Active Announcements</h3>
          <p className="text-3xl font-bold">4</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Registered Teams</h3>
          <p className="text-3xl font-bold">42</p>
        </div>
      </div>

      <div className="mt-12 bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-xl font-bold mb-2">Sync Engine is Active</h2>
        <p className="text-neutral-400 max-w-md mx-auto">
          Any changes you make in the tabs on the left will instantly sync to your users' mobile apps via the SQLite sync engine.
        </p>
      </div>
    </div>
  );
}
