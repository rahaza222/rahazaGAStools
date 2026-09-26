import React, { useState, useEffect } from 'react';
import { 
  AppWindow, SlidersHorizontal, Link as LinkIcon, Download, Copy, Check, 
  ExternalLink, Smartphone, CheckCircle2, ShieldCheck, DownloadCloud,
  Layers, Info, ArrowUpRight, Sparkles, AlertTriangle, Wand2, Crown
} from 'lucide-react';
import { PwaConfig, PwaPermissions } from '../types';
import { base64EncodeSafe, createSVGString, getKbSize } from '../lib/utils';
import { HomeScreenIconPreview } from '../components/HomeScreenIconPreview';
import { GasPatcherModal } from '../components/GasPatcherModal';

interface PwaGeneratorProps {
  config: PwaConfig;
  setConfig: React.Dispatch<React.SetStateAction<PwaConfig>>;
  onOpenSimulator?: () => void;
  isPro?: boolean;
  onOpenUpgradeModal?: () => void;
}

export function PwaGenerator({ 
  config, 
  setConfig, 
  onOpenSimulator,
  isPro = false,
  onOpenUpgradeModal 
}: PwaGeneratorProps) {
  const [outputTab, setOutputTab] = useState<'xml' | 'manifest' | 'checklist'>('xml');
  const [xmlOutput, setXmlOutput] = useState('');
  const [manifestOutput, setManifestOutput] = useState('');
  const [kbSize, setKbSize] = useState('0');
  const [copied, setCopied] = useState(false);
  const [isPatcherOpen, setIsPatcherOpen] = useState(false);

  // Handle local image upload with canvas resizing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (typeof window !== 'undefined' && typeof window.FileReader !== 'undefined') {
        const reader = new window.FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.onload = () => {
            try {
              // 192x192
              const canvas192 = document.createElement('canvas');
              canvas192.width = 192;
              canvas192.height = 192;
              canvas192.getContext('2d')?.drawImage(img, 0, 0, 192, 192);
              const src192 = canvas192.toDataURL('image/webp', 0.85);

              // 512x512
              const canvas512 = document.createElement('canvas');
              canvas512.width = 512;
              canvas512.height = 512;
              canvas512.getContext('2d')?.drawImage(img, 0, 0, 512, 512);
              const src512 = canvas512.toDataURL('image/webp', 0.85);

              setConfig(prev => ({
                ...prev,
                icon192Src: src192,
                icon512Src: src512,
              }));
            } catch {
              // canvas export fallback
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // ignore
    }
  };

  // Toggle permission
  const togglePermission = (key: keyof PwaPermissions) => {
    setConfig(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  // Real-time XML & Manifest generator
  useEffect(() => {
    let icon192 = '';
    let icon512 = '';
    let mimeType = 'image/png';

    if (config.iconType === 'url') {
      if (config.iconUrl) {
        icon192 = config.iconUrl;
        icon512 = config.iconUrl;
      } else {
        const svg = createSVGString(192, config.bgColor, config.themeColor, config.iconText || '?');
        const b64 = `data:image/svg+xml;base64,${base64EncodeSafe(svg)}`;
        icon192 = b64;
        icon512 = b64;
        mimeType = 'image/svg+xml';
      }
    } else if (config.iconType === 'text') {
      icon192 = `data:image/svg+xml;base64,${base64EncodeSafe(createSVGString(192, config.bgColor, config.themeColor, config.iconText || '?'))}`;
      icon512 = `data:image/svg+xml;base64,${base64EncodeSafe(createSVGString(512, config.bgColor, config.themeColor, config.iconText || '?'))}`;
      mimeType = 'image/svg+xml';
    } else if (config.iconType === 'image') {
      if (config.icon192Src && config.icon512Src) {
        icon192 = config.icon192Src;
        icon512 = config.icon512Src;
        mimeType = 'image/webp';
      } else {
        const svg = createSVGString(192, config.bgColor, config.themeColor, '?');
        const b64 = `data:image/svg+xml;base64,${base64EncodeSafe(svg)}`;
        icon192 = b64;
        icon512 = b64;
        mimeType = 'image/svg+xml';
      }
    }

    const manifestObj = {
      id: '/',
      name: config.name || 'Rahaza WebApp PWA',
      short_name: config.shortName || 'App',
      description: config.desc || 'Progressive Web App injected for Google Apps Script',
      start_url: '/',
      scope: '/',
      display: config.display || 'standalone',
      background_color: config.bgColor,
      theme_color: config.themeColor,
      orientation: config.orientation || 'portrait-primary',
      icons: [
        {
          src: icon192,
          sizes: '192x192',
          type: mimeType,
          purpose: 'any',
        },
        {
          src: icon192,
          sizes: '192x192',
          type: mimeType,
          purpose: 'maskable',
        },
        {
          src: icon512,
          sizes: '512x512',
          type: mimeType,
          purpose: 'any',
        },
        {
          src: icon512,
          sizes: '512x512',
          type: mimeType,
          purpose: 'maskable',
        },
      ],
    };

    const formattedManifest = JSON.stringify(manifestObj, null, 2);
    setManifestOutput(formattedManifest);

    const b64Manifest = base64EncodeSafe(JSON.stringify(manifestObj));

    // Construct active permissions for iframe
    const perms: string[] = [];
    if (config.permissions.camera) perms.push('camera');
    if (config.permissions.microphone) perms.push('microphone');
    if (config.permissions.geolocation) perms.push('geolocation');
    if (config.permissions.displayCapture) perms.push('display-capture');
    if (config.permissions.autoplay) perms.push('autoplay');
    perms.push('clipboard-write', 'clipboard-read');
    const allowAttr = perms.join('; ');

    // Safe prologue
    const xmlPrologue = '<' + '?xml version="1.0" encoding="UTF-8" ?' + '>';
    const licenseComment = isPro
      ? '<!-- Rahaza PWA XML Suite PRO - Licensed White-Label Production Edition -->'
      : '<!-- Generated by Rahaza PWA XML Generator (Free Edition - Upgrade to PRO for White-Label) -->';
    
    const xmlTemplate = `${xmlPrologue}
${licenseComment}
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsversion='3' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/namespaces/gae/2008' xmlns:data='http://www.google.com/namespaces/atom' xmlns:expr='http://www.google.com/namespaces/all/0.8'>
<head>
  <title><data:blog.pageTitle/></title>
  <meta charset='utf-8'/>
  <meta content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover' name='viewport'/>

  <!-- PWA Manifest via Data URI -->
  <link href='data:application/manifest+json;base64,${b64Manifest}' rel='manifest'/>

  <!-- Primary PWA Meta Tags -->
  <meta content='${config.themeColor}' name='theme-color'/>
  <meta content='yes' name='mobile-web-app-capable'/>
  <meta content='yes' name='apple-mobile-web-app-capable'/>
  <meta content='black-translucent' name='apple-mobile-web-app-status-bar-style'/>
  <meta content='${config.shortName || 'App'}' name='apple-mobile-web-app-title'/>
  <meta content='${config.desc || ''}' name='description'/>
  <link href='${icon192}' rel='apple-touch-icon'/>
  <link href='${icon192}' rel='icon' type='${mimeType}'/>

  <!-- Reset & Fullscreen Styles -->
  <b:skin><![CDATA[
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: ${config.bgColor};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #app-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    iframe#gas-frame {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
    }
    #pwa-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${config.bgColor};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: opacity 0.4s ease-out, visibility 0.4s;
    }
    .spinner {
      width: 38px;
      height: 38px;
      border: 3px solid rgba(255,255,255,0.15);
      border-top-color: ${config.themeColor};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Floating PWA Install Banner */
    #pwa-install-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 420px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 20px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 9998;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
    .pwa-banner-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
      background: ${config.bgColor};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }
    .pwa-banner-info {
      flex: 1;
      min-width: 0;
    }
    .pwa-banner-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pwa-banner-desc {
      font-size: 11px;
      color: #64748b;
      margin: 2px 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pwa-banner-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .pwa-install-btn {
      background: ${config.themeColor || '#2563EB'};
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      transition: transform 0.15s, opacity 0.15s;
    }
    .pwa-install-btn:active {
      transform: scale(0.96);
    }
    .pwa-close-btn {
      background: #f1f5f9;
      border: none;
      color: #64748b;
      font-size: 14px;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pwa-close-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    /* Floating Mini Install Button (shown when banner is dismissed) */
    #pwa-mini-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${config.themeColor || '#2563EB'};
      color: #ffffff;
      border: none;
      border-radius: 50px;
      padding: 10px 16px;
      font-size: 12px;
      font-weight: 700;
      display: none;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      z-index: 9997;
      cursor: pointer;
    }

    /* iOS Safari Install Guide Modal */
    #pwa-ios-modal {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: #ffffff;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -12px 32px rgba(0,0,0,0.22);
      padding: 22px 20px 32px 20px;
      z-index: 99999;
      display: none;
      text-align: center;
    }
    #pwa-ios-modal.show {
      display: block;
      animation: pwaSlideUp 0.3s ease-out;
    }
    @keyframes pwaSlideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  ]]></b:skin>
</head>
<body>
  ${config.enableSplashLoader ? `
  <div id='pwa-loader'>
    <div class='spinner'></div>
    <div style='margin-top:14px;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.5px;'>${config.name || 'Memuat...'}</div>
  </div>
  ` : ''}

  <div id='app-container'>
    <iframe allow='${allowAttr}' id='gas-frame' src='${config.url || '#'}'/>
  </div>

  ${config.enableInstallPrompt ? `
  <!-- In-App Floating Install Banner -->
  <div id='pwa-install-banner'>
    <img alt='${config.shortName || 'App'}' class='pwa-banner-icon' src='${icon192}'/>
    <div class='pwa-banner-info'>
      <div class='pwa-banner-title'>${config.name || 'Aplikasi PWA'}</div>
      <div class='pwa-banner-desc'>Pasang di Beranda HP Anda</div>
    </div>
    <div class='pwa-banner-actions'>
      <button class='pwa-install-btn' id='pwa-btn-trigger' type='button'>${config.installButtonText || 'Install'}</button>
      <button aria-label='Tutup' class='pwa-close-btn' id='pwa-btn-close' type='button'>&#x2715;</button>
    </div>
  </div>

  <!-- Mini Re-open Button -->
  <button id='pwa-mini-btn' type='button'>
    <svg fill='none' height='15' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.2' viewBox='0 0 24 24' width='15'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='7 10 12 15 17 10'/><line x1='12' x2='12' y1='15' y2='3'/></svg>
    <span>${config.installButtonText || 'Install'}</span>
  </button>

  <!-- iOS Safari Instructions Modal -->
  <div id='pwa-ios-modal'>
    <div style='width:40px;height:4px;background:#e2e8f0;border-radius:4px;margin:0 auto 16px auto;'/>
    <img alt='Icon' src='${icon192}' style='width:56px;height:56px;border-radius:14px;margin:0 auto 12px auto;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.1);'/>
    <h4 style='font-size:16px;font-weight:700;color:#0f172a;margin:0 0 6px 0;'>Pasang ${config.shortName || 'Aplikasi'} di iPhone</h4>
    <p style='font-size:13px;color:#475569;line-height:1.5;margin:0 0 18px 0;max-width:340px;margin-left:auto;margin-right:auto;'>
      1. Ketuk tombol <strong>Bagikan (Share)</strong> <span style='font-size:16px;'>&#x2399;</span> di bilah bawah Safari.<br/>
      2. Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.
    </p>
    <button id='pwa-ios-close' style='background:#f1f5f9;border:none;border-radius:12px;padding:10px 28px;font-weight:700;font-size:13px;color:#334155;cursor:pointer;' type='button'>Mengerti</button>
  </div>
  ` : ''}

  <script type='text/javascript'>
    //<![CDATA[
    window.addEventListener('load', function() {
      // Hide Splash Loader
      var loader = document.getElementById('pwa-loader');
      if (loader) {
        setTimeout(function() {
          loader.style.opacity = '0';
          setTimeout(function() { loader.style.display = 'none'; }, 400);
        }, 600);
      }
    });

    // PWA Install Prompt & Standalone Mode Logic
    var deferredPrompt = null;
    var banner = document.getElementById('pwa-install-banner');
    var miniBtn = document.getElementById('pwa-mini-btn');
    var btnTrigger = document.getElementById('pwa-btn-trigger');
    var btnClose = document.getElementById('pwa-btn-close');
    var iosModal = document.getElementById('pwa-ios-modal');
    var iosClose = document.getElementById('pwa-ios-close');

    // Detect if app is already running as installed standalone PWA
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.matchMedia('(display-mode: fullscreen)').matches || 
                       (window.navigator && window.navigator.standalone === true);

    var userAgent = (window.navigator && window.navigator.userAgent) ? window.navigator.userAgent.toLowerCase() : '';
    var isIOS = /iphone|ipad|ipod/.test(userAgent);

    if (isStandalone) {
      // Suppress install banners completely when already running as an installed PWA
      if (banner) banner.style.display = 'none';
      if (miniBtn) miniBtn.style.display = 'none';
    } else {
      // Listen for Android / Chrome / Edge native install prompt
      window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        if (banner) banner.style.display = 'flex';
      });

      // Handle Install Button Click
      if (btnTrigger) {
        btnTrigger.addEventListener('click', function() {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choice) {
              if (choice && choice.outcome === 'accepted') {
                if (banner) banner.style.display = 'none';
                if (miniBtn) miniBtn.style.display = 'none';
              }
              deferredPrompt = null;
            });
          } else if (isIOS) {
            if (iosModal) iosModal.classList.add('show');
          } else {
            // General guidance for Desktop / other browsers
            alert('Untuk mengunduh/memasang aplikasi ini:\\n1. Klik ikon Install (+) di bilah alamat browser Anda, ATAU\\n2. Buka Menu Browser (titik tiga) lalu pilih "Instal Aplikasi" / "Tambahkan ke Layar Utama".');
          }
        });
      }

      if (miniBtn) {
        miniBtn.addEventListener('click', function() {
          if (btnTrigger) btnTrigger.click();
        });
      }

      if (btnClose) {
        btnClose.addEventListener('click', function() {
          if (banner) banner.style.display = 'none';
          if (miniBtn) miniBtn.style.display = 'flex';
        });
      }

      if (iosClose && iosModal) {
        iosClose.addEventListener('click', function() {
          iosModal.classList.remove('show');
        });
      }

      // Hide banners immediately upon successful installation
      window.addEventListener('appinstalled', function() {
        if (banner) banner.style.display = 'none';
        if (miniBtn) miniBtn.style.display = 'none';
        deferredPrompt = null;
      });
    }
    //]]>
  </script>

  <!-- Required Blogger Section -->
  <b:section id='main' showaddelement='no'>
    <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' visible='false'/>
  </b:section>
</body>
</html>`;

    setXmlOutput(xmlTemplate);
    setKbSize(getKbSize(xmlTemplate));
  }, [config]);

  const downloadXML = () => {
    const fileName = `theme-${(config.shortName || 'app').toLowerCase().replace(/[^a-z0-9]/g, '-')}.xml`;
    try {
      const blob = new Blob([xmlOutput], { type: 'text/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback via data URI
      const encoded = encodeURIComponent(xmlOutput);
      const a = document.createElement('a');
      a.href = `data:text/xml;charset=utf-8,${encoded}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const downloadManifest = () => {
    const fileName = `manifest.json`;
    try {
      const blob = new Blob([manifestOutput], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback via data URI
      const encoded = encodeURIComponent(manifestOutput);
      const a = document.createElement('a');
      a.href = `data:application/json;charset=utf-8,${encoded}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const downloadIconAsset = (size: 192 | 512) => {
    const src = size === 192 ? config.icon192Src : config.icon512Src;
    if (!src) {
      return;
    }
    const fileName = `icon-${(config.shortName || 'app').toLowerCase()}-${size}x${size}.webp`;
    const a = document.createElement('a');
    a.href = src;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    const textToCopy = outputTab === 'xml' ? xmlOutput : manifestOutput;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* PWA Verification & Install Support Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Template XML Blogger Siap &amp; Mendukung PWA 100%
                </h3>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Template ini telah dilengkapi <strong>Web App Manifest W3C</strong>, meta tags <code>theme-color</code>, penanganan event <code>beforeinstallprompt</code>, serta <strong>tombol &amp; banner install interaktif</strong> yang otomatis muncul di smartphone agar pengunjung dapat langsung mengunduh/memasang aplikasi ke beranda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 px-3.5 py-2 rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                Tes Tombol di Simulator
              </button>
            )}
          </div>
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-emerald-800/40 text-[11px]">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Banner Install Android/Chrome</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Panduan Pasang iPhone Safari</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Auto-Hide saat Standalone</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Manifest Base64 Data-URI</span>
          </div>
        </div>
      </div>

      {/* Licensing Status Card (PRO vs Free) */}
      {!isPro ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>Versi Free: Template Berfungsi Penuh</span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.2 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Promo Launch
                </span>
              </div>
              <p className="text-[11px] text-amber-900 mt-1 leading-snug">
                Dapatkan <strong>Rahaza PRO</strong> hanya <span className="line-through opacity-70">Rp 49.000</span> <strong className="text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded font-black text-xs">Rp 15.000</strong> (Sekali Bayar Selamanya) untuk menghapus watermark &amp; lisensi komersial penuh!
              </p>
            </div>
          </div>
          {onOpenUpgradeModal && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Upgrade PRO</span>
              <span className="inline-flex items-center gap-1 bg-amber-900/60 px-1.5 py-0.5 rounded text-[10px]">
                <span className="line-through opacity-75">Rp 49rb</span>
                <span className="text-amber-200 font-extrabold">Rp 15rb</span>
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/10 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-950">
            <Crown className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">Status: Akun PRO Lifetime Aktif</span>
            <span className="text-gray-400 hidden sm:inline">•</span>
            <span className="text-gray-600 hidden sm:inline">White-Label Bebas Hak Cipta &amp; Download Tak Terbatas</span>
          </div>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            White-Label Active
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Configuration Form */}
        <div className="xl:col-span-6 flex flex-col space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h4 className="text-xs font-bold tracking-widest text-gray-900 uppercase flex items-center gap-2">
                <SlidersHorizontal className="text-blue-600 w-4 h-4" />
                Konfigurasi PWA WebApp
              </h4>
              <span className="text-[10px] font-mono text-gray-400">BLOGGER XML V3</span>
            </div>

            {/* URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-800">
                  URL Google Apps Script (exec)
                </label>
                {config.url && config.url.startsWith('http') && (
                  <a
                    href={config.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Tes Buka Tab Baru <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center">
                <span className="bg-gray-50 border border-gray-200 border-r-0 px-3 py-2.5 rounded-l-xl text-gray-400">
                  <LinkIcon className="w-4 h-4" />
                </span>
                <input
                  type="url"
                  value={config.url}
                  onChange={e => setConfig({ ...config, url: e.target.value })}
                  className="flex-grow border border-gray-200 bg-gray-50 text-blue-900 px-3 py-2.5 rounded-r-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs font-mono transition-colors"
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
              </div>

              {/* Smart Code.gs Helper Banner */}
              <div className="mt-2.5 p-3 bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <span>Layar Blank atau Menolak Terhubung?</span>
                      <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold uppercase">Solusi GAS</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                      Tambahkan kode <code className="font-mono font-bold bg-amber-100/80 px-1 rounded text-amber-900">ALLOWALL</code> di Code.gs agar Google mengizinkan iframe Blogger.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPatcherOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Perbaiki Code.gs</span>
                </button>
              </div>

              <p className="text-[10px] text-gray-500 mt-2">
                Gunakan URL deployment Web App berakhiran <code className="bg-gray-100 px-1 rounded">/exec</code> dengan hak akses Anyone.
              </p>
            </div>

            {/* Name & Short Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Nama Lengkap Aplikasi
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={e => setConfig({ ...config, name: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs transition-colors"
                  placeholder="Contoh: Toko Online Rahaza"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Nama Pendek (Home Screen)
                </label>
                <input
                  type="text"
                  value={config.shortName}
                  maxLength={12}
                  onChange={e => setConfig({ ...config, shortName: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs transition-colors"
                  placeholder="Maks 12 huruf"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Deskripsi Aplikasi
              </label>
              <input
                type="text"
                value={config.desc}
                onChange={e => setConfig({ ...config, desc: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-xs transition-colors"
                placeholder="Penjelasan ringkas mengenai fungsi aplikasi"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Theme Color (Status Bar &amp; Tombol)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={e => setConfig({ ...config, themeColor: e.target.value })}
                    className="w-9 h-9 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.themeColor}
                    onChange={e => setConfig({ ...config, themeColor: e.target.value })}
                    className="w-24 text-xs font-mono uppercase bg-white border border-gray-200 px-2 py-1 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Background Color (Splash)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={e => setConfig({ ...config, bgColor: e.target.value })}
                    className="w-9 h-9 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.bgColor}
                    onChange={e => setConfig({ ...config, bgColor: e.target.value })}
                    className="w-24 text-xs font-mono uppercase bg-white border border-gray-200 px-2 py-1 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* PWA Install Button Settings */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">Tombol Install PWA di Halaman Web</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Rekomendasi
                </span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Menampilkan floating banner &amp; tombol install yang otomatis memicu dialog download/pasang di Android/Chrome atau panduan di iPhone Safari.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableInstallPrompt}
                    onChange={e => setConfig({ ...config, enableInstallPrompt: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Aktifkan Banner &amp; Tombol
                </label>
                <div>
                  <input
                    type="text"
                    value={config.installButtonText}
                    onChange={e => setConfig({ ...config, installButtonText: e.target.value })}
                    className="w-full bg-white border border-blue-200 text-blue-900 px-3 py-1.5 rounded-lg text-xs"
                    placeholder="Teks tombol (cth: Install)"
                  />
                </div>
              </div>
            </div>

            {/* Display & Orientation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Tampilan (Display Mode)
                </label>
                <select
                  value={config.display}
                  onChange={e => setConfig({ ...config, display: e.target.value as any })}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="standalone">Standalone (Seperti Native App)</option>
                  <option value="fullscreen">Fullscreen (Layar Penuh)</option>
                  <option value="minimal-ui">Minimal UI (Dengan Navigasi Minimal)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Orientasi Layar
                </label>
                <select
                  value={config.orientation}
                  onChange={e => setConfig({ ...config, orientation: e.target.value as any })}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-900 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="portrait-primary">Tegak (Portrait)</option>
                  <option value="any">Bebas (Auto Rotate)</option>
                  <option value="landscape">Mendatar (Landscape)</option>
                </select>
              </div>
            </div>

            {/* Hardware Permissions (Iframe Allow) */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                Izin Perangkat untuk Iframe (Permissions)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'camera', label: '📷 Kamera (Selfie/QR)' },
                  { id: 'geolocation', label: '📍 Lokasi GPS' },
                  { id: 'microphone', label: '🎤 Mikrofon' },
                  { id: 'autoplay', label: '🔊 Autoplay Audio' },
                  { id: 'displayCapture', label: '🖥️ Rekam Layar' },
                ].map(item => {
                  const key = item.id as keyof PwaPermissions;
                  const isActive = !!config.permissions[key];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePermission(key)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icon Source */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-700">
                Pilihan Sumber Ikon PWA
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="radio"
                    name="iconType"
                    checked={config.iconType === 'text'}
                    onChange={() => setConfig({ ...config, iconType: 'text' })}
                    className="text-blue-600"
                  />
                  Inisial Teks SVG
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="radio"
                    name="iconType"
                    checked={config.iconType === 'url'}
                    onChange={() => setConfig({ ...config, iconType: 'url' })}
                    className="text-blue-600"
                  />
                  URL Gambar
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="radio"
                    name="iconType"
                    checked={config.iconType === 'image'}
                    onChange={() => setConfig({ ...config, iconType: 'image' })}
                    className="text-blue-600"
                  />
                  Upload Logo
                </label>
              </div>

              {config.iconType === 'text' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Huruf Inisial (Maksimal 2 Karakter)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={config.iconText}
                    onChange={e => setConfig({ ...config, iconText: e.target.value.toUpperCase() })}
                    className="w-20 text-center font-bold text-lg border border-gray-300 bg-white text-gray-900 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>
              )}

              {config.iconType === 'url' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Link Langsung Gambar (PNG / JPG / SVG)
                  </label>
                  <input
                    type="url"
                    value={config.iconUrl}
                    onChange={e => setConfig({ ...config, iconUrl: e.target.value })}
                    className="w-full border border-gray-300 bg-white text-gray-900 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-mono"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              )}

              {config.iconType === 'image' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Upload Gambar (Auto Resize 192x192 & 512x512 WebP)
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    />
                  </div>
                  {config.icon192Src && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => downloadIconAsset(192)}
                        className="flex-1 text-[11px] font-medium border border-gray-300 bg-white hover:bg-gray-50 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3 h-3" /> Unduh 192x192
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadIconAsset(512)}
                        className="flex-1 text-[11px] font-medium border border-gray-300 bg-white hover:bg-gray-50 py-1.5 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3 h-3" /> Unduh 512x512
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Extras */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={config.enableSplashLoader}
                  onChange={e => setConfig({ ...config, enableSplashLoader: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Sertakan Animasi Loading / Splash Screen saat membuka aplikasi
              </label>
            </div>
          </div>

          {/* Interactive Home Screen Icon Preview */}
          <HomeScreenIconPreview config={config} />
        </div>

        {/* Right: Code Generator Output & Checklist */}
        <div className="xl:col-span-6 flex flex-col h-full min-h-[680px]">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            {/* Output Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="bg-gray-200/80 p-0.5 rounded-lg flex text-xs font-semibold">
                  <button
                    onClick={() => setOutputTab('xml')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      outputTab === 'xml' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>Template XML Blogger</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-extrabold uppercase">Wajib Blogger</span>
                  </button>
                  <button
                    onClick={() => setOutputTab('manifest')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      outputTab === 'manifest' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>Manifest JSON</span>
                    <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.2 rounded font-medium">Opsional</span>
                  </button>
                  <button
                    onClick={() => setOutputTab('checklist')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      outputTab === 'checklist' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Audit PWA
                  </button>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    parseFloat(kbSize) > 80
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {kbSize} KB
                </span>
              </div>

              {outputTab !== 'checklist' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'TERSALIN' : 'SALIN KODE'}
                  </button>
                  {outputTab === 'xml' ? (
                    <button
                      onClick={downloadXML}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      DOWNLOAD XML
                    </button>
                  ) : (
                    <button
                      onClick={downloadManifest}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      DOWNLOAD JSON
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Main Content Area */}
            {outputTab === 'checklist' ? (
              <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50 text-slate-800">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5" />
                    PWA Installability Checklist (Standar W3C &amp; Chromium)
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Berikut adalah hasil audit kesiapan PWA pada template Blogger yang dihasilkan oleh Rahaza PWA:
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-emerald-950 block font-bold">1. Web App Manifest (W3C Standard)</strong>
                        <span className="text-emerald-800">
                          Manifest di-embed sebagai data URI Base64 lengkap dengan <code>id</code>, <code>start_url</code>, <code>scope</code>, <code>display: {config.display}</code>, dan ikon 192x192 &amp; 512x512 maskable.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-emerald-950 block font-bold">2. In-App Install Prompt UI (beforeinstallprompt)</strong>
                        <span className="text-emerald-800">
                          Template menyertakan banner install melayang (floating bar) dan tombol pemicu event <code>beforeinstallprompt</code> asli Chrome/Android sehingga dialog unduh/pasang langsung muncul saat diklik.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-emerald-950 block font-bold">3. Kompatibilitas iPhone &amp; iPad (iOS Safari)</strong>
                        <span className="text-emerald-800">
                          Karena Apple iOS tidak mendukung <code>beforeinstallprompt</code>, template menyertakan deteksi otomatis perangkat iOS dan menampilkan popup panduan ramah pengguna (Share &gt; Add to Home Screen).
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-emerald-950 block font-bold">4. Deteksi Mode Standalone (Auto-Hide)</strong>
                        <span className="text-emerald-800">
                          Banner install otomatis lenyap ketika aplikasi dibuka dari beranda (mode <code>display-mode: standalone</code>) agar tidak mengganggu antarmuka WebApp Google Apps Script Anda.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-emerald-950 block font-bold">5. Izin Iframe Lengkap (Hardware Permissions)</strong>
                        <span className="text-emerald-800">
                          Atribut <code>allow=&quot;camera; microphone; geolocation; ...&quot;</code> disematkan pada tag iframe Blogger sehingga WebApp GAS dapat mengakses kamera selfie, scanner QR, dan GPS tanpa kendala.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Cara Pengujian:</strong> Pasang template XML ini ke Blogger Anda, lalu buka tautan blogspot di Google Chrome HP atau Safari iPhone. Banner install akan langsung tampil di bagian bawah layar!
                  </div>
                </div>
              </div>
            ) : (
              /* Code Output Textarea */
              <div className="flex-1 relative bg-slate-950 font-mono text-xs overflow-hidden flex flex-col">
                {outputTab === 'manifest' ? (
                  <div className="bg-amber-950/80 border-b border-amber-800/40 p-3 px-4 text-xs text-amber-200 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-300">Catatan Khusus Pengguna Blogger:</strong>
                      <span className="text-[11px] leading-relaxed text-amber-100">
                        Anda <strong>TIDAK PERLU</strong> mengunduh file Manifest JSON ini. Seluruh data Manifest dan Ikon PWA sudah otomatis disematkan (embedded Base64) di dalam <strong>Template XML Blogger</strong>. Tab ini hanya disediakan jika Anda menggunakan hosting mandiri (cPanel / Vercel / Cloudflare).
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border-b border-slate-800 p-2.5 px-4 text-xs text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px]"><strong>All-In-One:</strong> Cukup salin kode XML ini ke Blogger &gt; Tema &gt; Edit HTML.</span>
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Otomatis Termasuk Manifest + Ikon + Tombol Install</span>
                  </div>
                )}
                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                  <textarea
                    className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-[11px] leading-relaxed border-0 focus:outline-none focus:ring-0 resize-none selection:bg-blue-900 selection:text-white"
                    readOnly
                    value={outputTab === 'xml' ? xmlOutput : manifestOutput}
                    placeholder="Template code will be generated here..."
                  />
                </div>
              </div>
            )}

            {/* Bottom Status / Instructions Bar */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-gray-500">
                <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                Siap di-paste ke Blogger &gt; Tema &gt; Edit HTML
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isPro ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {isPro ? '👑 PRO White-Label' : 'Free Edition'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {outputTab === 'xml' ? 'Format: Blogger XML Theme (PWA Ready)' : outputTab === 'manifest' ? 'Format: W3C WebApp Manifest' : 'Status: 100% PWA Compliant'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code.gs ALLOWALL Auto-Patcher Modal */}
      <GasPatcherModal isOpen={isPatcherOpen} onClose={() => setIsPatcherOpen(false)} />
    </div>
  );
}
