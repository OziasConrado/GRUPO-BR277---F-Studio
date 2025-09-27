// src/lib/firebase/admin.ts
import { initFirebaseAdminSDK } from 'firebase-admin/app';
import { getApps, initializeApp, cert, getApp, App } from 'firebase-admin/app';

function getServiceAccount() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
  }
  return JSON.parse(serviceAccount);
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const app = initializeApp({
    credential: cert(getServiceAccount()),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return app;
}
