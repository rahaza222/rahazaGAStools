import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Key, Check, Copy, Trash2, Plus, 
  Sparkles, AlertCircle, LogOut, ShieldCheck, Smartphone, 
  Globe, MessageSquare, History, KeyRound, HelpCircle, CheckCircle2
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
  buildWhatsAppReplyMessage
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
  const [licenseType, setLicenseType] = useState<LicenseType>('device');
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

  useEffect(() => {
    if (isOpen) {
      setLicenses(getGeneratedLicenses());
      setPinError('');
      setSecurityMessage(null);
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
    if (licenseType === 'device' && !targetDeviceId.trim()) {
      alert('Untuk tipe Khusus Perangkat, harap masukkan Device ID pembeli.');
      return;
    }

    const note = buyerName.trim() || `Pelanggan #${licenses.length + 1}`;
    const result = generateLicenseKey(note, licenseType, targetDeviceId.trim());
    setGeneratedResult(result);
    refreshList();
  };

  const handleGenerateBatchUniversal = (count: number = 5) => {
    for (let i = 0; i < count; i++) {
      generateLicenseKey(`Batch #${licenses.length + i + 1}`, 'universal');
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
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const copyWaFormat = (record: GeneratedLicenseRecord) => {
    const text = buildWhatsAppReplyMessage(record);
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
      setCopiedWaText(true);
      setTimeout(() => setCopiedWaText(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (newPin !== confirmPin) {
      setSecurityMessage({ text: 'Konfirmasi PIN baru tidak cocok.', isError: true });
      return;
    }

    const res = changeAdminPin(oldPin, newPin);
    if (res.success) {
      setSecurityMessage({ text: res.message, isError: false });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setSecurityMessage({ text: res.message, isError: true });
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setGeneratedResult(null);
    setActiveTab('generator');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
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
                Rahaza PWA XML PRO — Modul Terenkripsi Offline untuk Menerbitkan Serial Key.
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
                <span>Tab 1: ⚡ Buat Lisensi</span>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label 
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            licenseType === 'device' 
                              ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/10' 
                              : 'bg-white/60 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="licenseType"
                            checked={licenseType === 'device'}
                            onChange={() => setLicenseType('device')}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                              <span>Khusus Perangkat (Terkunci Device ID)</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Direkomendasikan! Mencegah serial key dibagikan/dipakai di perangkat lain.
                            </p>
                          </div>
                        </label>

                        <label 
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            licenseType === 'universal' 
                              ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/10' 
                              : 'bg-white/60 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="licenseType"
                            checked={licenseType === 'universal'}
                            onChange={() => setLicenseType('universal')}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Universal (Bisa Semua Perangkat)</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Bisa diaktifkan di mana saja. Cocok untuk hadiah, giveaway, atau tim Anda.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {licenseType === 'device' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Target Device ID Pembeli:
                          </label>
                          <input
                            type="text"
                            value={targetDeviceId}
                            onChange={e => setTargetDeviceId(e.target.value.toUpperCase())}
                            placeholder="Contoh: RHZ-9X82-K3L9"
                            required={licenseType === 'device'}
                            className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 uppercase font-semibold"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Minta pembeli klik &quot;Salin Device ID&quot; di menu Upgrade PRO mereka.
                          </p>
                        </div>
                      )}

                      <div className={licenseType === 'universal' ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nama / Kode Pembeli:
                        </label>
                        <input
                          type="text"
                          value={buyerName}
                          onChange={e => setBuyerName(e.target.value)}
                          placeholder="Contoh: BUDI, SITI, atau ORDER-102"
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
                      <span>Generate Serial Key Pembeli Sekarang</span>
                    </button>
                  </form>

                  {/* Hasil Key Baru Terbentuk & Template WA */}
                  {generatedResult && (
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Serial Key Resmi Terbentuk!</span>
                        </div>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                          SIAP KIRIM
                        </span>
                      </div>

                      {/* Tampilan Key Box */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-emerald-300 rounded-xl p-3 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                            Serial Key ({generatedResult.type === 'device' ? 'Locked Device ID' : 'Universal'}):
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

                      {/* Template WhatsApp */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Format Balasan WhatsApp Siap Kirim ke Pembeli:</span>
                          </label>
                          <button
                            onClick={() => copyWaFormat(generatedResult)}
                            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            {copiedWaText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedWaText ? 'Format WA Tersalin!' : 'Salin Format WA'}</span>
                          </button>
                        </div>
                        <pre className="p-3 bg-white/90 border border-emerald-200 rounded-xl text-[11px] text-gray-800 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto leading-relaxed">
                          {buildWhatsAppReplyMessage(generatedResult)}
                        </pre>
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

                  {/* Demo Keys Info */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>🎁 Master Lisensi Demo / Uji Coba Bawaan:</span>
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
                                item.type === 'device' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.type === 'device' ? 'Device Lock' : 'Universal'}
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
                        PIN Lama / Emergency Bypass:
                      </label>
                      <input
                        type="password"
                        value={oldPin}
                        onChange={e => setOldPin(e.target.value)}
                        placeholder="PIN lama (Default: 399339)"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        PIN Baru (Minimal 4 Karakter/Digit):
                      </label>
                      <input
                        type="password"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value)}
                        placeholder="Masukkan PIN baru"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                        required
                        minLength={4}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Konfirmasi PIN Baru:
                      </label>
                      <input
                        type="password"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value)}
                        placeholder="Ulangi PIN baru"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                        required
                        minLength={4}
                      />
                    </div>

                    {securityMessage && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        securityMessage.isError 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {securityMessage.isError ? (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        )}
                        <span>{securityMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Simpan PIN Baru
                    </button>
                  </form>

                  <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] text-gray-600 space-y-1">
                    <span className="font-bold text-gray-800 block">Catatan Keamanan Darurat:</span>
                    <p>
                      Jika Anda lupa PIN baru, kode rescue <code className="font-mono font-bold text-gray-900 bg-white px-1 py-0.5 rounded border border-gray-200">{EMERGENCY_BYPASS_CODE}</code> akan selalu dapat digunakan untuk membuka panel ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
          {isAuthenticated ? (
            <button
              onClick={handleLock}
              className="text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Kunci Sesi Admin</span>
            </button>
          ) : (
            <span className="text-gray-400">PIN Master diperlukan untuk membuka portal.</span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
