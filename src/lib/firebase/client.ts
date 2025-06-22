
// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// These values should match those in your .env file for local development
// and in apphosting.yaml for production. By using process.env, we ensure
// the app always uses the configuration provided by the hosting environment.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Critical check for the API key to provide a clear error message if it's missing.
if (!firebaseConfig.apiKey) {
  console.error(
    "FATAL ERROR: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Please ensure it is correctly set in your .env file for local development " +
    "and in your hosting environment's variables (e.g., apphosting.yaml for Firebase App Hosting). " +
    "The application will not work correctly without it."
  );
}

// Initialize Firebase
let appInstance;
// Only attempt to initialize if the API key is present.
if (firebaseConfig.apiKey) {
  if (!getApps().length) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApp();
  }
} else {
  console.error("Firebase App could not be initialized due to missing API key. Subsequent Firebase calls will fail.");
}

// Initialize Firebase services only if the appInstance was successfully initialized
const auth = appInstance ? getAuth(appInstance) : null;
const firestore = appInstance ? getFirestore(appInstance) : null;
const storage = appInstance ? getStorage(appInstance) : null;
let analytics;

if (appInstance && typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(appInstance!);
    }
  });
}

export { appInstance as app, auth, firestore, storage, analytics, firebaseConfig };
