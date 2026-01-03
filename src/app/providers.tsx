
'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

interface ProvidersProps {
    children: ReactNode;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

export function Providers({ children, auth, firestore, storage }: ProvidersProps) {
  return (
    <AuthProvider auth={auth} firestore={firestore} storage={storage}>
        <NotificationProvider>
            <ChatProvider>
                {children}
            </ChatProvider>
        </NotificationProvider>
    </AuthProvider>
  );
}
