/**
 * Rahaza PWA XML PRO - License & Offline Cryptographic Engine
 * 
 * 100% Offline Deterministic Verification
 * Salt: RAHAZA_SECURE_SALT_2026_OFFLINE
 * Default Master PIN: 399339
 * Emergency Rescue Bypass: RAHAZA-ADMIN-2026
 */

export const DEFAULT_ADMIN_PIN = '399339';
export const EMERGENCY_BYPASS_CODE = 'RAHAZA-ADMIN-2026';
export const SECURE_SALT = 'RAHAZA_SECURE_SALT_2026_OFFLINE';

export const WA_NUMBER = '6281911934000';
export const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Halo%20Admin%20Rahaza%20PWA%20XML%20PRO%2C%20saya%20ingin%20membeli%20Kode%20Lisensi%20PRO%20Lifetime`;

// LocalStorage Keys
const STORAGE_KEY_PRO = 'rahaza_pwa_pro_license';
const STORAGE_KEY_LIST = 'rahaza_pwa_generated_licenses';
const STORAGE_KEY_DEVICE_ID = 'rahaza_pwa_device_id';
const STORAGE_KEY_PIN_HASH = 'rahaza_admin_pin_hash';

// Safe uppercase characters excluding ambiguous glyphs
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Master Demo Keys (Built-in for testing & offline evaluation)
 */
export const MASTER_DEMO_KEYS = [
  'RAHAZA-PRO-LIFETIME-VIP',
  'RAHAZA-PRO-2026-UNLIMITED',
  'RAHAZA-MASTER-ACTIVATED',
  'RAHAZA-VIP-OFFLINE-PASS',
];

/**
 * Generate a deterministic stable Device ID for this browser
 * Format: RHZ-XXXX-YYYY (e.g. RHZ-9X82-K3L9)
 */
export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (existing && existing.startsWith('RHZ-') && existing.length >= 13) {
      return existing;
    }
  } catch {
    // ignore
  }

  // Generate new stable 8-character token
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += CHARS[Math.floor(Math.random() * CHARS.length)];
    p2 += CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  const newId = `RHZ-${p1}-${p2}`;
  try {
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, newId);
  } catch {
    // ignore
  }
  return newId;
}

/**
 * Fast string DJB2-like dual hash for offline checksum
 */
function computeDualHash(input: string, salt: string = SECURE_SALT): string {
  let hash1 = 5381;
  let hash2 = 0x5a5a5a;
  const combined = `${input}::${salt}`;

  for (let i = 0; i < combined.length; i++) {
    const code = combined.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ code;
    hash2 = ((hash2 << 7) - hash2 + (code * (i + 13))) & 0x7fffffff;
  }

  const safe1 = Math.abs(hash1);
  const safe2 = Math.abs(hash2);

  const c1 = CHARS[safe1 % CHARS.length];
  const c2 = CHARS[(safe1 >> 5) % CHARS.length];
  const c3 = CHARS[(safe1 >> 10) % CHARS.length];
  const c4 = CHARS[safe2 % CHARS.length];
  const c5 = CHARS[(safe2 >> 5) % CHARS.length];
  const c6 = CHARS[(safe2 >> 10) % CHARS.length];

  return `${c1}${c2}${c3}${c4}${c5}${c6}`;
}

/**
 * Clean buyer string (alphanumeric uppercase, max 8 chars)
 */
function sanitizeBuyerCode(name: string): string {
  const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned ? cleaned.substring(0, 8) : 'USER';
}

/**
 * Standardize Device ID for hashing
 */
function normalizeDeviceId(id: string): string {
  return id.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
}

export type LicenseType = 'device' | 'universal';

export interface GeneratedLicenseRecord {
  key: string;
  buyerName: string;
  type: LicenseType;
  targetDeviceId?: string;
  createdAt: string;
}

/**
 * Generate a new License Key
 * - Khusus Perangkat: Target Device ID is hashed with Buyer Name and Salt
 * - Universal: Hashed with "UNIVERSAL" token and Salt
 */
export function generateLicenseKey(
  buyerName: string,
  type: LicenseType = 'device',
  targetDeviceId?: string
): GeneratedLicenseRecord {
  const buyerCode = sanitizeBuyerCode(buyerName);
  let hash = '';

  if (type === 'device' && targetDeviceId) {
    const cleanDevice = normalizeDeviceId(targetDeviceId);
    hash = computeDualHash(`DEVICE:${cleanDevice}:${buyerCode}`);
  } else {
    hash = computeDualHash(`UNIVERSAL:${buyerCode}`);
  }

  const key = `RAHAZA-PRO-${buyerCode}-${hash}`;

  const record: GeneratedLicenseRecord = {
    key,
    buyerName: buyerName.trim() || 'Pembeli PRO',
    type,
    targetDeviceId: type === 'device' ? (targetDeviceId || '').trim().toUpperCase() : undefined,
    createdAt: new Date().toISOString(),
  };

  // Save to history in localStorage
  try {
    const current = getGeneratedLicenses();
    const updated = [record, ...current];
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return record;
}

/**
 * Verify if a given key is valid
 * Checks against:
 * 1. Master Demo Keys
 * 2. Locally generated keys in history
 * 3. Deterministic cryptographic verification (matches Device ID or Universal)
 * 4. Backward compatibility with legacy RHZPRO18 format
 */
export function validateLicenseKey(rawKey: string, currentDeviceId?: string): boolean {
  if (!rawKey) return false;
  const key = rawKey.trim().toUpperCase().replace(/\s+/g, '');
  const activeDevice = currentDeviceId || getOrCreateDeviceId();
  const cleanDevice = normalizeDeviceId(activeDevice);

  // 1. Check Master Demo Keys
  if (MASTER_DEMO_KEYS.includes(key)) {
    return true;
  }

  // 2. Check Local Generated Licenses History
  const history = getGeneratedLicenses();
  const foundInHistory = history.find(item => item.key === key);
  if (foundInHistory) {
    if (foundInHistory.type === 'universal') return true;
    if (foundInHistory.targetDeviceId && normalizeDeviceId(foundInHistory.targetDeviceId) === cleanDevice) {
      return true;
    }
  }

  // 3. Deterministic Cryptographic Dual-Hash Verification
  // Match format: (RAHAZA|RHZ)-PRO-(BUYERCODE)-(HASH6)
  const match = key.match(/^(?:RAHAZA|RHZ)-PRO-([A-Z0-9]+)-([A-Z0-9]{6})$/);
  if (match) {
    const buyerCode = match[1];
    const givenHash = match[2];

    // Check if valid as device-locked license for this device
    const expectedDeviceHash = computeDualHash(`DEVICE:${cleanDevice}:${buyerCode}`);
    if (givenHash === expectedDeviceHash) {
      return true;
    }

    // Check if valid as universal license
    const expectedUniversalHash = computeDualHash(`UNIVERSAL:${buyerCode}`);
    if (givenHash === expectedUniversalHash) {
      return true;
    }
  }

  // 4. Legacy Checksum Support (RHZPROxxxxxxxxxxxx 18 chars)
  if (key.startsWith('RHZPRO') && key.length === 18) {
    const payload = key.substring(6, 15);
    const check = key.substring(15, 18);
    let legacyHash = 0x5a5a;
    for (let i = 0; i < payload.length; i++) {
      legacyHash = ((legacyHash << 5) - legacyHash + payload.charCodeAt(i) * (i + 7)) & 0xffffff;
    }
    const c1 = CHARS[Math.abs(legacyHash) % CHARS.length];
    const c2 = CHARS[Math.abs(legacyHash >> 5) % CHARS.length];
    const c3 = CHARS[Math.abs(legacyHash >> 10) % CHARS.length];
    if (`${c1}${c2}${c3}` === check) {
      return true;
    }
  }

  return false;
}

export interface LicenseStatus {
  isPro: boolean;
  licenseKey: string | null;
  activatedAt: string | null;
  deviceId: string;
}

/**
 * Retrieve current user license status from localStorage
 */
export function getCurrentLicenseStatus(): LicenseStatus {
  const deviceId = getOrCreateDeviceId();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRO);
    if (!raw) return { isPro: false, licenseKey: null, activatedAt: null, deviceId };

    const data = JSON.parse(raw);
    if (data && data.licenseKey && validateLicenseKey(data.licenseKey, deviceId)) {
      return {
        isPro: true,
        licenseKey: data.licenseKey,
        activatedAt: data.activatedAt || null,
        deviceId,
      };
    }
  } catch {
    // fallback
  }
  return { isPro: false, licenseKey: null, activatedAt: null, deviceId };
}

/**
 * Activate user license
 */
export function activateLicense(rawKey: string): { success: boolean; message: string } {
  const key = rawKey.trim().toUpperCase().replace(/\s+/g, '');
  const deviceId = getOrCreateDeviceId();

  if (!validateLicenseKey(key, deviceId)) {
    return {
      success: false,
      message: 'Kode lisensi tidak valid untuk perangkat ini atau salah ketik. Pastikan format diawali "RAHAZA-PRO-..." atau gunakan Device ID Anda.',
    };
  }

  const payload = {
    isPro: true,
    licenseKey: key,
    activatedAt: new Date().toISOString(),
    deviceId,
  };

  try {
    localStorage.setItem(STORAGE_KEY_PRO, JSON.stringify(payload));
  } catch {
    return { success: false, message: 'Gagal menyimpan status ke browser.' };
  }

  return {
    success: true,
    message: 'Selamat! Akun Rahaza PWA XML PRO LIFETIME berhasil diaktifkan.',
  };
}

/**
 * Deactivate user license
 */
export function deactivateLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PRO);
  } catch {
    // ignore
  }
}

/**
 * Retrieve generated licenses list for admin
 */
export function getGeneratedLicenses(): GeneratedLicenseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIST);
    if (!raw) {
      const defaultLicenses: GeneratedLicenseRecord[] = [
        {
          key: 'RAHAZA-PRO-LIFETIME-VIP',
          buyerName: 'Master VIP Key (Default)',
          type: 'universal',
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
 * Remove one license from admin history
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

/**
 * Clear all generated licenses
 */
export function clearAllGeneratedLicenses(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_LIST);
  } catch {
    // ignore
  }
}

/**
 * Simple hash helper for storing PIN in localStorage
 */
function hashPin(pin: string): string {
  let h = 0x811c9dc5;
  const str = `${pin}:${SECURE_SALT}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

