'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Providers } from '@/app/providers'; 
import Header from '@/components/layout/header';
import Navigation from '@/components/layout/navigation';
import { useChat } from '@/contexts/ChatContext';
import ChatWindow from '@/components/chat/ChatWindow';

// Componente interno para gerenciar a abertura do chat
function ChatManager() {
    const { isChatOpen, closeChat } = useChat();
    if (isChatOpen) {
        return <ChatWindow onClose={closeChat} />;
    }
    return null;
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);
    
    return (
        <Providers>
            {isAuthPage ? (
                <main className="flex-grow container mx-auto px-2 py-8">
                    {children}
                </main>
            ) : (
                <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-grow container mx-auto px-2 py-8 pb-20 sm:pb-8">
                        {children}
                    </main>
                    <Navigation />
                    <ChatManager />
                </div>
            )}
        </Providers>
    );
}
