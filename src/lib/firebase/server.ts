
import { initializeApp, getApps, getApp, type App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

// Build-safe initialization
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  try {
    if (!getApps().length) {
       app = initializeApp({
         projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
         storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
       });
       console.log("--- Firebase Admin SDK inicializado. ---");
    } else {
       app = getApp();
    }

    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    firestore.settings({ preferRest: true });

  } catch (e: any) {
    console.error("--- Erro CRÍTICO ao inicializar Firebase Admin SDK ---:", e.stack || e);
  }
} else {
  console.warn("--- Aviso: Variáveis de ambiente do Firebase ausentes. Admin SDK não foi inicializado. ---");
}

// @ts-ignore
export { app, auth, firestore, storage };
