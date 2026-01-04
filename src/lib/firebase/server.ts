
// --- Início da Implementação do Padrão Singleton para o Lado do Servidor ---

import { initializeApp, getApp, getApps, type App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';

// Variáveis para armazenar as instâncias dos serviços
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

// Verifica se a variável de ambiente do Google está presente (indicativo de ambiente de servidor)
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  try {
    // Evita reinicialização do app
    if (!getApps().length) {
       console.log("--- Inicializando Firebase Admin SDK com credenciais padrão ---");
       // No ambiente do Google Cloud (incluindo Workstations), o SDK usa as
       // credenciais do ambiente automaticamente. Não é necessário serviceAccount.
       app = initializeApp({
         projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
         storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
       });
    } else {
       app = getApp();
       console.log("--- Reutilizando instância existente do Firebase Admin SDK ---");
    }

    // Inicializa os serviços usando a instância única do app
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);

  } catch (e: any) {
    console.error("--- Erro CRÍTICO ao inicializar Firebase Admin SDK ---:", e);
    // Em caso de falha, deixamos as instâncias como undefined
  }
} else {
  // Se a variável de ambiente não existe, avisamos no console durante o build.
  console.warn("--- Aviso: NEXT_PUBLIC_FIREBASE_PROJECT_ID ausente. Firebase Admin SDK não inicializado. ---");
}

// Exporta as instâncias (que podem ser undefined se a inicialização falhar ou for ignorada)
export { app, auth, firestore, storage };
