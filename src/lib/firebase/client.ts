// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

if (firebaseConfigString) {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigString);
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        
        if (app) {
            auth = getAuth(app);
            firestore = getFirestore(app);
            // Explicitly provide the storage bucket URL during initialization
            const BUCKET_URL = "gs://grupo-br277.appspot.com";
            storage = getStorage(app, BUCKET_URL);

            if (typeof window !== 'undefined') {
                isSupported().then((supported) => {
                    if (supported) {
                        analytics = getAnalytics(app);
                    }
                });
            }
        }

    } catch (e) {
        console.error("Failed to parse or initialize Firebase config:", e);
    }
} else {
    console.error("Firebase config not found. Cannot initialize Firebase. Make sure NEXT_PUBLIC_FIREBASE_CONFIG is set in your environment.");
}

export { app, auth, firestore, storage, analytics };
