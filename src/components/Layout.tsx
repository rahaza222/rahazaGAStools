import React, { useState } from 'react';
import { 
  AppWindow, Smartphone, BookOpen, Menu, Sparkles, ExternalLink, Crown 
} from 'lucide-react';
import { View } from '../types';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
  isPro: boolean;
  onOpenUpgradeModal: () => void;
  onOpenAdminPortal?: () => void;
}

export function Layout({ 
  currentView, 
  setView, 
  children,
  isPro,
  onOpenUpgradeModal,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'generator', label: 'Generator XML', icon: AppWindow, desc: 'Konfigurasi & Generate Tema Blogger' },
    { id: 'simulator', label: 'Simulator Mobile', icon: Smartphone, desc: 'Pratinjau Layar HP & Home Screen' },
    { id: 'guide', label: 'Panduan Pasang', icon: BookOpen, desc: 'Langkah Pasang di Blogger.com' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col antialiased">
      {/* Background ambient accents */}
      <div className="fixed top-[-10%] left-[-5%] w-[450px] h-[450px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="h-[64px] shrink-0 border-b border-gray-200 sticky top-0 flex items-center justify-between px-4 sm:px-8 bg-white/90 backdrop-blur-md z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm text-white">
            <AppWindow className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900 tracking-tight leading-tight">
                Rahaza PWA XML
              </h1>
              {isPro ? (
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                  <Crown className="w-3 h-3" />
                  PRO ACTIVE
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  FREE PLAN
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Ubah WebApp Google Apps Script Menjadi Aplikasi PWA Siap Pasang di Blogger
            </p>
          </div>
        </div>

        {/* Desktop Quick Nav Tabs in Header */}
        <div className="hidden md:flex items-center space-x-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {isPro ? (
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 font-bold text-xs hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Member PRO</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                LIFETIME
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Upgrade PRO</span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-amber-800/60 px-2 py-0.5 rounded text-[10px]">
                <span className="line-through opacity-75">Rp 49rb</span>
                <span className="text-yellow-200 font-extrabold">Rp 15rb</span>
              </span>
            </button>
          )}

          <a
            href="https://www.blogger.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors font-medium text-xs bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
          >
            <span>Blogger.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Navigation Drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <aside
          className={`fixed md:hidden inset-y-0 left-0 w-[260px] border-r border-gray-200 flex flex-col p-6 space-y-4 bg-white z-50 transform transition-transform duration-200 shadow-xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
              R
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900">Rahaza PWA</div>
              <div className="text-[10px] text-gray-500">
                {isPro ? '👑 PRO Lifetime Active' : 'Free Version'}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id as View);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal text-gray-400">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Upgrade in Mobile Nav */}
          <div className="pt-2">
            {!isPro ? (
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  onOpenUpgradeModal();
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade ke PRO (Rp 15rb Promo)</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Lisensi PRO Aktif Seumur Hidup</span>
              </div>
            )}
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-9 shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 flex items-center justify-between text-[11px] text-gray-500 z-20">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">Rahaza PWA XML Suite</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline text-gray-500">
            {isPro ? 'Versi PRO White-Label Aktif' : 'Free Version • Tersedia Upgrade PRO'}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-gray-400 font-mono text-[10px]">
            v2.1 PRO-ENGINE
          </span>
        </div>
      </footer>
    </div>
  );
}
