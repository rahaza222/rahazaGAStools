import React, { useState, useEffect } from 'react';
import { 
  X, Crown, Sparkles, Check, AlertCircle, 
  MessageSquare, ShieldCheck, KeyRound, ExternalLink, LogOut, Lock, Copy
} from 'lucide-react';
import { 
  getCurrentLicenseStatus, activateLicense, deactivateLicense, 
  WA_LINK, WA_NUMBER, LicenseStatus 
} from '../lib/license';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseChanged: () => void;
  onOpenAdminPortal?: () => void;
}

export function LicenseActivationModal({ 
  isOpen, 
  onClose, 
  onLicenseChanged,
  onOpenAdminPortal 
}: LicenseActivationModalProps) {
  const [currentStatus, setCurrentStatus] = useState<LicenseStatus>(getCurrentLicenseStatus());
  const [inputKey, setInputKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);

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
      setErrorMessage('Harap masukkan kode lisensi.');
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

  const copyKey = (key: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = key;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b text-white ${
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
                    {currentStatus.isPro ? 'Rahaza PWA PRO Aktif' : 'Aktivasi Lisensi PRO'}
                  </h3>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {currentStatus.isPro ? 'LIFETIME PRO' : 'UPGRADE'}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  {currentStatus.isPro 
                    ? 'Selamat, semua fitur premium PWA Blogger tanpa batas telah terbuka!'
                    : 'Buka akses penuh: Bebas watermark, unlimited download, & prioritas fitur.'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {currentStatus.isPro ? (
            /* Jika sudah PRO */
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                  <span>Kode Lisensi Aktif:</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    TERVERIFIKASI
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white border border-amber-300/80 rounded-xl px-3 py-2">
                  <span className="font-mono text-xs font-bold text-gray-900 tracking-wider">
                    {currentStatus.licenseKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyKey(currentStatus.licenseKey || '')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-amber-800 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Status: Lisensi Seumur Hidup (Lifetime License). Tidak perlu perpanjangan bulanan.</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="font-bold text-gray-800">Keuntungan PRO Anda yang Sedang Aktif:</div>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Bebas Watermark di template XML Blogger
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Unduh file XML &amp; Manifest tak terbatas
                  </li>
                  <li className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    Dukungan hak milik penuh (White-Label)
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
            /* Jika masih FREE */
            <div className="space-y-5">
              {/* Form Input Lisensi */}
              <form onSubmit={e => handleActivate(e)} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Sudah Punya Kode Lisensi? Masukkan Di Sini:</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={e => setInputKey(e.target.value.toUpperCase())}
                      placeholder="RHZPROXXXXXXXXXXXX"
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
                    Format 18 karakter diawali <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">RHZPRO...</code>
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

              {/* Garis Pemisah */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  Belum Punya Lisensi?
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
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
                      Paket Lisensi Rahaza PWA PRO
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

                <ul className="text-xs text-gray-700 space-y-1.5 pt-1 border-t border-emerald-100">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Akses Generator PWA Blogger Unlimited</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bebas Hak Cipta &amp; Bebas Watermark (White-Label)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kode instan langsung dikirim ke WhatsApp Anda</span>
                  </li>
                </ul>

                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ambil Promo Rp 15.000 via WhatsApp ({WA_NUMBER})</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer info & Developer Portal Link */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <span>Keamanan Terjamin • Rahaza PWA Suite</span>
          </div>
          <div className="flex items-center gap-2.5">
            {onOpenAdminPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminPortal();
                }}
                className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer p-0.5 rounded"
                aria-label="Settings"
                title="Settings"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
            <span>v2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
