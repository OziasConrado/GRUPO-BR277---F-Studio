
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

// Padrão Singleton para garantir que o Firebase seja inicializado apenas uma vez
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Adiciona persistência local explícita para o Auth
    setPersistence(auth, browserLocalPersistence);

    // Configuração do Firestore com as flags de rede para ambientes de proxy
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
      ignoreUndefinedProperties: true, // Adicionado conforme solicitado
    });
    storage = getStorage(app);
  } catch (error) {
    console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    // Isso é um erro fatal e deve impedir o app de continuar de forma instável.
    throw new Error("Falha na inicialização dos serviços essenciais do Firebase.");
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
