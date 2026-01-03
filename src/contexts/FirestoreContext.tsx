
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Firestore } from 'firebase/firestore';
import { db as firestoreInstance } from '@/lib/firebase/client'; // Importa a instância única

interface FirestoreContextType {
  db: Firestore | null;
  isFirestoreReady: boolean;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export function FirestoreProvider({ children }: { children: ReactNode }) {
  // A conexão agora é tratada como "pronta" imediatamente,
  // confiando no SDK do Firestore para gerenciar a fila de requisições.
  const isFirestoreReady = !!firestoreInstance;

  return (
    <FirestoreContext.Provider value={{ db: firestoreInstance, isFirestoreReady }}>
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
