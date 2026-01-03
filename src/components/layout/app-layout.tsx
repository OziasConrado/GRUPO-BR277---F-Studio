'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Providers } from '@/app/providers'; 
import Header from '@/components/layout/header';
import Navigation from '@/components/layout/navigation';
import { useChat } from '@/contexts/ChatContext';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Componente interno para gerenciar a abertura do chat
function ChatManager() {
    const { isChatOpen, closeChat } = useChat();
    if (isChatOpen) {
        return <ChatWindow onClose={closeChat} />;
    }
    return null;
}

function MainAppLayout({ children }: { children: ReactNode }) {
    const { currentUser, loading: authLoading } = useAuth();
    const pathname = usePathname();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);

    // This shows a global loader while auth state is being determined.
    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // For auth pages, we don't render the main layout (header, nav).
    if (isAuthPage) {
        return (
            <main className="flex-grow container mx-auto px-2 py-8">
                {children}
            </main>
        );
    }
    
    // Once loading is false, and it's not an auth page, render the full app layout.
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-2 py-8 pb-20 sm:pb-8">
                {children}
            </main>
            {currentUser && currentUser.emailVerified && (
                 <>
                    <Navigation />
                    <ChatManager />
                 </>
            )}
        </div>
    );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <Providers>
            <MainAppLayout>{children}</MainAppLayout>
        </Providers>
    );
}
