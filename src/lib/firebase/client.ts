
'use client';

// Importa apenas os tipos e funções necessárias, sem inicializar nada.
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// A configuração do Firebase agora será tratada dentro do AuthContext.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Singleton para a instância do app Firebase
let app;
if (getApps().length === 0) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error("Firebase config is missing. Make sure NEXT_PUBLIC_FIREBASE_* environment variables are set.");
    } else {
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

// Exporta as instâncias dos serviços, que agora serão inicializadas corretamente.
export const auth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Função de upload permanece a mesma, mas usará a instância de storage exportada.
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized.");
  }
  const storageRef = ref(storage, path);
  const uploadTask = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(uploadTask.ref);
  return downloadURL;
}

// Analytics continua sendo opcional e baseado no suporte do navegador.
export const analytics = (typeof window !== 'undefined' && app) 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : null;
