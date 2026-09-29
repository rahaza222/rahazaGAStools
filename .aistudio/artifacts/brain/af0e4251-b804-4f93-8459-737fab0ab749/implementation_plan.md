# Sistem Lisensi Trial 24 Jam & Kunci Eksklusif Aplikasi

Rencana implementasi sistem lisensi masa uji coba (*limited-time trial*) 24 jam otomatis untuk pengguna baru, dukungan serial key trial fleksibel dari Admin Portal, indikator hitung mundur (*countdown timer*) waktu nyata, serta mekanisme proteksi kunci penuh (*full lock*) saat masa trial berakhir.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan hasil wawancara klarifikasi pada Fase 1, keputusan utama telah diselaraskan:
> - **Mekanisme Aktivasi**: Otomatis aktif 24 jam begitu pengguna pertama kali membuka aplikasi di browser/perangkat, serta tetap mendukung aktivasi/perpanjangan lewat *Serial Key Trial* khusus dari admin.
> - **Durasi Standar**: **24 Jam** (masa uji coba singkat akses penuh fitur PRO).
> - **Saat Masa Trial Habis**: Aplikasi dan seluruh modul generator **terkunci total** sampai pengguna memasukkan Serial Key PRO resmi atau memperpanjang masa aktif.

- **Keputusan Terkonfirmasi 1**: Akses PRO Penuh selama 24 jam (tanpa watermark, unduh XML, GAS Patcher bebas batasan).
- **Keputusan Terkonfirmasi 2**: Proteksi anti-manipulasi waktu lokal (validasi interval elapsed time dan tamper-detection sederhana pada localStorage).
- **Keputusan Terkonfirmasi 3**: Tampilan *Lockout Overlay* ramah pengguna dengan integrasi langsung WhatsApp Admin (`6281911934000`) dan form aktivasi lisensi instan.

---

## 1. Overview & Core Concept

- **Fungsi Utama**: Memberikan kesempatan bagi pengguna baru untuk mencoba seluruh fitur unggulan Rahaza PWA XML Suite secara gratis selama 24 jam sejak pertama kali dibuka. Setelah 24 jam, aplikasi memasuki mode *Locked Out* yang mewajibkan aktivasi lisensi PRO untuk melanjutkan pembuatan tema PWA Blogger.
- **Target Pengguna**: Pemilik WebApp Google Apps Script (GAS) dan pengguna Blogger yang ingin menguji kehandalan konversi PWA sebelum membeli lisensi seumur hidup.
- **Nilai Bisnis & Pengguna**: Konversi penjualan lisensi PRO lebih tinggi karena pengguna sudah merasakan langsung kemudahan generator, simulasi HP, dan GAS patcher tanpa hambatan teknis di awal.

---

## 2. User Experience & Visual Design

### Alur Pengguna (User Flows)

1. **First-Time Launch (Trial Aktif)**:
   - Pengguna baru membuka aplikasi. Sistem mendeteksi belum ada lisensi dan langsung mengaktifkan masa uji coba 24 jam.
   - Header menampilkan badge dinamis bergaya clean typography dengan aksen amber/biru: `TRIAL PRO (23j 59m tersisa)`.
   - Pengguna dapat menikmati seluruh fitur PRO tanpa watermark, mengunduh file XML Blogger, dan menggunakan GAS Patcher.
2. **Hitung Mundur Waktu Nyata (Live Countdown)**:
   - Countdown timer otomatis diperbarui setiap detik.
   - Saat tersisa < 2 jam, indikator berubah menjadi peringatan aksen amber halus agar pengguna bersiap mengamankan lisensi.
3. **Masa Trial Berakhir (Locked State)**:
   - Ketika waktu mencapai 0 detik, aplikasi langsung menampilkan layar kunci *Paywall / Lockout View* (`TrialExpiredLockoutModal` / Backdrop terblokir).
   - Pengguna tidak dapat memicu tombol salin XML, unduh file, atau switch modul generator.
   - Layar kunci memuat:
     - Ringkasan fitur yang telah dicoba.
     - Device ID perangkat pengguna untuk memudahkan order.
     - Tombol cepat **"Beli Lisensi PRO via WhatsApp"** (format pesan otomatis terisi nomor WhatsApp admin).
     - Kolom input **"Masukkan Serial Key PRO / Trial"** untuk langsung membuka kunci.
4. **Admin Portal Generator**:
   - Di Portal Admin (PIN 399339 / Ctrl+Shift+A), Admin kini memiliki opsi membuat:
     - **Lisensi PRO Lifetime** (Permanen).
     - **Lisensi Trial Khusus** (Pilihan: 24 Jam, 3 Hari, 7 Hari) untuk calon pembeli atau perpanjangan uji coba.

