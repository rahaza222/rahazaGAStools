import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Key, Check, Copy, Trash2, Plus, 
  Layers, ShieldAlert, Sparkles, AlertCircle, FileSpreadsheet, LogOut 
} from 'lucide-react';
import { 
  ADMIN_PIN, generateLicenseKey, getGeneratedLicenses, 
  removeGeneratedLicense 
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
  
  const [buyerNote, setBuyerNote] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [licenses, setLicenses] = useState(getGeneratedLicenses());

  useEffect(() => {
    if (isOpen) {
      setLicenses(getGeneratedLicenses());
      setPinError('');
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
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      refreshList();
    } else {
      setPinError('PIN Admin salah. Akses ditolak.');
    }
  };

  const handleGenerateSingle = () => {
    const note = buyerNote.trim() || `Pembeli #${licenses.length + 1}`;
    const result = generateLicenseKey(note);
    setNewlyCreatedKey(result.key);
    setBuyerNote('');
    refreshList();
  };

  const handleGenerateBatch = (count: number = 5) => {
    for (let i = 0; i < count; i++) {
      generateLicenseKey(`Batch Lynk.id #${licenses.length + i + 1}`);
    }
    refreshList();
  };

  const handleDelete = (key: string) => {
    removeGeneratedLicense(key);
    refreshList();
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

  const copyAllKeys = () => {
    const all = licenses.map(l => l.key).join('\n');
    copyToClipboard(all, 'ALL');
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setNewlyCreatedKey(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Developer License Console
                </h3>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/30">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Panel generator kode lisensi format <code>RHZPRO...</code> untuk pembeli SaaS.
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

        {/* Content */}
        {!isAuthenticated ? (
          /* Step 1: PIN Authentication Gate */
          <div className="p-8 space-y-6 max-w-md mx-auto w-full my-auto text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Masukkan PIN Admin</h4>
              <p className="text-xs text-gray-500 mt-1">
                Akses ini khusus pemilik aplikasi/developer untuk mencetak serial key.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Masukkan 6 Digit PIN"
                  className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Buka Panel Developer
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Admin Generator Console */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Generate Single Key Box */}
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Cetak 1 Lisensi Baru (Format: RHZPRO...)</span>
                </div>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                  18 Karakter
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={buyerNote}
                  onChange={e => setBuyerNote(e.target.value)}
                  placeholder="Catatan / Nama Pembeli (Contoh: Budi - Toko Berkah)"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleGenerateSingle}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Key</span>
                </button>
              </div>

              {/* Tampilan Key Baru */}
              {newlyCreatedKey && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                    <span>Lisensi Berhasil Dibuat! Kirimkan ke Pembeli:</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      SIAP PAKAI
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-emerald-300 rounded-lg p-2.5">
                    <code className="font-mono text-sm font-bold text-emerald-700 tracking-wider">
                      {newlyCreatedKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'new' ? 'Tersalin!' : 'Salin Kode'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Bulk Batch Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
              <div>
                <strong className="text-gray-900 block font-bold">Cetak Batch untuk Lynk.id / Mayar:</strong>
                <span className="text-gray-500 text-[11px]">
                  Generate 5 kode sekaligus untuk di-copy ke stok serial digital produk Anda.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleGenerateBatch(5)}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+5 Batch</span>
                </button>
                <button
                  onClick={copyAllKeys}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  {copiedKey === 'ALL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'ALL' ? 'Semua Tersalin!' : 'Salin Semua'}</span>
                </button>
              </div>
            </div>

            {/* List of Active Keys */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span>Daftar Lisensi Aktif ({licenses.length} lisensi):</span>
                <span className="text-[11px] text-gray-500 font-normal">Klik untuk salin</span>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {licenses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    Belum ada lisensi yang dibuat.
                  </div>
                ) : (
                  licenses.map((item, idx) => (
                    <div 
                      key={item.key + idx}
                      className="p-3.5 bg-white hover:bg-gray-50/80 flex items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-[11px] font-mono text-gray-400 w-5 shrink-0">
                          {idx + 1}.
                        </span>
                        <code className="font-mono font-bold text-blue-700 tracking-wider select-all">
                          {item.key}
                        </code>
                        <span className="text-[11px] text-gray-500 truncate max-w-[160px] sm:max-w-xs">
                          ({item.note})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => copyToClipboard(item.key, item.key)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Salin Kode"
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
                          title="Hapus Lisensi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
            <span className="text-gray-400">PIN Admin diperlukan.</span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
