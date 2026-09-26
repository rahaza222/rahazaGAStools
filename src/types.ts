export type IconType = 'url' | 'text' | 'image';

export type View = 'generator' | 'simulator' | 'guide';

export interface PwaPermissions {
  camera: boolean;
  microphone: boolean;
  geolocation: boolean;
  displayCapture: boolean;
  autoplay: boolean;
}

export interface PwaConfig {
  url: string;
  name: string;
  shortName: string;
  desc: string;
  themeColor: string;
  bgColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui';
  orientation: 'portrait-primary' | 'any' | 'landscape';
  iconType: IconType;
  iconUrl: string;
  iconText: string;
  icon192Src: string | null;
  icon512Src: string | null;
  permissions: PwaPermissions;
  enablePullToRefresh: boolean;
  enableSplashLoader: boolean;
  enableInstallPrompt: boolean;
  installButtonText: string;
  serviceWorkerUrl: string;
}
