import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and running standalone, do not show install CTA
  if (isInstalled) {
    if (variant === 'drawer') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aplikasi Terpasang (PWA)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowGuide(true);
    }
  };

  const buttonContent = (
    <>
      <Download className={`w-3.5 h-3.5 ${isInstalling ? 'animate-bounce' : ''}`} />
      <span>{variant === 'drawer' ? 'Install Aplikasi ke HP / Desktop' : 'Install App'}</span>
    </>
  );

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          type="button"
          title="Install WebApp Merger & PWA Suite sebagai aplikasi standalone"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow transition-all cursor-pointer ${className}`}
        >
          {buttonContent}
        </button>
      )}

      {variant === 'drawer' && (
        <button
          onClick={handleInstallClick}
          type="button"
          className={`w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${className}`}
        >
          {buttonContent}
        </button>
      )}

      {variant === 'card' && (
        <button
          onClick={handleInstallClick}
          type="button"
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${className}`}
        >
          {buttonContent}
        </button>
      )}

      {/* Guide Modal for iOS Safari / Unsupported ambient prompt */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Pasang Aplikasi ke Perangkat
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Nikmati akses cepat tanpa membuka browser berulang kali
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-gray-700">
              {isIOS ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <span>Panduan untuk iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="space-y-2 text-gray-600 list-decimal list-inside leading-relaxed">
                    <li className="flex items-start gap-2">
                      <Share2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Tekan tombol <strong>Bagikan (Share)</strong> di bar navigasi bawah Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <PlusSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
                    </li>
                    <li>
                      Tekan <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi akan langsung terpasang di layar utama HP Anda.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-semibold text-gray-900">
                    Panduan untuk Chrome, Edge, &amp; Android:
                  </div>
                  <ol className="space-y-2 text-gray-600 list-decimal list-inside leading-relaxed">
                    <li>
                      Klik ikon titik tiga (<strong>⋮</strong>) atau ikon install di bar alamat (address bar) browser Anda.
                    </li>
                    <li>
                      Pilih menu <strong>"Instal WebApp Merger &amp; PWA Suite"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </li>
                    <li>
                      Konfirmasi pemasangan. Aplikasi akan berjalan di jendela mandiri (standalone app) tanpa tab browser!
                    </li>
                  </ol>
                </div>
              )}

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                💡 <strong>Keuntungan PWA:</strong> Loading instan dengan cache lokal, layar penuh bersih seperti aplikasi Play Store/App Store, dan tetap bisa dibuka saat jaringan lemah.
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white hover:bg-black transition-colors"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
