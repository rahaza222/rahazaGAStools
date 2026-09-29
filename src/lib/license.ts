/**
 * Rahaza PWA XML PRO - License & Offline Cryptographic Engine
 * 
 * Supports:
 * - PRO Lifetime Licenses (Device-Locked & Universal)
 * - 24-Hour Automatic Initial Trial with Heartbeat Protection
 * - Time-Limited Trial Serial Keys (24h, 3d, 7d, 14d, 30d)
 * - Full Lockout Management on Trial Expiration
 * 
 * 100% Offline Deterministic Verification
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
const STORAGE_KEY_TRIAL = 'rahaza_pwa_trial_data';
const STORAGE_KEY_HEARTBEAT = 'rahaza_pwa_last_heartbeat';

// Safe uppercase characters excluding ambiguous glyphs
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const DEFAULT_TRIAL_HOURS = 24;

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

export type LicenseType = 'lifetime_universal' | 'lifetime_device' | 'trial';

export interface GeneratedLicenseRecord {
  key: string;
  buyerName: string;
  type: LicenseType;
  trialHours?: number;
  targetDeviceId?: string;
  createdAt: string;
}

/**
 * Generate a new License Key (Lifetime or Time-Limited Trial)
 */
export function generateLicenseKey(
  buyerName: string,
  type: LicenseType = 'lifetime_device',
  targetDeviceId?: string,
  trialHours: number = 24
): GeneratedLicenseRecord {
  const buyerCode = sanitizeBuyerCode(buyerName);
  let hash = '';
  let key = '';

  if (type === 'trial') {
    // Format: RAHAZA-TRIAL-(BUYER)-(HOURS)H-(HASH6)
    if (targetDeviceId) {
      const cleanDevice = normalizeDeviceId(targetDeviceId);
      hash = computeDualHash(`TRIAL_DEV:${cleanDevice}:${buyerCode}:${trialHours}`);
    } else {
      hash = computeDualHash(`TRIAL_UNI:${buyerCode}:${trialHours}`);
    }
    key = `RAHAZA-TRIAL-${buyerCode}-${trialHours}H-${hash}`;
  } else if (type === 'lifetime_device' && targetDeviceId) {
    const cleanDevice = normalizeDeviceId(targetDeviceId);
    hash = computeDualHash(`DEVICE:${cleanDevice}:${buyerCode}`);
    key = `RAHAZA-PRO-${buyerCode}-${hash}`;
  } else {
    // Universal Lifetime
    hash = computeDualHash(`UNIVERSAL:${buyerCode}`);
    key = `RAHAZA-PRO-${buyerCode}-${hash}`;
  }

  const record: GeneratedLicenseRecord = {
    key,
    buyerName: buyerName.trim() || (type === 'trial' ? 'Pengguna Trial' : 'Pembeli PRO'),
    type,
    trialHours: type === 'trial' ? trialHours : undefined,
    targetDeviceId: targetDeviceId ? targetDeviceId.trim().toUpperCase() : undefined,
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
 * Parsed key result
 */
export interface ParsedKeyResult {
  isValid: boolean;
  isTrial: boolean;
  trialHours?: number;
  isLifetime: boolean;
  buyerCode?: string;
}

/**
 * Validate and inspect a license key
 */
export function parseAndValidateKey(rawKey: string, currentDeviceId?: string): ParsedKeyResult {
  if (!rawKey) return { isValid: false, isTrial: false, isLifetime: false };
  const key = rawKey.trim().toUpperCase().replace(/\s+/g, '');
  const activeDevice = currentDeviceId || getOrCreateDeviceId();
  const cleanDevice = normalizeDeviceId(activeDevice);

  // 1. Master Demo Keys (Instant Lifetime PRO)
  if (MASTER_DEMO_KEYS.includes(key)) {
    return { isValid: true, isTrial: false, isLifetime: true, buyerCode: 'MASTER' };
  }

  // 2. Check Local Generated Licenses History
  const history = getGeneratedLicenses();
  const foundInHistory = history.find(item => item.key === key);
  if (foundInHistory) {
    if (foundInHistory.type === 'trial') {
      const matchDevice = !foundInHistory.targetDeviceId || normalizeDeviceId(foundInHistory.targetDeviceId) === cleanDevice;
      if (matchDevice) {
        return {
          isValid: true,
          isTrial: true,
          trialHours: foundInHistory.trialHours || 24,
          isLifetime: false,
          buyerCode: sanitizeBuyerCode(foundInHistory.buyerName),
        };
      }
    } else if (foundInHistory.type === 'lifetime_universal') {
      return { isValid: true, isTrial: false, isLifetime: true, buyerCode: sanitizeBuyerCode(foundInHistory.buyerName) };
    } else if (foundInHistory.targetDeviceId && normalizeDeviceId(foundInHistory.targetDeviceId) === cleanDevice) {
      return { isValid: true, isTrial: false, isLifetime: true, buyerCode: sanitizeBuyerCode(foundInHistory.buyerName) };
    }
  }

  // 3. Cryptographic Trial Key Verification
  // Match format: RAHAZA-TRIAL-([A-Z0-9]+)-([0-9]+)H-([A-Z0-9]{6})
  const trialMatch = key.match(/^RAHAZA-TRIAL-([A-Z0-9]+)-([0-9]+)H-([A-Z0-9]{6})$/);
  if (trialMatch) {
    const buyerCode = trialMatch[1];
    const hours = parseInt(trialMatch[2], 10);
    const givenHash = trialMatch[3];

    // Check device locked trial
    const expectedDev = computeDualHash(`TRIAL_DEV:${cleanDevice}:${buyerCode}:${hours}`);
    if (givenHash === expectedDev) {
      return { isValid: true, isTrial: true, trialHours: hours, isLifetime: false, buyerCode };
    }

    // Check universal trial
    const expectedUni = computeDualHash(`TRIAL_UNI:${buyerCode}:${hours}`);
    if (givenHash === expectedUni) {
      return { isValid: true, isTrial: true, trialHours: hours, isLifetime: false, buyerCode };
    }
  }

  // 4. Deterministic Lifetime PRO Key Verification
  // Match format: (RAHAZA|RHZ)-PRO-(BUYERCODE)-(HASH6)
  const proMatch = key.match(/^(?:RAHAZA|RHZ)-PRO-([A-Z0-9]+)-([A-Z0-9]{6})$/);
  if (proMatch) {
    const buyerCode = proMatch[1];
    const givenHash = proMatch[2];

    // Check device-locked
    const expectedDeviceHash = computeDualHash(`DEVICE:${cleanDevice}:${buyerCode}`);
    if (givenHash === expectedDeviceHash) {
      return { isValid: true, isTrial: false, isLifetime: true, buyerCode };
    }

    // Check universal
    const expectedUniversalHash = computeDualHash(`UNIVERSAL:${buyerCode}`);
    if (givenHash === expectedUniversalHash) {
      return { isValid: true, isTrial: false, isLifetime: true, buyerCode };
    }
  }

  // 5. Legacy Checksum Support (RHZPROxxxxxxxxxxxx 18 chars)
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
      return { isValid: true, isTrial: false, isLifetime: true, buyerCode: 'LEGACY' };
    }
  }

  return { isValid: false, isTrial: false, isLifetime: false };
}

