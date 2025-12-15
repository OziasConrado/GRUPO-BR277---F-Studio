
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

function getFirebaseServices() {
  if (app) {
    return { app, auth, firestore, storage, analytics };
  }

  if (getApps().length === 0) {
    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.projectId ||
      !firebaseConfig.authDomain
    ) {
      throw new Error(
        "Firebase config is missing. Make sure NEXT_PUBLIC_FIREBASE_* environment variables are set."
      );
    }
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== "undefined") {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }

  return { app, auth, firestore, storage, analytics };
}

// Lazy initialization: Services are now accessed via these functions
function getFirebaseAuth() {
  return getFirebaseServices().auth;
}

function getFirebaseFirestore() {
  return getFirebaseServices().firestore;
}

function getFirebaseStorage() {
  return getFirebaseServices().storage;
}

function getFirebaseApp() {
  return getFirebaseServices().app;
}

function getFirebaseAnalytics() {
  return getFirebaseServices().analytics;
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
