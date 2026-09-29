import React, { useState, useEffect } from 'react';
import { 
  X, Crown, Sparkles, Check, AlertCircle, 
  MessageSquare, ShieldCheck, KeyRound, ExternalLink, LogOut, Copy,
  Smartphone, Zap, FileCode, Sliders
} from 'lucide-react';
import { 
  getCurrentLicenseStatus, 
  activateLicense, 
  deactivateLicense, 
  getOrCreateDeviceId,
  WA_NUMBER, 
  LicenseStatus 
} from '../lib/license';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseChanged: () => void;
}

export function LicenseActivationModal({ 
  isOpen, 
  onClose, 
  onLicenseChanged
}: LicenseActivationModalProps) {
  const [currentStatus, setCurrentStatus] = useState<LicenseStatus>(getCurrentLicenseStatus());
  const [inputKey, setInputKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);

  const deviceId = getOrCreateDeviceId();

  // Dynamic WhatsApp link with device ID prefilled
  const dynamicWaLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Halo Admin Rahaza PWA XML PRO, saya ingin membeli Kode Lisensi PRO Lifetime untuk hapus watermark RAHAZA DIGITAL (Promo Rp 15.000).\n\nDevice ID saya: ${deviceId}`
  )}`;

  // Sync status whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStatus(getCurrentLicenseStatus());
      setErrorMessage('');
      setSuccessMessage('');
      setInputKey('');
      setIsConfirmingDeactivate(false);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleActivate = (e?: React.FormEvent, keyToActivate?: string) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetKey = (keyToActivate || inputKey).trim().toUpperCase();

    if (!targetKey) {
      setErrorMessage('Harap masukkan serial key lisensi.');
      return;
    }

    const result = activateLicense(targetKey);
    if (result.success) {
      setSuccessMessage(result.message);
      setInputKey('');
      setCurrentStatus(getCurrentLicenseStatus());
      onLicenseChanged();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleDeactivate = () => {
    deactivateLicense();
    setCurrentStatus(getCurrentLicenseStatus());
    onLicenseChanged();
    setIsConfirmingDeactivate(false);
    setSuccessMessage('Lisensi telah dilepas. Status kembali ke Free Plan.');
  };

  const copyToClipboard = (text: string, type: 'key' | 'device') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedDeviceId(true);
        setTimeout(() => setCopiedDeviceId(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b text-white shrink-0 ${
          currentStatus.isPro 
            ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-600' 
            : 'bg-gradient-to-r from-slate-900 to-indigo-950 border-slate-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shrink-0">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    {currentStatus.isPro ? 'Rahaza PWA XML PRO Aktif' : 'Aktivasi Rahaza PWA XML PRO'}
                  </h3>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {currentStatus.isPro ? 'LIFETIME PRO' : 'UPGRADE'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  {currentStatus.isPro 
                    ? 'Selamat, semua fitur premium PWA Blogger 100% White-Label telah aktif!'
                    : 'Buka akses penuh: Bebas watermark, unlimited XML download, & patcher GAS.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {currentStatus.isPro ? (
            /* JIKA SUDAH PRO */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                  <span>Serial Key Lisensi Anda:</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    TERVERIFIKASI OFFLINE
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white border border-amber-300/80 rounded-xl px-3 py-2">
                  <span className="font-mono text-xs font-bold text-gray-900 tracking-wider">
                    {currentStatus.licenseKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentStatus.licenseKey || '', 'key')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-amber-800 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Status: Lisensi Seumur Hidup (Lifetime License). Tidak perlu biaya perpanjangan bulanan.</span>
                </div>
              </div>

              {/* Device ID Info */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Device ID Browser:</span>
                  <code className="font-mono font-bold text-gray-800">{deviceId}</code>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(deviceId, 'device')}
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedDeviceId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDeviceId ? 'Tersalin' : 'Salin ID'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="font-bold text-gray-800">Keuntungan PRO Anda yang Sedang Aktif:</div>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Bebas Watermark Layar &quot;RAHAZA DIGITAL&quot; (100% Bersih &amp; White-Label)
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Unduh file XML &amp; Web Manifest tak terbatas
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    GAS Patcher Full (Fullscreen, Orientation, &amp; Splash Screen)
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    100% Offline Tanpa Ketergantungan Server
                  </li>
                </ul>
              </div>

              {/* Confirmation state for deactivation */}
              {isConfirmingDeactivate ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <p className="text-xs text-red-800 font-semibold">
                    Yakin ingin melepas lisensi PRO pada browser ini? Status akan kembali ke Free Plan.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Ya, Lepas Lisensi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDeactivate(false)}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDeactivate(true)}
                    className="text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Lepas Lisensi dari Browser Ini</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* JIKA MASIH FREE */
            <div className="space-y-5">
              {/* Kotak Device ID Pembeli */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                    <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Device ID Perangkat Ini:</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Kirimkan kode ini ke Admin untuk menerbitkan lisensi khusus perangkat Anda:
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="bg-white border border-blue-300 px-2.5 py-1.5 rounded-lg font-mono text-xs font-black text-blue-700 tracking-wider">
                    {deviceId}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(deviceId, 'device')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    {copiedDeviceId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDeviceId ? 'Tersalin!' : 'Salin Device ID'}</span>
                  </button>
                </div>
              </div>

              {/* Form Input Lisensi */}
              <form onSubmit={e => handleActivate(e)} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Sudah Punya Serial Key? Masukkan Di Sini:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={e => setInputKey(e.target.value.toUpperCase())}
                      placeholder="RAHAZA-PRO-NAMA-XXXXXX"
                      className="flex-1 uppercase font-mono text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white tracking-wider"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Aktivasi
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Format diawali <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">RAHAZA-PRO-...</code>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{successMessage}</span>
                  </div>
                )}
              </form>

              {/* Tabel Perbandingan Free vs PRO */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800">
                  <span>📊 Perbandingan Fitur</span>
                  <span className="text-[11px] text-amber-700 font-extrabold">Rahaza PWA XML PRO</span>
                </div>
                <div className="divide-y divide-gray-100 text-[11px]">
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Watermark Layar WebApp</span>
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 font-bold text-[10px]">Tampil &quot;RAHAZA DIGITAL&quot;</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 100% Bersih (Tanpa Watermark)
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Download File XML &amp; Web Manifest</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-[10px]">Terbatas</span>
                      <span className="font-bold text-emerald-600">♾️ Tanpa Batas</span>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">GAS Patcher (Fullscreen, Refresh, Loader)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-[10px]">Dasar</span>
                      <span className="font-bold text-emerald-600">🌟 Akses Penuh</span>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Masa Aktif Lisensi</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-[10px]">Free Tier</span>
                      <span className="font-bold text-emerald-600">♾️ Lifetime (Sekali Bayar)</span>
                    </div>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Koneksi Internet</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-[10px]">Offline Ready</span>
                      <span className="font-bold text-emerald-600">100% Offline &amp; Aman</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kotak Beli Lisensi via WA */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-50 border border-emerald-200 rounded-2xl space-y-3.5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                        🔥 PROMO LAUNCHING
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Hemat 70%
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-gray-900 mt-1.5">
                      Dapatkan Serial Key Rahaza PWA XML PRO
                    </h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xs text-gray-400 font-semibold line-through">
                        Rp 49.000
                      </span>
                      <div className="text-2xl font-black text-emerald-700">
                        Rp 15.000
                      </div>
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        Sekali Bayar Selamanya
                      </span>
                    </div>
                  </div>
                  <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
                </div>

                <a
                  href={dynamicWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Beli via WhatsApp Sekarang ({WA_NUMBER})</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>Rahaza PWA XML PRO • 100% Offline Cryptographic Engine</span>
          </div>
          <span>v2.1 PRO</span>
        </div>
      </div>
    </div>
  );
}