export function validateLicenseKey(rawKey: string, currentDeviceId?: string): boolean {
  return parseAndValidateKey(rawKey, currentDeviceId).isValid;
}

export type LicenseTier = 'free' | 'trial' | 'pro_lifetime';

export interface StoredTrialPayload {
  startedAt: number;        // Epoch ms
  durationHours: number;    // e.g. 24
  expiresAt: number;        // Epoch ms
  deviceToken: string;
  source: 'auto_start' | 'serial_key';
  serialKeyUsed?: string;
}

export interface TrialState {
  isActive: boolean;
  isExpired: boolean;
  startedAt: number;
  expiresAt: number;
  remainingSeconds: number;
  durationHours: number;
}

export interface LicenseStatus {
  tier: LicenseTier;
  isPro: boolean;           // true if PRO Lifetime OR active trial
  isTrial: boolean;         // true if currently in trial status
  isExpired: boolean;       // true if trial has expired and user has not activated PRO
  licenseKey: string | null;
  activatedAt: string | null;
  deviceId: string;
  trial: TrialState;
}

/**
 * Initialize or retrieve the trial state for this device
 */
function getOrInitTrialData(deviceId: string): StoredTrialPayload {
  const now = Date.now();

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIAL);
    if (raw) {
      const data: StoredTrialPayload = JSON.parse(raw);
      if (data && typeof data.startedAt === 'number' && typeof data.expiresAt === 'number') {
        // Update heartbeat
        const lastHb = parseInt(localStorage.getItem(STORAGE_KEY_HEARTBEAT) || '0', 10);
        if (now > lastHb) {
          localStorage.setItem(STORAGE_KEY_HEARTBEAT, now.toString());
        }
        return data;
      }
    }
  } catch {
    // fallback to new init
  }

  // Auto-start initial 24-hour trial for new users
  const durationHours = DEFAULT_TRIAL_HOURS;
  const startedAt = now;
  const expiresAt = startedAt + durationHours * 60 * 60 * 1000;
  const deviceToken = computeDualHash(`TRIAL_DEV_INIT:${deviceId}`);

  const newTrial: StoredTrialPayload = {
    startedAt,
    durationHours,
    expiresAt,
    deviceToken,
    source: 'auto_start',
  };

  try {
    localStorage.setItem(STORAGE_KEY_TRIAL, JSON.stringify(newTrial));
    localStorage.setItem(STORAGE_KEY_HEARTBEAT, now.toString());
  } catch {
    // ignore
  }

  return newTrial;
}

