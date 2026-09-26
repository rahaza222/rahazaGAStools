import React, { useState } from 'react';
import { Smartphone, RefreshCw, ExternalLink, ShieldCheck, Download, Sparkles, X, Check } from 'lucide-react';
import { PwaConfig } from '../types';
import { createSVGString, base64EncodeSafe } from '../lib/utils';

interface PwaSimulatorProps {
  config: PwaConfig;
}

export function PwaSimulator({ config }: PwaSimulatorProps) {
  const [deviceMode, setDeviceMode] = useState<'iphone' | 'android'>('android');
  const [previewTab, setPreviewTab] = useState<'app' | 'homescreen' | 'splash'>('app');
  const [key, setKey] = useState(0);

  // In-app install banner simulator state
  const [showBanner, setShowBanner] = useState(true);
  const [showNativeInstallDialog, setShowNativeInstallDialog] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isSimulatedInstalled, setIsSimulatedInstalled] = useState(false);

  const getIconSrc = () => {
    if (config.iconType === 'url' && config.iconUrl) return config.iconUrl;
    if (config.iconType === 'image' && config.icon192Src) return config.icon192Src;
    const svg = createSVGString(192, config.bgColor, config.themeColor, config.iconText || '?');
    return `data:image/svg+xml;base64,${base64EncodeSafe(svg)}`;
  };

  const iconSrc = getIconSrc();

  const handleInstallClick = () => {
    if (deviceMode === 'iphone') {
      setShowIosModal(true);
    } else {
      setShowNativeInstallDialog(true);
    }
  };

  const handleConfirmInstall = () => {
    setShowNativeInstallDialog(false);
    setShowBanner(false);
    setIsSimulatedInstalled(true);
    setTimeout(() => {
      setPreviewTab('homescreen');
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Mobile PWA Simulator</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Uji coba tampilan WebApp dan interaksi <strong>Tombol Install PWA</strong> di smartphone
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switch */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium">
            <button
              onClick={() => { setDeviceMode('android'); setShowIosModal(false); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                deviceMode === 'android' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => { setDeviceMode('iphone'); setShowNativeInstallDialog(false); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                deviceMode === 'iphone' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              iOS / iPhone
            </button>
          </div>

          {/* View Tab */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium">
            <button
              onClick={() => setPreviewTab('app')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                previewTab === 'app' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aplikasi &amp; Banner
            </button>
            <button
              onClick={() => setPreviewTab('homescreen')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                previewTab === 'homescreen' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home Screen
            </button>
            <button
              onClick={() => { setPreviewTab('splash'); setKey(k => k + 1); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                previewTab === 'splash' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Splash
            </button>
          </div>

          <button
            onClick={() => {
              setKey(k => k + 1);
              setShowBanner(true);
              setShowNativeInstallDialog(false);
              setShowIosModal(false);
              setIsSimulatedInstalled(false);
            }}
            title="Reset Simulator"
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Device Frame */}
      <div className="flex flex-col items-center justify-center py-2">
        <div
          className={`relative border-[10px] ${
            deviceMode === 'iphone' ? 'border-gray-900 rounded-[50px]' : 'border-slate-800 rounded-[38px]'
          } bg-black shadow-2xl overflow-hidden transition-all duration-300 w-[360px] h-[680px] flex flex-col`}
          style={{
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Status Bar */}
          <div
            className="h-7 w-full flex items-center justify-between px-6 text-[10px] font-semibold text-white select-none z-30 transition-colors duration-200"
            style={{ backgroundColor: previewTab === 'app' ? config.themeColor : '#000000' }}
          >
            <span>09:41</span>
            {deviceMode === 'iphone' && (
              <div className="w-24 h-4 bg-black rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2" />
            )}
            {deviceMode === 'android' && (
              <div className="w-3 h-3 bg-black rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
            )}
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-4 h-2 border border-white rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-white rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-900 flex flex-col">
            {previewTab === 'app' && (
              <div key={key} className="w-full h-full relative flex flex-col">
                {/* Iframe or Mock */}
                {config.url && config.url.startsWith('http') ? (
                  <iframe
                    src={config.url}
                    title="GAS WebApp Preview"
                    className="w-full h-full border-0 bg-white"
                    allow="camera; microphone; geolocation; display-capture; autoplay"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-800">
                    <div
                      className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: config.bgColor, color: config.themeColor }}
                    >
                      <img src={iconSrc} alt="App Icon" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <h3 className="font-bold text-base mb-1">{config.name || 'Nama WebApp'}</h3>
                    <p className="text-xs text-slate-400 mb-6">{config.desc || 'Deskripsi singkat WebApp'}</p>
                    <div className="bg-slate-700/60 p-3 rounded-xl text-left text-[11px] text-slate-300 w-full space-y-1">
                      <div className="text-blue-400 font-bold uppercase tracking-wider text-[9px]">Status Pratinjau</div>
                      <div>Isi URL Google Apps Script yang valid pada tab Generator untuk memuat WebApp langsung di sini.</div>
                    </div>
                  </div>
                )}

                {/* Simulated Floating PWA Install Banner inside the phone */}
                {config.enableInstallPrompt && !isSimulatedInstalled && showBanner && (
                  <div className="absolute bottom-4 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center justify-between gap-2.5 z-40 animate-in slide-in-from-bottom-2 duration-300">
                    <img
                      src={iconSrc}
                      alt="App Icon"
                      className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-xs"
                      style={{ backgroundColor: config.bgColor }}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-bold text-gray-900 truncate">
                        {config.name || 'Aplikasi PWA'}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        Pasang di Beranda HP Anda
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={handleInstallClick}
                        className="px-3 py-1.5 text-white text-[11px] font-bold rounded-lg shadow-xs cursor-pointer transition-transform active:scale-95"
                        style={{ backgroundColor: config.themeColor || '#2563EB' }}
                      >
                        {config.installButtonText || 'Install'}
                      </button>
                      <button
                        onClick={() => setShowBanner(false)}
                        aria-label="Tutup banner"
                        className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Simulated Mini Install Button if banner is dismissed */}
                {config.enableInstallPrompt && !isSimulatedInstalled && !showBanner && (
                  <button
                    onClick={handleInstallClick}
                    className="absolute bottom-4 right-4 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 z-40 animate-in fade-in"
                    style={{ backgroundColor: config.themeColor || '#2563EB' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{config.installButtonText || 'Install'}</span>
                  </button>
                )}

                {/* Simulated Android Native Install Confirmation Modal */}
                {showNativeInstallDialog && (
                  <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
                    <div className="bg-white rounded-2xl p-5 w-full max-w-[280px] shadow-2xl text-center space-y-3">
                      <div
                        className="w-14 h-14 rounded-2xl mx-auto overflow-hidden shadow-md"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <img src={iconSrc} alt="Icon" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">
                          Install {config.name || 'Aplikasi'}?
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Aplikasi akan ditambahkan ke layar utama smartphone Anda.
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setShowNativeInstallDialog(false)}
                          className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleConfirmInstall}
                          className="flex-1 py-2 text-xs font-bold text-white rounded-xl shadow-xs"
                          style={{ backgroundColor: config.themeColor || '#2563EB' }}
                        >
                          Install
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated iOS Safari Install Sheet Modal */}
                {showIosModal && (
                  <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end animate-in fade-in">
                    <div className="bg-white rounded-t-3xl p-5 text-center space-y-3 shadow-2xl animate-in slide-in-from-bottom">
                      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
                      <div
                        className="w-12 h-12 rounded-xl mx-auto overflow-hidden shadow-sm"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <img src={iconSrc} alt="Icon" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900">
                        Pasang di iPhone / iPad
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-relaxed text-left bg-gray-50 p-3 rounded-xl border border-gray-100">
                        1. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah browser Safari.<br/>
                        2. Gulir ke bawah dan ketuk <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                      </p>
                      <button
                        onClick={() => {
                          setShowIosModal(false);
                          setShowBanner(false);
                          setIsSimulatedInstalled(true);
                          setPreviewTab('homescreen');
                        }}
                        className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
                      >
                        Simulasikan Terpasang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {previewTab === 'homescreen' && (
              <div
                className="w-full h-full relative p-6 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                }}
              >
                {/* Apps Grid */}
                <div className="grid grid-cols-4 gap-4 pt-6">
                  {/* The Generated PWA App Icon */}
                  <div
                    onClick={() => setPreviewTab('app')}
                    className="flex flex-col items-center group cursor-pointer animate-pulse"
                    title="Klik untuk membuka aplikasi PWA"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border border-white/20 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: config.bgColor }}
                    >
                      <img src={iconSrc} alt="PWA Icon" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-medium text-white mt-1.5 text-center truncate max-w-[64px] drop-shadow-sm">
                      {config.shortName || 'App'}
                    </span>
                  </div>

                  {/* Dummy icons to simulate real phone */}
                  {['Galeri', 'Kamera', 'Pesan'].map((name, i) => (
                    <div key={i} className="flex flex-col items-center opacity-40">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                        {name[0]}
                      </div>
                      <span className="text-[11px] font-medium text-white/70 mt-1.5 text-center truncate max-w-[64px]">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Installation status note */}
                <div className="bg-white/95 backdrop-blur-md text-gray-900 p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900">Aplikasi Terpasang</div>
                    <div className="text-[10px] text-gray-500">Ikon siap dibuka dari beranda smartphone</div>
                  </div>
                  <button
                    onClick={() => setPreviewTab('app')}
                    className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                  >
                    Buka App
                  </button>
                </div>
              </div>
            )}

            {previewTab === 'splash' && (
              <div
                key={key}
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
                style={{ backgroundColor: config.bgColor }}
              >
                <div className="animate-pulse flex flex-col items-center">
                  <div
                    className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl mb-6 flex items-center justify-center border border-white/10"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <img src={iconSrc} alt="Splash Icon" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{config.name || 'Aplikasi PWA'}</h3>
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mt-4" />
                </div>
                <div className="absolute bottom-10 text-[11px] text-white/50 font-mono tracking-widest uppercase">
                  Powered by Rahaza PWA
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator / Nav Bar */}
          <div className="h-6 w-full bg-black flex items-center justify-center">
            {deviceMode === 'iphone' ? (
              <div className="w-32 h-1 bg-white/50 rounded-full" />
            ) : (
              <div className="flex gap-12 items-center">
                <div className="w-3 h-3 border-2 border-white/40 rounded-full" />
                <div className="w-3 h-3 border-2 border-white/40 rounded-sm" />
                <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-white/40 transform -rotate-45" />
              </div>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 <strong>Tips:</strong> Klik tombol <strong>&quot;{config.installButtonText || 'Install'}&quot;</strong> pada layar ponsel di atas untuk menguji coba dialog konfirmasi instalasi Android atau panduan iPhone.
        </p>
      </div>
    </div>
  );
}
