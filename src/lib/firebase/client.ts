'use client';

// --- Ponto Central de Inicialização do Firebase para o Cliente ---
// Garante que o Firebase seja inicializado apenas uma vez.

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Este padrão garante que a inicialização ocorra apenas uma vez.
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    // Configuração crucial para ambientes de proxy/nuvem como o Google Cloud Workstations
    // Força o SDK a usar requisições HTTP longas em vez de WebSockets.
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    // Lançar o erro pode ajudar a depurar, mas em produção você pode querer
    // ter uma tela de erro mais amigável.
    throw new Error("Falha na inicialização dos serviços essenciais do Firebase.");
  }
} else {
  // Se já foi inicializado, apenas obtemos as instâncias.
  app = getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

// Exporta as instâncias prontas para serem usadas em qualquer lugar do app.
export { app, auth, db, storage };