/**
 * Retrieve current unified license and trial status
 */
export function getCurrentLicenseStatus(): LicenseStatus {
  const deviceId = getOrCreateDeviceId();
  const now = Date.now();

  // 1. Check for Active PRO Lifetime License
  try {
    const rawPro = localStorage.getItem(STORAGE_KEY_PRO);
    if (rawPro) {
      const data = JSON.parse(rawPro);
      if (data && data.licenseKey && validateLicenseKey(data.licenseKey, deviceId)) {
        return {
          tier: 'pro_lifetime',
          isPro: true,
          isTrial: false,
          isExpired: false,
          licenseKey: data.licenseKey,
          activatedAt: data.activatedAt || null,
          deviceId,
          trial: {
            isActive: false,
            isExpired: false,
            startedAt: 0,
            expiresAt: 0,
            remainingSeconds: 0,
            durationHours: 0,
          },
        };
      }
    }
  } catch {
    // ignore
  }

  // 2. Evaluate Trial Status
  const trialData = getOrInitTrialData(deviceId);
  
  // Check heartbeat anti-clock tampering
  let effectiveNow = now;
  try {
    const lastHb = parseInt(localStorage.getItem(STORAGE_KEY_HEARTBEAT) || '0', 10);
    if (lastHb > effectiveNow + 60000) {
      // Clock was turned backward by > 1 minute, use last heartbeat to prevent clock rollback
      effectiveNow = lastHb;
    } else if (effectiveNow > lastHb) {
      localStorage.setItem(STORAGE_KEY_HEARTBEAT, effectiveNow.toString());
    }
  } catch {
    // ignore
  }

  const remainingMs = Math.max(0, trialData.expiresAt - effectiveNow);
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const isExpired = remainingSeconds <= 0;
  const isActive = !isExpired;

  return {
    tier: isActive ? 'trial' : 'free',
    isPro: isActive, // All PRO features accessible during active trial!
    isTrial: true,
    isExpired: isExpired, // Application will lock if true!
    licenseKey: trialData.serialKeyUsed || null,
    activatedAt: new Date(trialData.startedAt).toISOString(),
    deviceId,
    trial: {
      isActive,
      isExpired,
      startedAt: trialData.startedAt,
      expiresAt: trialData.expiresAt,
      remainingSeconds,
      durationHours: trialData.durationHours,
    },
  };
}

/**
 * Activate a License (Handles both Lifetime PRO keys and Trial keys)
 */
export function activateLicense(rawKey: string): { 
  success: boolean; 
  message: string;
  tier?: LicenseTier;
  trialHours?: number;
} {
  const key = rawKey.trim().toUpperCase().replace(/\s+/g, '');
  const deviceId = getOrCreateDeviceId();
  const parsed = parseAndValidateKey(key, deviceId);

  if (!parsed.isValid) {
    return {
      success: false,
      message: 'Kode lisensi tidak valid untuk perangkat ini atau salah ketik. Pastikan format diawali "RAHAZA-PRO-..." atau "RAHAZA-TRIAL-...".',
    };
  }

  // A. Handle Trial Extension Serial Key
  if (parsed.isTrial && parsed.trialHours) {
    const now = Date.now();
    const durationHours = parsed.trialHours;
    const expiresAt = now + durationHours * 60 * 60 * 1000;
    
    const trialPayload: StoredTrialPayload = {
      startedAt: now,
      durationHours,
      expiresAt,
      deviceToken: computeDualHash(`TRIAL_DEV_KEY:${deviceId}:${key}`),
      source: 'serial_key',
      serialKeyUsed: key,
    };

    try {
      localStorage.setItem(STORAGE_KEY_TRIAL, JSON.stringify(trialPayload));
      localStorage.setItem(STORAGE_KEY_HEARTBEAT, now.toString());
    } catch {
      return { success: false, message: 'Gagal memperbarui status trial ke browser.' };
    }

    return {
      success: true,
      message: `Selamat! Masa uji coba (${durationHours} Jam) berhasil diaktifkan. Akses penuh fitur PRO telah dibuka!`,
      tier: 'trial',
      trialHours: durationHours,
    };
  }

  // B. Handle Permanent Lifetime PRO Key
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
    message: 'Selamat! Akun Rahaza PWA XML PRO LIFETIME berhasil diaktifkan secara permanen.',
    tier: 'pro_lifetime',
  };
}

