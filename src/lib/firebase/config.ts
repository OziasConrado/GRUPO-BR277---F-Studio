
// NOTE: This file is used for client-side configuration for DEVELOPMENT and PRODUCTION.
// It relies on NEXT_PUBLIC_ environment variables.

import { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBkj9LYAUrrdXXb-M80C-q9FMQxGWMWA1A',
  authDomain: 'grupo-br277.firebaseapp.com',
  projectId: 'grupo-br277',
  storageBucket: 'grupo-br277.firebasestorage.app',
  messagingSenderId: '491779757123',
  appId: '1:491779757123:web:48eae01a02fa2b3617b0f6',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
