// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!firebaseConfigString) {
    console.error("Firebase config not found. Make sure NEXT_PUBLIC_FIREBASE_CONFIG is set.");
    // Assign null to exports if config is not available
    app = null as any;
    auth = null as any;
    firestore = null as any;
    storage = null as any;
} else {
    try {
        const firebaseConfig = JSON.parse(firebaseConfigString);
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }

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
    } catch (e) {
        console.error("Failed to parse or initialize Firebase config:", e);
        app = null as any;
        auth = null as any;
        firestore = null as any;
        storage = null as any;
    }
}


export { app, auth, firestore, storage, analytics };
