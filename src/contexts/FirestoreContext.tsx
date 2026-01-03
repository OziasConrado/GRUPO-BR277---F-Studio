'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import { type Firestore } from 'firebase/firestore';
import { db as firestoreInstance } from '@/lib/firebase/client'; // Importa a instância única

interface FirestoreContextType {
  db: Firestore | null;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {

  return (
    <FirestoreContext.Provider value={{ db: firestoreInstance }}>
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
