
// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

// A function to initialize the app safely
function initializeFirebase() {
    if (firebaseConfigString) {
        try {
            const firebaseConfig = JSON.parse(firebaseConfigString);
            return initializeApp(firebaseConfig);
        } catch (e) {
            console.error("Failed to parse Firebase config:", e);
            return null;
        }
    }
    console.error("Firebase config not found. Cannot initialize Firebase. Make sure NEXT_PUBLIC_FIREBASE_CONFIG is set in your environment.");
    return null;
}

// Get the existing app or initialize a new one
const app = getApps().length ? getApp() : initializeFirebase();

// The correct bucket name, confirmed via gsutil
const BUCKET_URL = "gs://grupo-br277.firebasestorage.app";

// Conditionally get services
const auth = app ? getAuth(app) : null;
const firestore = app ? getFirestore(app) : null;
// Explicitly provide the storage bucket URL during initialization
const storage = app ? getStorage(app, BUCKET_URL) : null;
let analytics;

// Initialize analytics only on client side if supported
if (app && typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, firestore, storage, analytics };
