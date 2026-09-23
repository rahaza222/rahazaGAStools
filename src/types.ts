export type View = 'dashboard' | 'pwa';

export type IconType = 'url' | 'text' | 'image';

export interface PwaConfig {
  url: string;
  name: string;
  shortName: string;
  desc: string;
  themeColor: string;
  bgColor: string;
  iconType: IconType;
  iconUrl: string;
  iconText: string;
  icon192Src: string | null;
  icon512Src: string | null;
}
