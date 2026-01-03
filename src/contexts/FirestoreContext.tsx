'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getFirestore, initializeFirestore, onSnapshot, doc, type Firestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';

interface FirestoreContextType {
  db: Firestore | null;
  isFirestoreReady: boolean;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Firestore | null>(null);
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  useEffect(() => {
    // This effect runs only once to initialize Firestore.
    try {
      const app = getApp();
      const firestoreInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
      setDb(firestoreInstance);

      // Perform a health check to confirm connection before setting as ready.
      const unsubscribe = onSnapshot(
        doc(firestoreInstance, 'health_check/status'),
        {
          next: () => {
            if (!isFirestoreReady) setIsFirestoreReady(true);
            unsubscribe(); // We only need one signal, then we can stop listening.
          },
          error: () => {
            // An error (like permission-denied) still means we are connected to the backend.
            if (!isFirestoreReady) setIsFirestoreReady(true);
            unsubscribe();
          }
        }
      );

      // As a final fallback, if the health check takes too long, we'll assume readiness.
      const readyTimeout = setTimeout(() => {
        if (!isFirestoreReady) {
            console.warn("Firestore readiness check timed out. Proceeding as ready.");
            setIsFirestoreReady(true);
            unsubscribe();
        }
      }, 7000); // 7-second timeout

      // Cleanup on unmount.
      return () => {
        unsubscribe();
        clearTimeout(readyTimeout);
      };
    } catch (e) {
      console.error("Failed to initialize Firestore", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <FirestoreContext.Provider value={{ db, isFirestoreReady }}>
      {isFirestoreReady ? children : null}
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
