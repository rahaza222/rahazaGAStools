import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PwaGenerator } from './views/PwaGenerator';
import { PwaSimulator } from './views/PwaSimulator';
import { PwaGuide } from './views/PwaGuide';
import { View, PwaConfig } from './types';
import { getCurrentLicenseStatus, LicenseStatus } from './lib/license';
import { LicenseActivationModal } from './components/LicenseActivationModal';
import { AdminLicenseGeneratorModal } from './components/AdminLicenseGeneratorModal';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('generator');
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>(getCurrentLicenseStatus());
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const refreshLicense = () => {
    setLicenseStatus(getCurrentLicenseStatus());
  };

  // 🚪 3 Cara Membuka Portal Rahasia Admin:
  // 1. Shortcut Keyboard (Ctrl + Shift + A atau Cmd + Shift + A)
  // 2. URL Query (?admin=portal atau ?secret=rahaza)
  // 3. URL Hash (#admin atau #keygen)
  useEffect(() => {
    // 1. Keyboard shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 2. Check URL Query Parameters & 3. Check URL Hash
    const checkSecretUrlTriggers = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const adminParam = urlParams.get('admin');
        const secretParam = urlParams.get('secret');
        const hash = window.location.hash.toLowerCase();

        if (
          adminParam === 'portal' ||
          secretParam === 'rahaza' ||
          secretParam === 'artaqu' ||
          hash === '#admin' ||
          hash === '#keygen'
        ) {
          setIsAdminModalOpen(true);
        }
      } catch {
        // ignore
      }
    };

    checkSecretUrlTriggers();
    window.addEventListener('hashchange', checkSecretUrlTriggers);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkSecretUrlTriggers);
    };
  }, []);

  const [config, setConfig] = useState<PwaConfig>({
    url: '',
    name: '',
    shortName: '',
    desc: '',
    themeColor: '#2563EB',
    bgColor: '#0F172A',
    display: 'standalone',
    orientation: 'portrait-primary',
    iconType: 'text',
    iconUrl: '',
    iconText: '',
    icon192Src: null,
    icon512Src: null,
    permissions: {
      camera: false,
      microphone: false,
      geolocation: false,
      displayCapture: false,
      autoplay: true,
    },
    enablePullToRefresh: true,
    enableSplashLoader: true,
    enableInstallPrompt: true,
    installButtonText: 'Install Aplikasi',
    serviceWorkerUrl: '',
  });

  return (
    <>
      <Layout 
        currentView={currentView} 
        setView={setCurrentView}
        isPro={licenseStatus.isPro}
        onOpenUpgradeModal={() => setIsLicenseModalOpen(true)}
        onOpenAdminPortal={() => setIsAdminModalOpen(true)}
      >
        {currentView === 'generator' && (
          <PwaGenerator
            config={config}
            setConfig={setConfig}
            onOpenSimulator={() => setCurrentView('simulator')}
            isPro={licenseStatus.isPro}
            onOpenUpgradeModal={() => setIsLicenseModalOpen(true)}
          />
        )}
        {currentView === 'simulator' && (
          <PwaSimulator 
            config={config} 
            isPro={licenseStatus.isPro}
            onOpenUpgradeModal={() => setIsLicenseModalOpen(true)}
          />
        )}
        {currentView === 'guide' && (
          <PwaGuide />
        )}
      </Layout>

      {/* User License Activation Modal */}
      <LicenseActivationModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onLicenseChanged={refreshLicense}
      />

      {/* Secret Developer License Generator Portal (PIN: 399339) */}
      <AdminLicenseGeneratorModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLicenseChanged={refreshLicense}
      />
    </>
  );
}
