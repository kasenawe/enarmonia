// Fix: Use scoped packages (@firebase/app, @firebase/firestore and @firebase/storage) to resolve TS errors with named exports in modular Firebase
import { initializeApp } from "@firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "@firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "@firebase/storage";

// Configuración de Soledad Cedres Quiropráctica
const firebaseConfig = {
  apiKey: "AIzaSyAzwH2u0MKkt3RK3UujCZR_HD1p41NPmh8",
  authDomain: "enarmonia-289df.firebaseapp.com",
  projectId: "enarmonia-289df",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "enarmonia-289df.appspot.com",
  messagingSenderId: "681147149519",
  appId: "1:681147149519:web:6b5f2aac462a61a9ac9bba",
  measurementId: "G-WL1CGJ9YJH",
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
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
};
