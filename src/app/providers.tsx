'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { FirestoreProvider } from '@/contexts/FirestoreContext';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <FirestoreProvider>
        <AuthProvider>
            <NotificationProvider>
                <ChatProvider>
                    {children}
                </ChatProvider>
            </NotificationProvider>
        </AuthProvider>
    </FirestoreProvider>
  );
}
