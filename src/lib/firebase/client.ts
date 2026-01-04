
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore, enableNetwork } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Build-safe initialization
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn("Firebase client config not found. Firebase services will be unavailable.");
} else {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      setPersistence(auth, browserLocalPersistence);

      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      });
      
      enableNetwork(db);

      storage = getStorage(app);

    } catch (error) {
      console.error("CRITICAL: Erro ao inicializar o Firebase.", error);
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
}

// @ts-ignore
export { app, auth, db, storage };
