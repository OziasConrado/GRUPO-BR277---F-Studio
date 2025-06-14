
// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXkHzsjAzoSbU0v2nJdfYnAemCP6-FrwY", // Consider using environment variables here
  authDomain: "grupo-br-277.firebaseapp.com",
  projectId: "grupo-br-277",
  storageBucket: "grupo-br-277.firebasestorage.app",
  messagingSenderId: "616095109370",
  appId: "1:616095109370:web:484250c8b78950dad1f943",
  measurementId: "G-ELT449B7FS"
};


// This check assumes 'apiKey' is a variable holding the API key, likely from environment variables.
if (!firebaseConfig.apiKey) { // Use firebaseConfig.apiKey to access the key
  console.error(
    "FATAL ERROR: Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or undefined. " +
    "Please ensure it is correctly set in your .env file for local development (Firebase Studio Preview) " +
    "and in your hosting environment's variables (e.g., apphosting.yaml for Firebase App Hosting). " +
    "The application will not work correctly without it. Check your browser's developer console for this message."
  );
}


// Initialize Firebase
let appInstance; // Renamed to avoid conflict with exported 'app'
// Only attempt to initialize if the API key is present, as it's critical.
if (firebaseConfig.apiKey) { // Use firebaseConfig.apiKey
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
