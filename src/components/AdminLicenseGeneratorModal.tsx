import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Key, Check, Copy, Trash2, Plus, 
  Sparkles, AlertCircle, ShieldCheck, Smartphone, 
  Globe, MessageSquare, History, KeyRound, HelpCircle, CheckCircle2, Clock, AlertTriangle
} from 'lucide-react';
import { 
  DEFAULT_ADMIN_PIN,
  EMERGENCY_BYPASS_CODE,
  MASTER_DEMO_KEYS,
  LicenseType,
  GeneratedLicenseRecord,
  generateLicenseKey,
  getGeneratedLicenses,
  removeGeneratedLicense,
  clearAllGeneratedLicenses,
  verifyAdminPin,
  changeAdminPin,
  buildWhatsAppReplyMessage,
  resetTrialForTesting,
  expireTrialForTesting,
} from '../lib/license';

interface AdminLicenseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseChanged?: () => void;
}

export function AdminLicenseGeneratorModal({ 
  isOpen, 
  onClose,
  onLicenseChanged 
}: AdminLicenseGeneratorModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Tabs: 'generator' | 'history' | 'security'
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'security'>('generator');

  // Generator form states
  const [licenseType, setLicenseType] = useState<LicenseType>('lifetime_device');
  const [trialHours, setTrialHours] = useState<number>(24);
  const [buyerName, setBuyerName] = useState('');
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [generatedResult, setGeneratedResult] = useState<GeneratedLicenseRecord | null>(null);

  // Copy feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedWaText, setCopiedWaText] = useState(false);

  // History state
  const [licenses, setLicenses] = useState<GeneratedLicenseRecord[]>(getGeneratedLicenses());

  // Security (Change PIN) states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Testing feedback toast
  const [testActionNotice, setTestActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLicenses(getGeneratedLicenses());
      setPinError('');
      setSecurityMessage(null);
      setTestActionNotice(null);
    }
  }, [isOpen]);

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

  const refreshList = () => {
    setLicenses(getGeneratedLicenses());
    if (onLicenseChanged) onLicenseChanged();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      refreshList();
    } else {
      setPinError('PIN Admin salah atau tidak sesuai.');
    }
  };

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (licenseType === 'lifetime_device' && !targetDeviceId.trim()) {
      alert('Untuk tipe Khusus Perangkat, harap masukkan Device ID pembeli.');
      return;
    }

    const note = buyerName.trim() || `Pelanggan #${licenses.length + 1}`;
    const result = generateLicenseKey(note, licenseType, targetDeviceId.trim() || undefined, trialHours);
    setGeneratedResult(result);
    refreshList();
  };

  const handleGenerateBatchUniversal = (count: number = 5) => {
    for (let i = 0; i < count; i++) {
      generateLicenseKey(`Batch #${licenses.length + i + 1}`, 'lifetime_universal');
    }
    refreshList();
  };

  const handleDelete = (key: string) => {
    if (window.confirm(`Hapus serial key ${key} dari riwayat?`)) {
      removeGeneratedLicense(key);
      refreshList();
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Bersihkan seluruh riwayat lisensi di browser ini?')) {
      clearAllGeneratedLicenses();
      refreshList();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
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
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // fallback
    }
  };

  const copyWaFormat = (record: GeneratedLicenseRecord) => {
    const msg = buildWhatsAppReplyMessage(record);
    copyToClipboard(msg, `WA-${record.key}`);
    setCopiedWaText(true);
    setTimeout(() => setCopiedWaText(false), 2500);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (newPin !== confirmPin) {
      setSecurityMessage({ text: 'Konfirmasi PIN baru tidak sama.', isError: true });
      return;
    }

    const res = changeAdminPin(oldPin, newPin);
    setSecurityMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }
  };

  const handleResetTrial = () => {
    resetTrialForTesting(24);
    refreshList();
    setTestActionNotice('Masa trial 24 jam berhasil di-reset ulang ke kondisi awal.');
    setTimeout(() => setTestActionNotice(null), 3500);
  };

  const handleExpireTrial = () => {
    expireTrialForTesting();
    refreshList();
    setTestActionNotice('Masa trial dipaksa EXPIRED! Layar kunci akan muncul.');
    setTimeout(() => setTestActionNotice(null), 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-800 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Panel Penjual &amp; Admin Lisensi
                </h3>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/30 font-bold">
                  RAHASIA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rahaza PWA XML PRO — Modul Terenkripsi Offline untuk Menerbitkan Serial Key &amp; Trial.
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

        {/* Content Gate */}
        {!isAuthenticated ? (
          /* Step 1: PIN Authentication Gate */
          <div className="p-8 sm:p-12 space-y-6 max-w-md mx-auto w-full my-auto text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Masukkan PIN Master Admin</h4>
              <p className="text-xs text-gray-500 mt-1">
                Gunakan PIN Master Anda (Default: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-700">{DEFAULT_ADMIN_PIN}</code>) atau kode darurat.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="PIN Master / Bypass"
                  className="w-full text-center text-lg font-mono font-bold py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white tracking-widest"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Buka Portal Admin
              </button>
            </form>

            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Bantuan Akses Cepat:</span>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                • PIN Master Bawaan: <code className="font-mono font-bold">{DEFAULT_ADMIN_PIN}</code><br/>
                • Emergency Rescue Code: <code className="font-mono font-bold">{EMERGENCY_BYPASS_CODE}</code>
              </p>
            </div>
          </div>
        ) : (
          /* Step 2: Authenticated Admin Dashboard with 3 Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50/70 px-6 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('generator')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-t border-x ${
                  activeTab === 'generator'
                    ? 'bg-white text-blue-600 border-gray-200 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 border-transparent hover:bg-gray-100/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tab 1: ⚡ Buat Lisensi &amp; Trial</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-t border-x ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-600 border-gray-200 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 border-transparent hover:bg-gray-100/60'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Tab 2: 📜 Riwayat ({licenses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors cursor-pointer border-t border-x ${
                  activeTab === 'security'
                    ? 'bg-white text-blue-600 border-gray-200 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 border-transparent hover:bg-gray-100/60'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Tab 3: 🔒 Keamanan (PIN)</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Developer testing notice */}
              {testActionNotice && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{testActionNotice}</span>
                </div>
              )}

              {/* TAB 1: GENERATOR */}
              {activeTab === 'generator' && (
                <div className="space-y-6">
                  {/* Form Generator */}
                  <form onSubmit={handleGenerate} className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Generator Lisensi Rahaza PWA XML PRO</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                        100% OFFLINE HASH
                      </span>
                    </div>

                    {/* License Type Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Pilih Tipe Lisensi:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Device Locked */}
                        <label 
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            licenseType === 'lifetime_device' 
                              ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/10' 
                              : 'bg-white/60 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="licenseType"
                            checked={licenseType === 'lifetime_device'}
                            onChange={() => setLicenseType('lifetime_device')}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                              <span>PRO (Lock Device)</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Terkunci Device ID. Permanen seumur hidup.
                            </p>
                          </div>
                        </label>

                        {/* Universal */}
                        <label 
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            licenseType === 'lifetime_universal' 
                              ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/10' 
                              : 'bg-white/60 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="licenseType"
                            checked={licenseType === 'lifetime_universal'}
                            onChange={() => setLicenseType('lifetime_universal')}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-indigo-600" />
                              <span>PRO (Universal)</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Bisa diaktifkan di perangkat mana saja.
                            </p>
                          </div>
                        </label>

                        {/* Trial Limited Time */}
                        <label 
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            licenseType === 'trial' 
                              ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-500/10' 
                              : 'bg-white/60 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="licenseType"
                            checked={licenseType === 'trial'}
                            onChange={() => setLicenseType('trial')}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Trial Terbatas</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Uji coba waktu terbatas (misal 24 jam / 3 hari).
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Trial Duration Selector (Shown when licenseType is 'trial') */}
                    {licenseType === 'trial' && (
                      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                        <label className="block text-xs font-bold text-amber-900">
                          Pilih Durasi Masa Uji Coba (Trial):
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { hours: 24, label: '24 Jam (1 Hari)' },
                            { hours: 72, label: '3 Hari' },
                            { hours: 168, label: '7 Hari' },
                            { hours: 336, label: '14 Hari' },
                            { hours: 720, label: '30 Hari' },
                          ].map(opt => (
                            <button
                              key={opt.hours}
                              type="button"
                              onClick={() => setTrialHours(opt.hours)}
                              className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                                trialHours === opt.hours
                                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs font-bold'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-100/50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {licenseType === 'lifetime_device' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Target Device ID Pembeli:
                          </label>
                          <input
                            type="text"
                            value={targetDeviceId}
                            onChange={e => setTargetDeviceId(e.target.value.toUpperCase())}
                            placeholder="Contoh: RHZ-9X82-K3L9"
                            required={licenseType === 'lifetime_device'}
                            className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase font-semibold"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Minta pembeli klik &quot;Salin Device ID&quot; di menu Upgrade PRO mereka.
                          </p>
                        </div>
                      )}

                      <div className={licenseType !== 'lifetime_device' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nama / Kode Pembeli:
                        </label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={e => setBuyerName(e.target.value)}
                          placeholder="Contoh: BUDI, SITI, atau TRIAL-DEMO"
                          className="w-full text-xs px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase font-semibold"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                          Nama akan tercantum sebagai kode identitas di serial key.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {licenseType === 'trial' 
                          ? `Generate Serial Key Trial (${trialHours} Jam)` 
                          : 'Generate Serial Key PRO Pembeli Sekarang'}
                      </span>
                    </button>
                  </form>

                  {/* Hasil Key Baru Terbentuk & Template WA */}
                  {generatedResult && (
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            {generatedResult.type === 'trial' 
                              ? `Kode Lisensi Trial (${generatedResult.trialHours} Jam) Terbentuk!` 
                              : 'Serial Key Resmi Terbentuk!'}
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                          SIAP KIRIM
                        </span>
                      </div>

                      {/* Tampilan Key Box */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-emerald-300 rounded-xl p-3 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            Serial Key ({generatedResult.type === 'trial' ? `Trial ${generatedResult.trialHours} Jam` : generatedResult.type === 'lifetime_device' ? 'Locked Device ID' : 'Universal'}):
                          </div>
                          <code className="font-mono text-base font-black text-emerald-700 tracking-wider select-all">
                            {generatedResult.key}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(generatedResult.key, 'RESULT')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {copiedKey === 'RESULT' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'RESULT' ? 'Key Tersalin!' : 'Salin Key'}</span>
                        </button>
                      </div>

                      {/* Tombol Salin Format WA */}
                      <div className="pt-1">
                        <button
                          onClick={() => copyWaFormat(generatedResult)}
                          className="w-full py-2.5 px-4 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span>{copiedWaText ? 'Format Pesan WA Berhasil Disalin!' : 'Salin Format Pesan Lengkap WhatsApp'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Batch Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                    <div>
                      <strong className="text-gray-900 block font-bold">Cetak Batch Universal untuk Marketplace (Lynk.id / Mayar):</strong>
                      <span className="text-gray-500 text-[11px]">
                        Generate 5 kode universal sekaligus untuk stok serial key produk digital Anda.
                      </span>
                    </div>
                    <button
                      onClick={() => handleGenerateBatchUniversal(5)}
                      className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>+5 Batch Universal</span>
                    </button>
                  </div>

                  {/* Quick Trial Testing Controls */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>🛠️ Kontrol Pengujian Cepat Uji Coba (Developer Mode):</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Gunakan tombol ini untuk menguji perilaku aplikasi dalam masa trial aktif dan kondisi terkunci:
                    </p>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={handleResetTrial}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>🔄 Reset Ulang Trial ke 24 Jam Penuh</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExpireTrial}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>⚠️ Paksa Trial Expired (Uji Layar Terkunci)</span>
                      </button>
                    </div>
                  </div>

                  {/* Demo Keys Info */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>🎁 Master Lisensi Demo Bawaan:</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Kunci master berikut sudah terprogram di mesin offline dan bisa langsung diaktifkan di menu Upgrade PRO untuk pengujian:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {MASTER_DEMO_KEYS.map(k => (
                        <button
                          key={k}
                          onClick={() => copyToClipboard(k, k)}
                          className="px-2.5 py-1 bg-white border border-amber-300 rounded-lg font-mono text-[11px] font-bold text-amber-950 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Klik untuk salin"
                        >
                          <span>{k}</span>
                          {copiedKey === k ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-amber-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-gray-900">Riwayat Lisensi Diterbitkan ({licenses.length})</h4>
                      <p className="text-gray-500 text-[11px]">Tercatat di penyimpanan lokal browser admin.</p>
                    </div>
                    {licenses.length > 0 && (
                      <button
                        onClick={handleClearAllHistory}
                        className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Bersihkan Riwayat</span>
                      </button>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white">
                    {licenses.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        Belum ada lisensi yang diterbitkan.
                      </div>
                    ) : (
                      licenses.map((item, idx) => (
                        <div 
                          key={item.key + idx}
                          className="p-3.5 hover:bg-gray-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-400 text-[11px] w-5">
                                #{idx + 1}
                              </span>
                              <code className="font-mono font-bold text-blue-700 text-xs select-all">
                                {item.key}
                              </code>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                item.type === 'trial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.type === 'lifetime_device' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.type === 'trial' ? `Trial ${item.trialHours || 24} Jam` : item.type === 'lifetime_device' ? 'Device Lock' : 'Universal'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-gray-500 ml-7">
                              <span>Pembeli: <strong className="text-gray-800">{item.buyerName}</strong></span>
                              {item.targetDeviceId && (
                                <span>Device: <code className="text-gray-700 font-mono">{item.targetDeviceId}</code></span>
                              )}
                              <span>Tgl: {new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => copyWaFormat(item)}
                              className="px-2.5 py-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer border border-gray-200"
                              title="Salin Format WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Format WA</span>
                            </button>

                            <button
                              onClick={() => copyToClipboard(item.key, item.key)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Salin Serial Key"
                            >
                              {copiedKey === item.key ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(item.key)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Dari Riwayat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY (CHANGE PIN) */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto space-y-5 p-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Ganti PIN Master Admin</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Perbarui PIN keamanan untuk membatasi penerbitan lisensi.
                    </p>
                  </div>

                  <form onSubmit={handleChangePinSubmit} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        PIN Lama atau Kode Emergency:
                      </label>
                      <input
                        type="password"
                        value={oldPin}
                        onChange={e => setOldPin(e.target.value)}
                        placeholder="PIN lama (Default: 399339)"
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        PIN Baru (Minimal 4 Karakter):
                      </label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        placeholder="PIN baru Anda"
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Ulangi PIN Baru:
                      </label>
                      <input
                        type="password"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value)}
                        placeholder="Ulangi PIN baru"
                        required
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {securityMessage && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        securityMessage.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {securityMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                        <span>{securityMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Simpan PIN Baru
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>Modul Generator &amp; Trial Terenkripsi Aktif</span>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Kunci Kembali</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogOut(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
