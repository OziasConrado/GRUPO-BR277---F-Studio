
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  "projectId": "grupobr277-v2-d85f5",
  "appId": "1:491779757123:web:f0c1615487eb032c17b0f6",
  "storageBucket": "grupobr277-v2-d85f5.appspot.com",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  "measurementId": process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  "messagingSenderId": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};

// --- Início da Implementação do Padrão Singleton ---

const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
let analytics: Analytics | null = null;

// Inicializa o Analytics apenas no lado do cliente (browser).
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be saved.
 * @returns A promise that resolves with the public download URL of the file.
 */
export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  
  // Utiliza await diretamente para simplificar o código e melhorar o tratamento de erros.
  const uploadTask = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(uploadTask.ref);
  
  return downloadURL;
}


// Exporta as instâncias prontas para serem usadas em qualquer lugar do app.
export { app, auth, firestore, storage, analytics };