/**
 * Verify Admin PIN (matches stored PIN, default 399339, or EMERGENCY_BYPASS_CODE)
 */
export function verifyAdminPin(enteredPin: string): boolean {
  const pin = enteredPin.trim();
  if (!pin) return false;

  // Emergency rescue code always works
  if (pin === EMERGENCY_BYPASS_CODE) {
    return true;
  }

  const storedHash = localStorage.getItem(STORAGE_KEY_PIN_HASH);
  if (!storedHash) {
    // Default PIN: 399339
    return pin === DEFAULT_ADMIN_PIN;
  }

  return hashPin(pin) === storedHash;
}

/**
 * Update Admin PIN
 */
export function changeAdminPin(oldPin: string, newPin: string): { success: boolean; message: string } {
  const cleanOld = oldPin.trim();
  const cleanNew = newPin.trim();

  if (!verifyAdminPin(cleanOld)) {
    return { success: false, message: 'PIN lama atau kode emergency tidak cocok.' };
  }

  if (cleanNew.length < 4) {
    return { success: false, message: 'PIN baru minimal harus 4 digit/karakter.' };
  }

  try {
    localStorage.setItem(STORAGE_KEY_PIN_HASH, hashPin(cleanNew));
    return { success: true, message: 'PIN Admin berhasil diubah!' };
  } catch {
    return { success: false, message: 'Gagal menyimpan PIN baru ke browser.' };
  }
}

