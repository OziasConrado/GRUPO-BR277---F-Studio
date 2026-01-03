'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onSnapshot, doc, type Firestore } from 'firebase/firestore';
import { db as firestoreInstance } from '@/lib/firebase/client'; // Importa a instância única

interface FirestoreContextType {
  db: Firestore | null;
  isFirestoreReady: boolean;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  useEffect(() => {
    if (firestoreInstance) {
      // Realiza uma verificação de saúde para confirmar a conexão de rede.
      const unsubscribe = onSnapshot(
        doc(firestoreInstance, 'health_check/status'), // Um documento que não precisa existir.
        {
          next: () => {
            if (!isFirestoreReady) setIsFirestoreReady(true);
            unsubscribe();
          },
          error: (err) => {
            // Um erro de permissão ainda confirma a conectividade de rede.
            console.warn("Firestore health check resulted in a permission error (this is okay):", err.code);
            if (!isFirestoreReady) setIsFirestoreReady(true);
            unsubscribe();
          }
        }
      );

      // Fallback de timeout para garantir que o app não fique preso.
      const readyTimeout = setTimeout(() => {
        if (!isFirestoreReady) {
            console.warn("Firestore readiness check timed out. Proceeding...");
            setIsFirestoreReady(true);
            unsubscribe();
        }
      }, 8000); // 8 segundos

      return () => {
        unsubscribe();
        clearTimeout(readyTimeout);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FirestoreContext.Provider value={{ db: firestoreInstance, isFirestoreReady }}>
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
