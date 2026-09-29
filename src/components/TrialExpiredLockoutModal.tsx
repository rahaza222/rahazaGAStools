import React, { useState } from 'react';
import { 
  Lock, KeyRound, Sparkles, MessageCircle, Copy, Check, ShieldAlert, ArrowRight, RefreshCw, Smartphone
} from 'lucide-react';
import { activateLicense, buildWhatsAppOrderMessage, LicenseStatus } from '../lib/license';

interface TrialExpiredLockoutModalProps {
  isOpen: boolean;
  licenseStatus: LicenseStatus;
  onLicenseActivated: () => void;
  onOpenAdminPortal?: () => void;
}

export const TrialExpiredLockoutModal: React.FC<TrialExpiredLockoutModalProps> = ({
  isOpen,
  licenseStatus,
  onLicenseActivated,
  onOpenAdminPortal,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCopiedDevice, setIsCopiedDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const deviceId = licenseStatus.deviceId;
  const whatsappUrl = buildWhatsAppOrderMessage(deviceId);

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setIsCopiedDevice(true);
    setTimeout(() => setIsCopiedDevice(false), 2000);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!inputKey.trim()) {
      setErrorMsg('Silakan masukkan Serial Key lisensi Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = activateLicense(inputKey);
      if (result.success) {
        onLicenseActivated();
      } else {
        setErrorMsg(result.message);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat verifikasi lisensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-100 shadow-2xl overflow-hidden my-8">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 text-center overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center mb-4 shadow-inner">
              <Lock className="w-7 h-7 text-rose-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Masa Uji Coba Berakhir</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Aplikasi Terkunci
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
              Masa trial gratis 24 jam Anda telah habis. Aktifkan lisensi PRO untuk terus mengonversi WebApp GAS menjadi aplikasi PWA Blogger.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 text-gray-800">
          {/* Benefit Cards */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bebas Watermark</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                XML Blogger bersih tanpa label credit
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span>GAS Patcher PRO</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Fitur otomatisasi modul GAS tanpa batas
              </p>
            </div>
          </div>

          {/* Device ID Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                Device ID Anda
              </div>
              <div className="font-mono text-sm font-bold text-gray-900 truncate">
                {deviceId}
              </div>
            </div>
            <button
              onClick={handleCopyDeviceId}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              {isCopiedDevice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin ID</span>
                </>
              )}
            </button>
          </div>

          {/* Order via WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white/20" />
            <span>Beli Lisensi PRO via WhatsApp</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 absolute">
              Sudah Memiliki Kode Lisensi?
            </span>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleActivate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Masukkan Serial Key Lisensi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                  placeholder="RAHAZA-PRO-... atau RAHAZA-TRIAL-..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Aktifkan Sekarang &amp; Buka Kunci</span>
              )}
            </button>
          </form>

          {/* Admin Testing Trigger Note */}
          {onOpenAdminPortal && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onOpenAdminPortal}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors underline cursor-pointer"
              >
                Portal Admin &amp; Generator Kunci (Shortcut: Ctrl + Shift + A)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
