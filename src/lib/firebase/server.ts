
import { initializeApp, getApps, getApp, type App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';

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
       app = initializeApp({
         projectId: 'grupo-br277',
         storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
       });
    } else {
       app = getApp();
       console.log("--- Reutilizando instância existente do Firebase Admin SDK ---");
    }

    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);

    firestore.settings({ preferRest: true });
    console.log("--- Firestore Admin SDK configurado para usar REST/HTTP. ---");

  } catch (e: any) {
    console.error("--- Erro CRÍTICO ao inicializar Firebase Admin SDK ---:", e.stack || e);
  }
} else {
  console.warn("--- Aviso: NEXT_PUBLIC_FIREBASE_PROJECT_ID ausente. Firebase Admin SDK não inicializado. ---");
}

export { app, auth, firestore, storage };
