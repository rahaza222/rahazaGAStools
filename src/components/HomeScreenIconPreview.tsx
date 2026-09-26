import React, { useState } from 'react';
import { Smartphone, Check, Copy, Download, Shield, Bell, Sparkles, Layers, Eye } from 'lucide-react';
import { PwaConfig } from '../types';
import { createSVGString, base64EncodeSafe } from '../lib/utils';

interface HomeScreenIconPreviewProps {
  config: PwaConfig;
  onDownloadAsset?: (size: 192 | 512) => void;
}

export function HomeScreenIconPreview({ config, onDownloadAsset }: HomeScreenIconPreviewProps) {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [showMaskableSafeZone, setShowMaskableSafeZone] = useState<boolean>(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState<boolean>(true);
  const [wallpaper, setWallpaper] = useState<'aurora' | 'midnight' | 'minimal'>('aurora');
  const [copiedUri, setCopiedUri] = useState<boolean>(false);

  // Compute resolved icon source
  const getIconSource = () => {
    if (config.iconType === 'url' && config.iconUrl) {
      return { src: config.iconUrl, type: 'url', label: 'URL Eksternal' };
    }
    if (config.iconType === 'image' && config.icon192Src) {
      return { src: config.icon192Src, type: 'image', label: 'WebP Upload (192×192)' };
    }
    const svg = createSVGString(192, config.bgColor, config.themeColor, config.iconText || '?');
    const b64 = `data:image/svg+xml;base64,${base64EncodeSafe(svg)}`;
    return { src: b64, type: 'text', label: 'SVG Vector Inisial' };
  };

  const currentIcon = getIconSource();

  const handleCopyUri = () => {
    navigator.clipboard.writeText(currentIcon.src);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const wallpapers = {
    aurora: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)',
    midnight: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
    minimal: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h4 className="text-xs font-bold tracking-widest text-gray-900 uppercase flex items-center gap-2">
            <Smartphone className="text-blue-600 w-4 h-4" />
            Home Screen Icon Preview
          </h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Simulasi visual ikon PWA saat tampil di layar utama (beranda) smartphone
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* OS Switch */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setPlatform('android')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                platform === 'android' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Android (Squircle)
            </button>
            <button
              type="button"
              onClick={() => setPlatform('ios')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                platform === 'ios' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              iOS (Apple)
            </button>
          </div>

          {/* Maskable Safe-zone toggle */}
          <button
            type="button"
            onClick={() => setShowMaskableSafeZone(!showMaskableSafeZone)}
            title="Tampilkan lingkar safe-zone 80% (PWA Maskable Icon)"
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showMaskableSafeZone
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Safe Zone</span>
          </button>

          {/* Badge toggle */}
          <button
            type="button"
            onClick={() => setShowNotificationBadge(!showNotificationBadge)}
            title="Simulasikan badge notifikasi"
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showNotificationBadge
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Badge</span>
          </button>
        </div>
      </div>

      {/* Realistic Mobile Screen Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8 transition-all border border-slate-700/50 shadow-inner flex flex-col justify-between"
        style={{
          background: wallpapers[wallpaper],
          minHeight: '230px',
        }}
      >
        {/* Subtle top notification/status bar */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-white/80 pb-4 select-none">
          <span className="font-mono">09:41</span>
          <div className="flex items-center gap-2">
            <span>5G</span>
            <div className="w-4 h-2 border border-white/70 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Home Screen Icons Grid */}
        <div className="grid grid-cols-4 gap-4 sm:gap-6 items-end justify-items-center py-4">
          {/* THE GENERATED PWA ICON */}
          <div className="flex flex-col items-center group relative cursor-pointer">
            {/* The Icon Frame */}
            <div
              className={`relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
                platform === 'android'
                  ? 'w-16 h-16 sm:w-18 sm:h-18 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
                  : 'w-16 h-16 sm:w-18 sm:h-18 rounded-[18px] shadow-[0_8px_20px_rgba(0,0,0,0.45)]'
              }`}
              style={{
                backgroundColor: config.bgColor,
              }}
            >
              {/* Actual Image / SVG Icon */}
              <img
                src={currentIcon.src}
                alt="App Icon"
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Maskable Safe Zone Overlay (W3C standard: 80% circle safe area) */}
              {showMaskableSafeZone && (
                <div
                  className="absolute inset-[10%] rounded-full border-2 border-dashed border-yellow-300 pointer-events-none z-20 flex items-center justify-center bg-yellow-400/10"
                  title="W3C Maskable Icon Safe Zone (80%)"
                >
                  <span className="text-[8px] font-bold text-yellow-300 uppercase tracking-tighter opacity-80">
                    Safe
                  </span>
                </div>
              )}

              {/* Glossy specular reflection for iOS */}
              {platform === 'ios' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
              )}
            </div>

            {/* Notification Badge */}
            {showNotificationBadge && (
              <div className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-md border-2 border-slate-900 z-30 animate-pulse">
                1
              </div>
            )}

            {/* App Label */}
            <span className="text-[11px] font-medium text-white text-center mt-2 truncate max-w-[76px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] select-none">
              {config.shortName || config.name || 'App'}
            </span>
          </div>

          {/* Companion Mock Apps to give true home screen perspective */}
          <div className="flex flex-col items-center opacity-60 hover:opacity-80 transition-opacity">
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center text-white bg-gradient-to-tr from-red-500 via-yellow-500 to-green-500 shadow-md ${
                platform === 'android' ? 'rounded-[20px]' : 'rounded-[18px]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                G
              </div>
            </div>
            <span className="text-[11px] font-medium text-white/80 text-center mt-2 truncate max-w-[76px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Chrome
            </span>
          </div>

          <div className="flex flex-col items-center opacity-60 hover:opacity-80 transition-opacity">
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center text-white bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md ${
                platform === 'android' ? 'rounded-[20px]' : 'rounded-[18px]'
              }`}
            >
              <div className="text-xl">📷</div>
            </div>
            <span className="text-[11px] font-medium text-white/80 text-center mt-2 truncate max-w-[76px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Kamera
            </span>
          </div>

          <div className="flex flex-col items-center opacity-60 hover:opacity-80 transition-opacity">
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center text-white bg-gradient-to-tr from-sky-400 to-blue-600 shadow-md ${
                platform === 'android' ? 'rounded-[20px]' : 'rounded-[18px]'
              }`}
            >
              <div className="text-xl">🖼️</div>
            </div>
            <span className="text-[11px] font-medium text-white/80 text-center mt-2 truncate max-w-[76px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Foto
            </span>
          </div>
        </div>

        {/* Bottom Wallpaper Selector / Indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] text-white/60">
          <div className="flex items-center gap-2">
            <span>Wallpaper:</span>
            <button
              type="button"
              onClick={() => setWallpaper('aurora')}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                wallpaper === 'aurora' ? 'ring-2 ring-white border-transparent' : 'border-white/40'
              }`}
              style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)' }}
              title="Aurora"
            />
            <button
              type="button"
              onClick={() => setWallpaper('midnight')}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                wallpaper === 'midnight' ? 'ring-2 ring-white border-transparent' : 'border-white/40'
              }`}
              style={{ background: '#18181b' }}
              title="Midnight"
            />
            <button
              type="button"
              onClick={() => setWallpaper('minimal')}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                wallpaper === 'minimal' ? 'ring-2 ring-white border-transparent' : 'border-white/40'
              }`}
              style={{ background: '#334155' }}
              title="Slate Minimal"
            />
          </div>

          <span className="font-mono text-[9px] text-white/50">
            {platform === 'android' ? 'Android 14+ Adaptive Squircle' : 'iOS 18 Squircle'}
          </span>
        </div>
      </div>

      {/* Technical Spec & Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tipe:</span>
          <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-semibold text-[11px] border border-blue-100">
            {currentIcon.label}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] text-gray-500 font-mono">
            Ukuran PWA: 192×192 & 512×512 px
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyUri}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUri ? 'Data URI Tersalin' : 'Salin Data URI'}
          </button>

          {config.iconType === 'image' && onDownloadAsset && config.icon192Src && (
            <button
              type="button"
              onClick={() => onDownloadAsset(192)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Icon 192px
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
