// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  "projectId": "grupo-br277",
  "appId": "1:491779757123:web:f0c1615487eb032c17b0f6",
  "storageBucket": "grupo-br277.appspot.com",
  "apiKey": "AIzaSyBkj9LYAUrrdXXb-M80C-q9FMQxGWMWA1A",
  "authDomain": "grupo-br277.firebaseapp.com",
  "measurementId": "G-MD0VTEF82W",
  "messagingSenderId": "491779757123"
};

// Singleton pattern to initialize Firebase app
function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app: FirebaseApp = getFirebaseApp();
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

let analytics: Analytics | null = null;
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
 * @param path The path in Firebase Storage where the file should be saved (e.g., 'profile_pictures/user_id/filename.jpg').
 * @param onProgress Optional callback to track upload progress (receives a number from 0 to 100).
 * @returns A promise that resolves with the public download URL of the file.
 */
export function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error('Permissão negada. Verifique as regras de segurança do Firebase Storage.'));
            break;
          case 'storage/canceled':
            // Upload was canceled, so we don't need to reject, just do nothing.
            break;
          default:
            reject(new Error('Ocorreu um erro desconhecido durante o upload.'));
            break;
        }
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
           console.error('Firebase Storage getDownloadURL error:', error);
          reject(new Error('Não foi possível obter a URL de download após o upload.'));
        }
      }
    );
  });
}

export { app, auth, firestore, storage, analytics };
