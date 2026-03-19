"use client";

import Link from "next/link";
import { Plus, Smartphone } from "lucide-react";

export default function AppBuilderV2Index() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Builder V2</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered, config-driven Expo mobile app generator.
          </p>
        </div>
        <Link href="/dashboard/app-builder-v2/new">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Create New App
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
         <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer group h-[300px]">
             <Smartphone className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform text-gray-300 group-hover:text-blue-500" />
             <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">No Apps Yet</h3>
             <p className="text-sm mt-2 mb-6">Start building your first event app with AI.</p>
             <Link href="/dashboard/app-builder-v2/new">
               <button className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                 Start Generating
               </button>
             </Link>
         </div>
      </div>
    </div>
  );
}
