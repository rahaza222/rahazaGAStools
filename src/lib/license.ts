/**
 * Rahaza PWA License & Security Engine
 * - Admin PIN: 399339
 * - Format Lisensi: RHZPROXXXXXXXXXXXX (Total 18 karakter, contoh: RHZPRO897TYG350GRF)
 * - WhatsApp Admin: +6281911934000
 */

export const ADMIN_PIN = '399339';
export const WA_NUMBER = '6281911934000';
export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20Admin%20Rahaza%2C%20saya%20ingin%20membeli%20Kode%20Lisensi%20PRO%20PWA%20Generator%20(Promo%20Rp%2015.000)`;

const STORAGE_KEY_PRO = 'rahaza_pwa_pro_license';
const STORAGE_KEY_LIST = 'rahaza_pwa_generated_licenses';

// Karakter aman tanpa huruf ambigu (O, 0, I, 1)
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Menghitung 3 karakter checksum dari string 9 karakter
 */
function calculateChecksum(payload: string): string {
  let hash = 0x5a5a;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash + payload.charCodeAt(i) * (i + 7)) & 0xffffff;
  }
  const c1 = CHARS[Math.abs(hash) % CHARS.length];
  const c2 = CHARS[Math.abs(hash >> 5) % CHARS.length];
  const c3 = CHARS[Math.abs(hash >> 10) % CHARS.length];
  return `${c1}${c2}${c3}`;
}

/**
 * Generate 1 buah kode lisensi format RHZPRO897TYG350GRF (18 karakter)
 */
export function generateLicenseKey(note: string = ''): { key: string; note: string; createdAt: string } {
  let payload = '';
  for (let i = 0; i < 9; i++) {
    const idx = Math.floor(Math.random() * CHARS.length);
    payload += CHARS[idx];
  }
  const checksum = calculateChecksum(payload);
  const key = `RHZPRO${payload}${checksum}`;

  const licenseRecord = {
    key,
    note: note.trim() || 'Pembeli PRO',
    createdAt: new Date().toISOString(),
  };

  // Simpan ke riwayat admin di localStorage
  try {
    const current = getGeneratedLicenses();
    const updated = [licenseRecord, ...current];
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return licenseRecord;
}

/**
 * Validasi apakah sebuah string adalah kode lisensi PRO yang sah
 */
export function validateLicenseKey(rawKey: string): boolean {
  if (!rawKey) return false;
  const key = rawKey.trim().toUpperCase().replace(/[\s-]/g, '');

  // Format wajib berawalan RHZPRO dan panjang 18 karakter
  if (!key.startsWith('RHZPRO') || key.length !== 18) {
    return false;
  }

  // Jika kunci ada dalam daftar lisensi yang pernah di-generate oleh admin
  const saved = getGeneratedLicenses();
  if (saved.some(item => item.key === key)) {
    return true;
  }

  // Verifikasi algoritma checksum
  const payload = key.substring(6, 15);
  const check = key.substring(15, 18);
  return calculateChecksum(payload) === check;
}

export interface LicenseStatus {
  isPro: boolean;
  licenseKey: string | null;
  activatedAt: string | null;
}

/**
 * Ambil status lisensi pengguna saat ini dari localStorage
 */
export function getCurrentLicenseStatus(): LicenseStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRO);
    if (!raw) return { isPro: false, licenseKey: null, activatedAt: null };

    const data = JSON.parse(raw);
    if (data && data.licenseKey && validateLicenseKey(data.licenseKey)) {
      return {
        isPro: true,
        licenseKey: data.licenseKey,
        activatedAt: data.activatedAt || null,
      };
    }
  } catch {
    // fallback
  }
  return { isPro: false, licenseKey: null, activatedAt: null };
}

/**
 * Aktivasi lisensi pengguna
 */
export function activateLicense(rawKey: string): { success: boolean; message: string } {
  const key = rawKey.trim().toUpperCase().replace(/[\s-]/g, '');
  if (!validateLicenseKey(key)) {
    return {
      success: false,
      message: 'Kode lisensi tidak valid atau salah ketik. Pastikan format diawali "RHZPRO..."',
    };
  }

  const payload: LicenseStatus = {
    isPro: true,
    licenseKey: key,
    activatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_PRO, JSON.stringify(payload));
  } catch {
    return { success: false, message: 'Gagal menyimpan status ke browser.' };
  }

  return {
    success: true,
    message: 'Selamat! Akun Anda berhasil diaktivasi ke versi PRO LIFETIME.',
  };
}

/**
 * Reset lisensi kembali ke Free (untuk testing)
 */
export function deactivateLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PRO);
  } catch {
    // ignore
  }
}

/**
 * Ambil daftar semua lisensi yang telah di-generate admin
 */
export function getGeneratedLicenses(): Array<{ key: string; note: string; createdAt: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIST);
    if (!raw) {
      // Sediakan lisensi contoh resmi agar admin langsung punya 1 lisensi aktif
      const defaultLicenses = [
        {
          key: 'RHZPRO897TYG350GRF',
          note: 'Master License Key (Default)',
          createdAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(defaultLicenses));
      return defaultLicenses;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Hapus 1 lisensi dari riwayat admin
 */
export function removeGeneratedLicense(keyToDelete: string): void {
  try {
    const current = getGeneratedLicenses();
    const updated = current.filter(item => item.key !== keyToDelete);
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
  } catch {
    // ignore
  }
}
