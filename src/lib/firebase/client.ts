'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore, enableNetwork } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Padrão Singleton para garantir que o Firebase seja inicializado apenas uma vez
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);

    // Configuração do Firestore com flags para ambientes de proxy
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false, // Garante que apenas long polling seja usado
      useFetchStreams: false,
      ignoreUndefinedProperties: true,
    });
    
    // Força a tentativa de conexão de rede imediatamente
    enableNetwork(db).catch(err => console.warn("Firebase enableNetwork failed on initial load, will retry automatically.", err));

    storage = getStorage(app);

  } catch (error) {
    console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    throw new Error("Falha na inicialização dos serviços essenciais do Firebase.");
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
