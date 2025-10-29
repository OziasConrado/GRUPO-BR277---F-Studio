'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  "projectId": "grupo-br277",
  "appId": "1:491779757123:web:f0c1615487eb032c17b0f6",
  "storageBucket": "grupo-br277.firebasestorage.app",
  "apiKey": "AIzaSyBkj9LYAUrrdXXb-M80C-q9FMQxGWMWA1A",
  "authDomain": "grupo-br277.firebaseapp.com",
  "measurementId": "G-MD0VTEF82W",
  "messagingSenderId": "491779757123"
};

// --- Início da Implementação do Padrão Singleton ---

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

// Verifica se o app já foi inicializado para evitar erros durante o Hot Reloading.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Inicializa os serviços usando a instância única do app.
auth = getAuth(app);
firestore = getFirestore(app);
storage = getStorage(app);

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
