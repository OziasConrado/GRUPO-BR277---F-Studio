// --- Ponto Central de Inicialização do Firebase para o Cliente ---

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Evita a reinicialização no ambiente de HMR (Hot Module Replacement) do Next.js
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Configuração crucial para ambientes de proxy/nuvem como o Google Cloud Workstations
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    storage = getStorage(app);
  } catch (error) {
    console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    // Em um caso real, você poderia mostrar uma tela de erro aqui
    throw error;
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
