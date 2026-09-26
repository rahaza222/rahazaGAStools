import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ExternalLink, HelpCircle, Layers, Smartphone, ShieldCheck } from 'lucide-react';

export function PwaGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Dokumentasi & Tutorial
          </span>
          <span className="text-xs text-gray-500 font-mono">Blogger XML Injection Guide</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Panduan Mengubah Google Apps Script Menjadi PWA</h2>
        <p className="text-gray-600 text-sm mt-1">
          Ikuti langkah mudah berikut untuk memasang template XML PWA ke Blogger agar WebApp Google Apps Script dapat diinstal di smartphone layaknya aplikasi native Android / iOS.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">Deploy Google Apps Script sebagai Web App</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Buka proyek Google Apps Script Anda (script.google.com). Klik tombol <strong className="text-gray-800">Deploy</strong> &gt; <strong className="text-gray-800">New Deployment</strong>.
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside bg-gray-50 p-3 rounded-lg border border-gray-100">
                <li>Pilih tipe: <strong>Web app</strong></li>
                <li>Execute as: <strong>Me (email Anda)</strong></li>
                <li>Who has access: <strong>Anyone (Siapa saja)</strong></li>
                <li>Salin URL deployment yang berakhiran <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">/exec</code>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">Konfigurasi di Generator Rahaza PWA</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tempelkan URL Google Apps Script Anda ke formulir generator. Isi identitas aplikasi:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <strong className="block text-gray-800 mb-1">Nama & Ikon</strong>
                  Nama lengkap untuk judul aplikasi & inisial/logo resolusi tinggi (192x192 & 512x512).
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <strong className="block text-gray-800 mb-1">Warna Tema (Theme Color)</strong>
                  Warna ini akan menjadi warna header status bar di Android & iOS saat PWA dibuka.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">Pasang Template XML ke Blogger (Blogspot)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Buat blog baru di <strong className="text-gray-800">Blogger.com</strong> (misal: <code>tokosaya.blogspot.com</code> atau hubungkan dengan domain kustom <code>app.tokosaya.com</code>).
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Cara Memasang Tema:
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buka dashboard Blogger Anda, klik menu <strong>Tema (Theme)</strong>.</li>
                  <li>Di sebelah tombol SESUAIKAN (CUSTOMIZE), klik ikon panah ke bawah (⌄).</li>
                  <li>Pilih <strong>Edit HTML</strong> (atau Pulihkan / Restore dan upload file <code>.xml</code> hasil download).</li>
                  <li>Hapus semua kode lama yang ada di editor HTML Blogger, lalu <strong>Paste</strong> seluruh kode XML dari generator ini.</li>
                  <li>Klik tombol <strong>Simpan (Ikon Disket)</strong> di pojok kanan atas.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">Instal Aplikasi di Smartphone (Add to Home Screen)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Buka alamat blogspot Anda di browser HP (Chrome / Safari):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-1">📱 Android (Google Chrome):</span>
                  Muncul banner &quot;Tambahkan ke Layar Utama&quot; atau buka menu titik tiga (⋮) lalu pilih <strong>Instal Aplikasi</strong>.
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <span className="font-bold text-indigo-900 block mb-1">🍎 iOS (Safari iPhone):</span>
                  Ketuk tombol <strong>Share</strong> (ikon kotak berpanah ke atas), gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ & Tips */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <h4 className="text-base font-bold flex items-center gap-2">
          <ShieldCheck className="text-blue-400 w-5 h-5" />
          Tips Keamanan & Optimasi Google Apps Script
        </h4>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="border-b border-slate-800 pb-3">
            <strong className="text-white block mb-1">1. Izinkan Iframe pada Google Apps Script</strong>
            <p>
              Pastikan output HTML pada kode <code>doGet(e)</code> di GAS Anda menyertakan <code>setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)</code> agar halaman bisa dimuat secara mulus di dalam iframe Blogger tanpa diblokir browser.
            </p>
            <pre className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-blue-300 mt-2 overflow-x-auto">
{`function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Aplikasi PWA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`}
            </pre>
          </div>
          <div className="border-b border-slate-800 pb-3">
            <strong className="text-white block mb-1">2. Izin Kamera & Lokasi GPS</strong>
            <p>
              Template XML yang dihasilkan oleh Rahaza PWA Generator sudah dilengkapi atribut <code>allow=&quot;camera; microphone; geolocation; ...&quot;</code> sehingga aplikasi absensi, pemindaian QR code barcode, dan geofencing dapat berfungsi optimal.
            </p>
          </div>
          <div>
            <strong className="text-amber-400 block mb-1">3. Wajib Buat Deployment Baru (New Version) Setelah Edit Code.gs</strong>
            <p>
              Menyimpan proyek (Ctrl + S) saja tidak langsung memperbarui URL WebApp. Selalu buka <strong>Deploy &gt; Manage Deployments &gt; Edit (Ikon Pensil) &gt; Version: New Version &gt; Deploy</strong> agar perubahan kode <code>ALLOWALL</code> langsung bekerja di Blogger!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
