
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false, 
    });
    storage = getStorage(app);
  } catch (error) {
    console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    // Em um cenário real, você poderia ter uma página de erro ou um fallback.
    // Por enquanto, vamos lançar o erro para que fique visível no console.
    throw new Error("Falha na inicialização dos serviços essenciais do Firebase.");
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
