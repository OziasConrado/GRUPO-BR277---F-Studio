'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkj9LYAUrrdXXb-M80C-q9FMQxGWMWA1A",
  authDomain: "grupo-br277.firebaseapp.com",
  projectId: "grupo-br277",
  storageBucket: "grupo-br277.appspot.com",
  messagingSenderId: "491779757123",
  appId: "1:491779757123:web:48eae01a02fa2b3617b0f6",
  measurementId: "G-L7QXVV5X54"
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