import React, { useState, useEffect } from 'react';
import { 
  X, Crown, Sparkles, Check, AlertCircle, 
  MessageSquare, ShieldCheck, KeyRound, ExternalLink, LogOut, Copy,
  Smartphone, Clock
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

  // Handle ESC key to close modal (if not expired locked)
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
    setSuccessMessage('Lisensi telah dilepas.');
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

  const isLifetime = currentStatus.tier === 'pro_lifetime';
  const isTrialActive = currentStatus.tier === 'trial' && currentStatus.trial.isActive;

  const trialHours = Math.floor(currentStatus.trial.remainingSeconds / 3600);
  const trialMinutes = Math.floor((currentStatus.trial.remainingSeconds % 3600) / 60);

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
          isLifetime 
            ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-600' 
            : isTrialActive
              ? 'bg-gradient-to-r from-blue-700 to-indigo-900 border-indigo-700'
              : 'bg-gradient-to-r from-slate-900 to-indigo-950 border-slate-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                {isLifetime ? <Crown className="w-7 h-7 text-amber-300" /> : <Clock className="w-7 h-7 text-sky-300" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    {isLifetime 
                      ? 'Rahaza PWA XML PRO Aktif' 
                      : isTrialActive 
                        ? 'Masa Uji Coba Trial PRO' 
                        : 'Aktivasi Rahaza PWA XML PRO'}
                  </h3>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {isLifetime ? 'LIFETIME PRO' : isTrialActive ? 'TRIAL 24 JAM' : 'TERKUNCI'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  {isLifetime 
                    ? 'Selamat, semua fitur premium PWA Blogger 100% White-Label telah aktif selamanya!'
                    : isTrialActive
                      ? `Trial aktif (Sisa ${trialHours} jam ${trialMinutes} menit). Nikmati akses penuh sebelum terkunci.`
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
          {/* A. JIKA SUDAH LIFETIME PRO */}
          {isLifetime ? (
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

              {/* Confirmation state for deactivation */}
              {isConfirmingDeactivate ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <p className="text-xs text-red-800 font-semibold">
                    Yakin ingin melepas lisensi PRO pada browser ini? Status akan kembali ke masa uji coba / terkunci.
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
            /* B. JIKA SEDANG TRIAL ATAU TRIAL HABIS */
            <div className="space-y-5">
              {/* Kotak Status Trial */}
              {isTrialActive && (
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Masa Trial 24 Jam Sedang Berjalan</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200 tabular-nums">
                      Sisa: {trialHours}j {trialMinutes}m
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Semua fitur PRO aktif untuk Anda coba. Setelah waktu habis, aplikasi akan terkunci otomatis. Tingkatkan ke PRO Lifetime agar bebas berkarya selamanya.
                  </p>
                </div>
              )}

              {/* Kotak Device ID Pembeli */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Device ID Perangkat Ini:</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Kirimkan kode ini ke Admin saat memesan lisensi PRO:
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="bg-white border border-gray-300 px-2.5 py-1.5 rounded-lg font-mono text-xs font-black text-blue-700 tracking-wider">
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

              {/* Form Input Lisensi PRO / Trial */}
              <form onSubmit={e => handleActivate(e)} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Punya Kode Lisensi PRO atau Kode Trial Tambahan?</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={e => setInputKey(e.target.value.toUpperCase())}
                      placeholder="RAHAZA-PRO-... atau RAHAZA-TRIAL-..."
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
                    Mendukung kode PRO Lifetime (<code className="font-mono">RAHAZA-PRO-...</code>) dan kode Trial (<code className="font-mono">RAHAZA-TRIAL-...</code>).
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
