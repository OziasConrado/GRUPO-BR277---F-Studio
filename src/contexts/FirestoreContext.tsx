'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getFirestore, initializeFirestore, onSnapshot, doc, type Firestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

interface FirestoreContextType {
  db: Firestore | null;
  isFirestoreReady: boolean;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Firestore | null>(null);
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  useEffect(() => {
    try {
      const app = getApp();
      // Initialize Firestore with long polling enabled.
      // This is crucial for environments with proxies like Cloud Workstations.
      const firestoreInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
      setDb(firestoreInstance);

      // To confirm connection, we can try to listen to a non-existent document.
      // The '.info/serverTimeOffset' is a good candidate but requires RTDB.
      // A simple onSnapshot on a known path (like a user doc, but that creates dependency)
      // or even a non-existent one can trigger the connection.
      // Let's use a simple, low-impact check. We'll monitor the auth state change as
      // an indirect signal that Firebase services are up. A more direct Firestore
      // health check could be a snapshot on a metadata document if one existed.
      
      const auth = getAuth(app);
      const unsubscribe = onSnapshot(doc(firestoreInstance, 'health_check/status'), {
          next: () => {
             // Successfully got a response (or non-response) from Firestore, meaning connection is up.
             if (!isFirestoreReady) setIsFirestoreReady(true);
          },
          error: (err) => {
             // Even an error (like permission-denied) means we are connected.
             if (!isFirestoreReady) setIsFirestoreReady(true);
          }
      });
      
      // As a fallback, we'll set it to ready after a timeout, assuming the connection
      // is established but the health check didn't resolve for some reason.
      const readyTimeout = setTimeout(() => {
          if (!isFirestoreReady) {
              console.warn("Firestore readiness check timed out. Proceeding as ready.");
              setIsFirestoreReady(true);
          }
      }, 5000);


      return () => {
        unsubscribe();
        clearTimeout(readyTimeout);
      };

    } catch (e) {
      console.error("Failed to initialize Firestore", e);
    }
  }, [isFirestoreReady]); // Rerun if readiness changes (for fallback)

  return (
    <FirestoreContext.Provider value={{ db, isFirestoreReady }}>
      {children}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  const context = useContext(FirestoreContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
}
