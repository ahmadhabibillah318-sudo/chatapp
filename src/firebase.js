// ============================================================
// FILE: src/firebase.js
// LANGKAH SETUP:
// 1. Buka https://console.firebase.google.com
// 2. Buat project baru
// 3. Klik "Add App" > pilih Web (</>)
// 4. Copy konfigurasi dan paste di bawah ini
// 5. Di Firebase Console: Authentication > Sign-in method
//    Aktifkan: Google & Phone
// 6. Di Firebase Console: Firestore Database > Buat database
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚠️ GANTI dengan konfigurasi Firebase kamu sendiri!
const firebaseConfig = {
  apiKey: "AIzaSyCC1J2QSWvVtYod6zJke9-kFcrY4vlgPuw",
  authDomain: "chatapp-ku.firebaseapp.com",
  projectId: "chatapp-ku",
  storageBucket: "chatapp-ku.firebasestorage.app",
  messagingSenderId: "G441093269168",
  appId: "1:441093269168:web:70916346fa5b7250bb3d75"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