/**
 * Format WhatsApp Message for sending serial key to buyer
 */
export function buildWhatsAppReplyMessage(record: GeneratedLicenseRecord): string {
  const deviceNote = record.type === 'device' && record.targetDeviceId
    ? `🔒 *Tipe Lisensi:* Khusus Perangkat (Device ID: ${record.targetDeviceId})\n`
    : `🌟 *Tipe Lisensi:* Universal (Bebas Dipakai di Perangkat Anda)\n`;

  return `Halo Kak *${record.buyerName}*, terima kasih telah meng-upgrade ke *Rahaza PWA XML PRO Lifetime*! 🎉

Berikut adalah Serial Key resmi Anda:
🔑 *Serial Key:* \`${record.key}\`
${deviceNote}
📌 *Cara Aktivasi Langkah demi Langkah:*
1. Buka aplikasi Rahaza PWA XML PRO di browser Anda.
2. Klik tombol *Upgrade PRO* di pojok kanan atas.
3. Masukkan Serial Key di atas ke kolom aktivasi.
4. Klik tombol *Aktivasi*. Status Anda akan langsung berubah menjadi *LIFETIME PRO* secara permanen!

♾️ *Keuntungan PRO Anda:*
✅ Bebas Watermark di XML Template Blogger
✅ Unduh File XML & Manifest Tanpa Batas
✅ GAS Patcher & Full PWA Features Selamanya
✅ 100% Offline & Privasi Terjaga

Jika ada pertanyaan atau kendala aktivasi, silakan hubungi kami di sini. Selamat berkarya! 🚀`;
}
