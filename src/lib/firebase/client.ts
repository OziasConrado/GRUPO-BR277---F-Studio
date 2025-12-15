
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

function initializeFirebase() {
  if (app) return; // Already initialized

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.authDomain
  ) {
    throw new Error(
      "Firebase config is missing. Make sure NEXT_PUBLIC_FIREBASE_* environment variables are set."
    );
  }

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== "undefined") {
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    });
  }
}

// Export functions that ensure initialization before returning the service
function getFirebaseAuth() {
  if (!auth) initializeFirebase();
  return auth!;
}

function getFirebaseFirestore() {
  if (!firestore) initializeFirebase();
  return firestore!;
}

function getFirebaseStorage() {
  if (!storage) initializeFirebase();
  return storage!;
}

function getFirebaseApp() {
  if (!app) initializeFirebase();
  return app!;
}

function getFirebaseAnalytics() {
    if (!analytics) initializeFirebase();
    return analytics;
}


async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const instance = getFirebaseStorage();
  const storageRef = ref(instance, path);
  const uploadTask = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(uploadTask.ref);
  return downloadURL;
}

// Export functions to get services instead of the services themselves
export { 
  uploadFile,
  getFirebaseAuth as auth,
  getFirebaseFirestore as firestore,
  getFirebaseStorage as storage,
  getFirebaseApp as app,
  getFirebaseAnalytics as analytics
};
