
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

// Configuración de En Armonía
const firebaseConfig = {
  apiKey: "AIzaSyAzwH2u0MKkt3RK3UujCZR_HD1p41NPmh8",
  authDomain: "enarmonia-289df.firebaseapp.com",
  projectId: "enarmonia-289df",
  storageBucket: "enarmonia-289df.firebasestorage.app",
  messagingSenderId: "681147149519",
  appId: "1:681147149519:web:6b5f2aac462a61a9ac9bba",
  measurementId: "G-WL1CGJ9YJH"
};

// Inicialización modular (v9/v10+)
// Se usa la sintaxis modular para asegurar compatibilidad con versiones recientes de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc };
