
// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// These values should match those in your .env file for local development
// and in apphosting.yaml for production.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkj9LYAUrrdXXb-M80C-q9FMQxGWMWA1A",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "grupo-br277.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "grupo-br277",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "grupo-br277.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "491779757123",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:491779757123:web:48eae01a02fa2b3617b0f6",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-L7QXVV5X54",
};

// Critical check for the API key
if (!firebaseConfig.apiKey) {
  console.error(
    "FATAL ERROR: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Please ensure it is correctly set in your .env file for local development " +
    "and in your hosting environment's variables (e.g., apphosting.yaml for Firebase App Hosting). " +
    "The application will not work correctly without it. Check your browser's developer console for this message."
  );
}

// Initialize Firebase
let appInstance;
// Only attempt to initialize if the API key is present, as it's critical.
if (firebaseConfig.apiKey) {
  if (!getApps().length) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }
} else {
  console.error("Firebase App could not be initialized due to missing API key. Subsequent Firebase calls will fail.");
  // appInstance will remain undefined.
}

// Initialize Firebase services only if the appInstance was successfully initialized
const auth = appInstance ? getAuth(appInstance) : null;
const firestore = appInstance ? getFirestore(appInstance) : null;
const storage = appInstance ? getStorage(appInstance) : null;
let analytics;

if (appInstance && typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(appInstance!); // appInstance is checked, so ! is safe here
    }
  });
}

export { appInstance as app, auth, firestore, storage, analytics, firebaseConfig };
