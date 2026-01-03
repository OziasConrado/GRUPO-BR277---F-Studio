'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
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
    auth = getAuth(app);
    // Garante que a sessão do usuário persista entre recarregamentos
    setPersistence(auth, browserLocalPersistence);

    // Configuração simplificada do Firestore, já que as buscas principais serão via Server Actions
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });

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