/**
 * Deactivate user license (reverts to trial or expired state)
 */
export function deactivateLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PRO);
  } catch {
    // ignore
  }
}

/**
 * Developer Testing Helper: Reset trial to a fresh 24 hours
 */
export function resetTrialForTesting(hours: number = 24): void {
  const deviceId = getOrCreateDeviceId();
  const now = Date.now();
  const trialPayload: StoredTrialPayload = {
    startedAt: now,
    durationHours: hours,
    expiresAt: now + hours * 60 * 60 * 1000,
    deviceToken: computeDualHash(`TRIAL_RESET:${deviceId}`),
    source: 'auto_start',
  };
  try {
    localStorage.removeItem(STORAGE_KEY_PRO);
    localStorage.setItem(STORAGE_KEY_TRIAL, JSON.stringify(trialPayload));
    localStorage.setItem(STORAGE_KEY_HEARTBEAT, now.toString());
  } catch {
    // ignore
  }
}

/**
 * Developer Testing Helper: Force trial to expire immediately to test lockout screen
 */
export function expireTrialForTesting(): void {
  const deviceId = getOrCreateDeviceId();
  const past = Date.now() - 10000;
  const trialPayload: StoredTrialPayload = {
    startedAt: past - 24 * 3600 * 1000,
    durationHours: 24,
    expiresAt: past,
    deviceToken: computeDualHash(`TRIAL_EXPIRED:${deviceId}`),
    source: 'auto_start',
  };
  try {
    localStorage.removeItem(STORAGE_KEY_PRO);
    localStorage.setItem(STORAGE_KEY_TRIAL, JSON.stringify(trialPayload));
    localStorage.setItem(STORAGE_KEY_HEARTBEAT, Date.now().toString());
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
          type: 'lifetime_universal',
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
 * Verify Admin PIN
 */
export function verifyAdminPin(enteredPin: string): boolean {
  const pin = enteredPin.trim();
  if (!pin) return false;

  if (pin === EMERGENCY_BYPASS_CODE) {
    return true;
  }

  const storedHash = localStorage.getItem(STORAGE_KEY_PIN_HASH);
  if (!storedHash) {
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
 * Format WhatsApp Message for buyer purchase inquiry
 */
export function buildWhatsAppOrderMessage(deviceId: string): string {
  const text = encodeURIComponent(
    `Halo Admin Rahaza PWA XML,\n\nSaya ingin membeli Kode Lisensi PRO Lifetime untuk perangkat saya.\n\n📌 Device ID Saya: ${deviceId}\n\nMohon info rekening dan total pembayarannya. Terima kasih!`
  );
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}

/**
 * Format WhatsApp Message for sending serial key to buyer
 */
export function buildWhatsAppReplyMessage(record: GeneratedLicenseRecord): string {
  if (record.type === 'trial') {
    const hours = record.trialHours || 24;
    return `Halo Kak *${record.buyerName}*, berikut adalah Kode Lisensi Trial Anda untuk *Rahaza PWA XML Suite*: ⏱️

🔑 *Kode Trial:* \`${record.key}\`
⏳ *Masa Aktif:* ${hours} Jam Akses Penuh Fitur PRO
${record.targetDeviceId ? `🔒 *Device ID:* ${record.targetDeviceId}\n` : ''}
📌 *Cara Aktivasi Langkah demi Langkah:*
1. Buka aplikasi Rahaza PWA XML di browser Anda.
2. Klik tombol *Upgrade PRO* atau menu Aktivasi Lisensi.
3. Masukkan Kode Trial di atas.
4. Klik tombol *Aktivasi*. Akses fitur PRO Anda akan langsung aktif selama ${hours} Jam!

Selamat mencoba! 🚀`;
  }

  const deviceNote = record.type === 'lifetime_device' && record.targetDeviceId
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
