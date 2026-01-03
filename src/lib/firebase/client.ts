
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    // 1. Inicializa o Firestore com a flag para forçar long-polling
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    auth = getAuth(app);
    storage = getStorage(app);

    // 2. Garante a persistência de autenticação local (embora seja o padrão)
    setPersistence(auth, browserLocalPersistence);

  } catch (error) {
    console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    throw new Error("Falha na inicialização dos serviços essenciais do Firebase.");
  }
} else {
  app = getApp();
  // Garante que a instância do DB use long-polling mesmo se o app já existir.
  db = getFirestore(app); 
  auth = getAuth(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
