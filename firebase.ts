
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración real de En Armonía
const firebaseConfig = {
  apiKey: "AIzaSyAzwH2u0MKkt3RK3UujCZR_HD1p41NPmh8",
  authDomain: "enarmonia-289df.firebaseapp.com",
  projectId: "enarmonia-289df",
  storageBucket: "enarmonia-289df.firebasestorage.app",
  messagingSenderId: "681147149519",
  appId: "1:681147149519:web:6b5f2aac462a61a9ac9bba",
  measurementId: "G-WL1CGJ9YJH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
