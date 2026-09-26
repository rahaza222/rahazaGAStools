/**
 * Utility functions for WebApp Merger & PWA Suite
 */

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function base64EncodeSafe(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    return '';
  }
}

export function createSVGString(
  size: number,
  bgColor: string,
  themeColor: string,
  text: string
): string {
  const safeText = escapeHtml(text || '?');
  const fontSize = Math.round(size * 0.45);
  const rx = Math.round(size * 0.2);
  const cr = Math.round(size * 0.38);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bgColor || '#1A1A2E'}" rx="${rx}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${cr}" fill="${themeColor || '#E63946'}" opacity="0.2"/>
  <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${themeColor || '#FFFFFF'}" text-anchor="middle" dominant-baseline="middle">${safeText}</text>
</svg>`;
}

export function getKbSize(str: string): string {
  try {
    if (typeof TextEncoder !== 'undefined') {
      const bytes = new TextEncoder().encode(str).length;
      return (bytes / 1024).toFixed(2);
    }
  } catch {
    // fallback
  }
  return ((str || '').length / 1024).toFixed(2);
}
