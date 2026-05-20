// Fix: Use scoped packages (@firebase/app, @firebase/firestore and @firebase/storage) to resolve TS errors with named exports in modular Firebase
import { initializeApp } from "@firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "@firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "@firebase/storage";

const firebaseConfig = {
  // Fallbacks temporales para no romper produccion mientras se migran entornos.
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAzwH2u0MKkt3RK3UujCZR_HD1p41NPmh8",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "enarmonia-289df.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "enarmonia-289df",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "enarmonia-289df.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "681147149519",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:681147149519:web:6b5f2aac462a61a9ac9bba",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WL1CGJ9YJH",
};

// Inicialización modular (v9/v10+)
// Se usan los paquetes con prefijo @firebase para asegurar que los exports nombrados sean reconocidos correctamente
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "es";
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
};