### Identitas Visual & Desain Sesuai Domain SaaS

- **Color Discipline**:
  - Dominan Neutral: Slate-900 / White Canvas.
  - Active Trial State: Amber-600 & Indigo-600 (`tabular-nums font-mono` untuk angka jam:menit:detik).
  - Expired State: Crimson & Dark Slate overlay dengan kontras WCAG AA yang tegas dan profesional.
- **Top Bar Contract**:
  - Header tetap rapi 1 baris, menampilkan status `TRIAL PRO · 23:45:12` bersebelahan dengan tombol Install PWA dan tombol Upgrade PRO.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Penyimpanan Status Waktu Trial di Klien (LocalStorage)**:
  - *Pendekatan*: Menggunakan kombinasi `firstLaunchTimestamp`, `lastRecordedHeartbeat`, dan hash checksum perangkat (`RHZ-XXXX-YYYY`).
  - *Mengapa*: Aplikasi dirancang 100% offline & serverless tanpa ketergantungan database backend eksternal, sesuai prinsip awal Rahaza PWA XML.
  - *Proteksi*: Jika pengguna mencoba memundurkan jam sistem komputer/HP ke masa lalu (`currentTime < lastRecordedHeartbeat`), sistem mendeteksi manipulasi waktu dan langsung memicu *time check validation*.
- **Keputusan 2: Kunci Total (Full Lockout) vs Mode Free Terbatas**:
  - *Pendekatan*: Sesuai preferensi Anda pada Fase 1, aplikasi terkunci total saat trial habis.
  - *Mengapa*: Memberikan urgensi psikologis dan batasan eksklusif yang jelas bagi aplikasi komersial berlisensi.

---

## 4. Technical Architecture & Data Strategy

### Diagram Arsitektur & Relasi Komponen

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Root Component                              │
│         (useTrialLicense() Hook & Global License State Provider)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   ┌───────────────────────┐                 ┌───────────────────────┐
   │    License Status     │                 │   License Status      │
   │  'trial_active' / PRO │                 │    'trial_expired'    │
   └───────────┬───────────┘                 └───────────┬───────────┘
               │                                         │
     ┌─────────┴─────────┐                     ┌─────────┴─────────┐
     ▼                   ▼                     ▼                   ▼
┌──────────────┐  ┌──────────────┐       ┌───────────────────────────────┐
│ Main Layout  │  │ Interactive  │       │  TrialExpiredLockoutModal     │
│ with Live    │  │  Generators  │       │  (Blurs Background, Locks     │
│ Countdown    │  │  & Simulator │       │   Actions, WhatsApp CTA,      │
│ In Header    │  │              │       │   Direct Activation Input)    │
└──────────────┘  └──────────────┘       └───────────────────────────────┘
```

### Data Model & Interface Baru (`src/lib/license.ts`)

```typescript
export type LicenseTier = 'free' | 'trial' | 'pro_lifetime';

export interface TrialState {
  isActive: boolean;
  isExpired: boolean;
  startedAt: number;        // Epoch timestamp ms
  expiresAt: number;        // Epoch timestamp ms
  remainingSeconds: number; // Detik tersisa (0 jika expired)
}

export interface LicenseStatus {
  tier: LicenseTier;
  isPro: boolean;           // true jika PRO Lifetime ATAU trial masih aktif
  isTrial: boolean;
  isExpired: boolean;
  licenseKey: string | null;
  activatedAt: string | null;
  deviceId: string;
  trial: TrialState;
}
```

### Rencana File yang Akan Diubah:
1. `src/lib/license.ts`:
   - Penambahan algoritma `initOrGetTrialState()`, deteksi integritas waktu `verifyTimeIntegrity()`.
   - Update `generateLicenseKey()` di Admin Portal untuk mendukung tipe lisensi Trial dengan durasi hari tertentu.
   - Update `validateLicenseKey()` agar mengenali kunci trial bertarget atau universal.
2. `src/components/TrialCountdownBadge.tsx`:
   - Komponen badge hitung mundur real-time di header dan drawer mobile.
3. `src/components/TrialExpiredLockoutModal.tsx`:
   - Modal layar kunci penuh saat expired dengan tombol beli WhatsApp dan input kode aktivasi langsung.
4. `src/components/AdminLicenseGeneratorModal.tsx`:
   - Penambahan radio selector: "Lisensi PRO Lifetime" vs "Lisensi Trial (24 Jam / 3 Hari / 7 Hari)".
5. `src/components/Layout.tsx` & `src/App.tsx`:
   - Integrasi status tier baru, countdown di header, dan trigger modal terkunci saat `isExpired === true`.
