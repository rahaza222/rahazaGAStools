import React, { useState } from 'react';
import { 
  X, Check, Copy, Wand2, Code2, AlertTriangle, ShieldCheck, 
  ExternalLink, Sparkles, HelpCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';

interface GasPatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GasPatcherModal({ isOpen, onClose }: GasPatcherModalProps) {
  const [activeTab, setActiveTab] = useState<'patcher' | 'snippets' | 'deploy-guide'>('patcher');
  const [inputCode, setInputCode] = useState(`function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi PWA Saya');
}`);
  const [patchedCode, setPatchedCode] = useState('');
  const [isPatched, setIsPatched] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-patcher logic
  const handlePatch = () => {
    let code = inputCode.trim();
    if (!code) {
      setPatchedCode('');
      setIsPatched(false);
      return;
    }

    // Check if already has ALLOWALL
    if (code.includes('HtmlService.XFrameOptionsMode.ALLOWALL') || code.includes('XFrameOptionsMode.ALLOWALL')) {
      setPatchedCode(code);
      setIsPatched(true);
      return;
    }

    const allowallSnippet = '.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)';

    // Pattern 1: Chained return statement ending with semicolon or newline
    // e.g. return HtmlService.createHtmlOutputFromFile('Index');
    // or return HtmlService.createTemplateFromFile('Index').evaluate();
    if (/return\s+HtmlService\s*\.[^;]+;/s.test(code)) {
      // Find the last chained call before the semicolon
      const updated = code.replace(/(return\s+HtmlService[\s\S]*?)(;)/, (_match, p1, _p2) => {
        return `${p1}\n    ${allowallSnippet};`;
      });
      setPatchedCode(updated);
      setIsPatched(true);
      return;
    }

    // Pattern 2: Variable assigned to HtmlService then returned
    // e.g. var html = HtmlService.createHtmlOutputFromFile('Index'); ... return html;
    const varMatch = code.match(/(var|let|const)\s+([a-zA-Z0-9_$]+)\s*=\s*HtmlService/);
    if (varMatch) {
      const varName = varMatch[2];
      // Check if return varName exists
      const returnRegex = new RegExp(`return\\s+${varName}\\s*;`);
      if (returnRegex.test(code)) {
        const updated = code.replace(returnRegex, `${varName}${allowallSnippet};\n  return ${varName};`);
        setPatchedCode(updated);
        setIsPatched(true);
        return;
      }
    }

    // Pattern 3: Fallback general injection before return
    if (code.includes('return ')) {
      const updated = code.replace(
        /(return\s+[^;]+;)/,
        `// Ditambahkan otomatis agar WebApp diizinkan tampil di iframe Blogger:\n  // ${allowallSnippet}\n  $1`
      );
      // Append right after the return object
      const chained = code.replace(
        /(return\s+[\s\S]+?)(;)/,
        `$1\n    ${allowallSnippet};`
      );
      setPatchedCode(chained);
      setIsPatched(true);
      return;
    }

    // If doGet is empty or not matching, give a pristine standard function
    setPatchedCode(`function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi PWA Saya')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`);
    setIsPatched(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(id);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const snippetPola1 = `function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi PWA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`;

  const snippetPola2 = `function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  // Isi data dinamis ke template jika ada:
  // template.data = getData();
  
  return template.evaluate()
    .setTitle('Aplikasi PWA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`;

  const snippetPola3 = `function doGet(e) {
  var output = HtmlService.createHtmlOutputFromFile('Index');
  output.setTitle('Aplikasi PWA');
  output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return output;
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Solusi WebApp Tidak Tampil di Blogger (Iframe ALLOWALL)
                </h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Wajib untuk GAS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Google Apps Script memblokir tampilan iframe secara bawaan kecuali Anda menambahkan izin <code className="text-amber-300 font-mono">ALLOWALL</code>.
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

        {/* Tab Selector */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 px-6 pt-2">
          <button
            onClick={() => setActiveTab('patcher')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'patcher'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Perbaiki Otomatis (Auto-Patcher)</span>
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'snippets'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Snippet Siap Pakai (3 Pola)</span>
          </button>
          <button
            onClick={() => setActiveTab('deploy-guide')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'deploy-guide'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Langkah Wajib: New Deployment</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'patcher' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Cara Mudah:</strong> Tempelkan fungsi <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">doGet</code> dari file <code>Code.gs</code> Anda di bawah ini, lalu klik tombol <strong>&quot;Perbaiki Kode Sekarang&quot;</strong>. Sistem akan menyisipkan izin iframe secara otomatis.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Code */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>1. Tempel Kode Saat Ini (Code.gs):</span>
                    <button
                      type="button"
                      onClick={() => setInputCode(snippetPola1.replace(/\s*\.setXFrameOptionsMode\(HtmlService\.XFrameOptionsMode\.ALLOWALL\)/, ''))}
                      className="text-[11px] text-blue-600 hover:underline font-normal cursor-pointer"
                    >
                      Muat Contoh
                    </button>
                  </div>
                  <textarea
                    value={inputCode}
                    onChange={e => {
                      setInputCode(e.target.value);
                      setIsPatched(false);
                    }}
                    rows={9}
                    className="w-full bg-slate-950 text-emerald-400 font-mono text-[11px] p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    placeholder="function doGet(e) { ... }"
                  />
                  <button
                    onClick={handlePatch}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Perbaiki Kode Sekarang</span>
                  </button>
                </div>

                {/* Patched Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>2. Hasil Kode yang Sudah Diperbaiki:</span>
                    {isPatched && (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> Berhasil Diperbaiki
                      </span>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={patchedCode || '// Klik tombol "Perbaiki Kode Sekarang" untuk melihat hasil...'}
                    rows={9}
                    className="w-full bg-slate-900 text-blue-300 font-mono text-[11px] p-3.5 rounded-xl border border-slate-800 focus:outline-none leading-relaxed"
                  />
                  <button
                    disabled={!isPatched}
                    onClick={() => copyToClipboard(patchedCode, 'patched')}
                    className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPatched
                        ? copiedType === 'patched'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {copiedType === 'patched' ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>KODE BERHASIL DISALIN!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode Hasil Perbaikan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'snippets' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Pilih pola yang sesuai dengan struktur kode Google Apps Script Anda. Klik <strong>Salin</strong> lalu ganti fungsi <code>doGet</code> Anda di <code>Code.gs</code>:
              </p>

              {/* Pola 1 */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Pola 1: createHtmlOutputFromFile (Paling Umum & Standar)
                  </div>
                  <button
                    onClick={() => copyToClipboard(snippetPola1, 'pola1')}
                    className="text-xs font-semibold px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedType === 'pola1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'pola1' ? 'Tersalin' : 'Salin Pola 1'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950/70 rounded-xl">
                  {snippetPola1}
                </pre>
              </div>

              {/* Pola 2 */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Pola 2: createTemplateFromFile().evaluate() (Untuk Data Dinamis Server)
                  </div>
                  <button
                    onClick={() => copyToClipboard(snippetPola2, 'pola2')}
                    className="text-xs font-semibold px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedType === 'pola2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'pola2' ? 'Tersalin' : 'Salin Pola 2'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950/70 rounded-xl">
                  {snippetPola2}
                </pre>
              </div>

              {/* Pola 3 */}
              <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    Pola 3: Objek Variabel Terpisah (Multi-step Output)
                  </div>
                  <button
                    onClick={() => copyToClipboard(snippetPola3, 'pola3')}
                    className="text-xs font-semibold px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedType === 'pola3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'pola3' ? 'Tersalin' : 'Salin Pola 3'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950/70 rounded-xl">
                  {snippetPola3}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'deploy-guide' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-950 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  Kenapa Sudah Pasang Kode Tapi WebApp Masih Tetap Blank / Tertolak?
                </div>
                <p className="text-xs leading-relaxed text-amber-800">
                  Ini adalah kesalahan paling sering di Google Apps Script: <strong>Menyimpan kode (Ctrl + S) saja TIDAK AKAN memperbarui Web App yang sedang aktif di internet</strong>. Anda wajib melakukan pembaharuan versi deployment!
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  3 Langkah Wajib Setelah Mengubah Code.gs:
                </h4>

                <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-bold mb-0.5">Simpan Proyek di Google Apps Script</strong>
                    <span className="text-gray-600">Tekan tombol ikon disket atau shortcut keyboard <code>Ctrl + S</code> (atau <code>Cmd + S</code> di Mac).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="block text-gray-900 font-bold mb-0.5">Buka Manage Deployments</strong>
                    <span className="text-gray-600">Klik tombol <strong>Deploy</strong> di pojok kanan atas, lalu pilih <strong>Manage deployments</strong>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs">
                  <div className="w-7 h-7 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="block text-blue-950 font-bold mb-0.5">Pilih Edit &gt; Version: New Version &gt; Deploy</strong>
                    <span className="text-blue-900 leading-relaxed">
                      Klik ikon <strong>Pensil (Edit)</strong> pada deployment Web App Anda saat ini. Pada bagian <strong>Version</strong>, klik dropdown dan pilih <strong>New version</strong>. Terakhir, klik tombol <strong>Deploy</strong>.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dengan memilih <em>New version</em>, URL <code>/exec</code> Anda akan tetap sama dan kode ALLOWALL langsung aktif seketika!</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Izin ini 100% aman dan resmi dari dokumentasi Google Apps Script (HtmlService).</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup Bantuan
          </button>
        </div>
      </div>
    </div>
  );
}
