'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';
import AppLayout from '@/components/layout/app-layout';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <AppLayout>{children}</AppLayout>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
