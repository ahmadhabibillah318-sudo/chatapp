# 📱 ChatApp — Panduan Instalasi & Setup Lengkap

Aplikasi chat real-time mirip WhatsApp/Telegram berbasis web.  
**Stack:** React + Vite + Firebase (Auth + Firestore)

---

## 🚀 LANGKAH 1 — Install Node.js

Download dan install dari: https://nodejs.org  
Pilih versi **LTS** (disarankan).

Cek apakah sudah terinstall:
```bash
node --version
npm --version
```

---

## 🔥 LANGKAH 2 — Setup Firebase (WAJIB)

### A. Buat Project Firebase
1. Buka https://console.firebase.google.com
2. Klik **"Add project"** → beri nama, misal: `chatapp-ku`
3. Selesaikan wizard pembuatan project

### B. Aktifkan Authentication
1. Di sidebar Firebase, klik **Authentication**
2. Klik **"Get started"**
3. Pada tab **Sign-in method**, aktifkan:
   - ✅ **Google** — klik, aktifkan, pilih email support, Simpan
   - ✅ **Phone** — klik, aktifkan, Simpan

### C. Buat Firestore Database
1. Di sidebar, klik **Firestore Database**
2. Klik **"Create database"**
3. Pilih **Start in test mode** (untuk development)
4. Pilih region terdekat (misal: `asia-southeast1`)
5. Klik **Enable**

### D. Dapatkan Konfigurasi Firebase
1. Klik ikon ⚙️ (Project Settings) di sidebar
2. Scroll ke bawah ke bagian **"Your apps"**
3. Klik ikon **</>** (Web)
4. Daftarkan app dengan nama bebas
5. Copy kode konfigurasi yang muncul

### E. Masukkan Konfigurasi ke Kode
Buka file `src/firebase.js` dan ganti bagian ini:

```js
const firebaseConfig = {
  apiKey: "GANTI_DENGAN_API_KEY_KAMU",
  authDomain: "GANTI_DENGAN_AUTH_DOMAIN_KAMU",
  projectId: "GANTI_DENGAN_PROJECT_ID_KAMU",
  storageBucket: "GANTI_DENGAN_STORAGE_BUCKET_KAMU",
  messagingSenderId: "GANTI_DENGAN_MESSAGING_SENDER_ID_KAMU",
  appId: "GANTI_DENGAN_APP_ID_KAMU"
};
```

Dengan konfigurasi asli dari Firebase-mu.

### F. Setup Security Rules (Opsional tapi Disarankan)
Di Firebase Console > Firestore > **Rules**, copy-paste isi file `firestore.rules` ke editor lalu klik Publish.

---

## 💻 LANGKAH 3 — Install & Jalankan

Buka terminal / command prompt di folder project ini:

```bash
# 1. Install semua dependencies
npm install

# 2. Jalankan server development
npm run dev
```

Buka browser ke: **http://localhost:5173**

---

## 🌐 LANGKAH 4 — Deploy ke Internet (Opsional)

Agar bisa diakses dari negara lain:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login Firebase
firebase login

# Build aplikasi
npm run build

# Deploy ke Firebase Hosting (gratis!)
firebase init hosting
firebase deploy
```

Atau gunakan **Vercel** (lebih mudah):
1. Push kode ke GitHub
2. Buka https://vercel.com
3. Import repo, klik Deploy → SELESAI! Dapat URL publik.

---

## 📂 Struktur File

```
chatapp/
├── src/
│   ├── components/
│   │   ├── Login.jsx        ← Halaman login Google & nomor HP
│   │   ├── Login.css
│   │   ├── MainApp.jsx      ← Layout utama + sidebar daftar chat
│   │   ├── MainApp.css
│   │   ├── ChatRoom.jsx     ← Ruang chat real-time
│   │   └── ChatRoom.css
│   ├── firebase.js          ← ⚠️ EDIT INI dengan konfigurasi kamu
│   ├── App.jsx              ← Root + routing
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── firestore.rules          ← Security rules Firestore
├── index.html
├── package.json
├── vite.config.js
└── README.md                ← File ini
```

---

## ✨ Fitur yang Sudah Ada

- ✅ Login dengan akun Google
- ✅ Login dengan nomor telepon (OTP via SMS)
- ✅ Cari pengguna lain berdasarkan nama/email
- ✅ Chat real-time (pesan langsung muncul tanpa refresh)
- ✅ Grouping pesan per hari (Hari ini, Kemarin, dst)
- ✅ Desain modern gelap (dark mode)
- ✅ Responsive & bisa dipakai di HP lewat browser

---

## 🔧 Fitur yang Bisa Ditambahkan

- 📎 Kirim gambar/file → butuh Firebase Storage
- 🔔 Notifikasi push → butuh Firebase Cloud Messaging (FCM)
- 🔒 Enkripsi end-to-end → implementasi Signal Protocol
- 👥 Group chat → modifikasi struktur data Firestore
- 📞 Voice/Video call → butuh layanan WebRTC seperti Agora/Twilio
- 🌍 Status online/offline → Firestore realtime presence

---

## ❓ Masalah Umum

| Masalah | Solusi |
|---------|--------|
| Login Google tidak muncul | Pastikan domain `localhost` sudah diizinkan di Firebase Console > Authentication > Settings > Authorized domains |
| OTP tidak terkirim | Verifikasi nomor sudah format internasional (+62xxx) dan aktifkan billing di Firebase |
| Error "Missing or insufficient permissions" | Cek Firestore Rules, pastikan pakai Test Mode dulu |
| Pesan tidak muncul | Cek index Firestore, klik link di console browser yang muncul |

---

Dibuat dengan ❤️ menggunakan React + Firebase
