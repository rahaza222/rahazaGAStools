import React from 'react';
import { AppWindow } from 'lucide-react';
import { View } from '../types';

interface DashboardProps {
  setView: (view: View) => void;
}

export function Dashboard({ setView }: DashboardProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">Dashboard Workspace</h3>
      <div className="max-w-xl">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-gray-200 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-[50px] pointer-events-none" />
          <h5 className="text-xs font-bold tracking-widest text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <AppWindow className="text-indigo-600 w-5 h-5" />
            PWA XML Generator
          </h5>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Ubah WebApp GAS menjadi aplikasi yang bisa diinstall di beranda (PWA) melalui inject template XML Blogger.
          </p>
          <button
            onClick={() => setView('pwa')}
            className="w-full py-3 bg-white text-gray-700 border border-gray-200 text-xs font-bold tracking-[0.2em] rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
          >
            Buka XML Generator
          </button>
        </div>
      </div>
    </div>
  );
}
