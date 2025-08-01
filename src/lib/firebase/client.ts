
// src/lib/firebase/client.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
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


let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!firebaseConfig) {
    console.error("Firebase config not found.");
    // Assign null to exports if config is not available
    app = null as any;
    auth = null as any;
    firestore = null as any;
    storage = null as any;
} else {
    try {
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
