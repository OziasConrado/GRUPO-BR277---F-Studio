// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAXkHzsjAzoSbU0v2nJdfYnAemCP6-FrwY",
  authDomain: "grupo-br-277.firebaseapp.com",
  projectId: "grupo-br-277",
  storageBucket: "grupo-br-277.appspot.com", // Corrigido para o formato padrão
  messagingSenderId: "616095109370",
  appId: "1:616095109370:web:484250c8b78950dad1f943",
  measurementId: "G-ELT449B7FS"
};

// Inicializa o Firebase de forma segura para HMR (Hot Module Replacement) no Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Inicializa o Analytics apenas no lado do cliente e se for suportado
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, firestore, storage, analytics, firebaseConfig };
