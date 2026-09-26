import React, { useState } from 'react';
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

  const [config, setConfig] = useState<PwaConfig>({
    url: 'https://script.google.com/macros/s/AKfycbwRMgTWzMfUhkwJSNlV84ecoLJ8w1j79qOIt5GhvWRkrQA7fEfsy5uXanVYqmaGI569CA/exec',
    name: 'Toko Online Rahaza',
    shortName: 'TokoApp',
    desc: 'Katalog belanja online, produk update otomatis dari Google Sheets',
    themeColor: '#2563EB',
    bgColor: '#0F172A',
    display: 'standalone',
    orientation: 'portrait-primary',
    iconType: 'text',
    iconUrl: '',
    iconText: 'TO',
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
          <PwaSimulator config={config} />
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
        onOpenAdminPortal={() => setIsAdminModalOpen(true)}
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
