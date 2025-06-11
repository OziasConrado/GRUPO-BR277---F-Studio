
// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

if (!apiKey) {
  console.error(
    "FATAL ERROR: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Please ensure it is correctly set in your .env file for local development (Firebase Studio Preview) " +
    "and in your hosting environment's variables (e.g., apphosting.yaml for Firebase App Hosting). " +
    "The application will not work correctly without it. Check your browser's developer console for this message."
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: apiKey, // Use the apiKey variable that was checked
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId
};

// Initialize Firebase
let appInstance; // Renamed to avoid conflict with exported 'app'
// Only attempt to initialize if the API key is present, as it's critical.
if (apiKey) {
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

// Export appInstance as 'app' for consistency if needed elsewhere,
// or consider renaming exports if 'app' causes confusion.
export { appInstance as app, auth, firestore, storage, analytics, firebaseConfig };
