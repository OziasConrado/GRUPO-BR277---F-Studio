
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';
import Header from '@/components/layout/header'; // Importa o novo componente Header
import Navigation from '@/components/layout/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';


const protectedRoutes = ['/feed', '/profile/edit', '/admin/banners', '/turismo', '/ferramentas', '/sau', '/streaming'];

// Componente interno para gerenciar a abertura do chat
function ChatManager() {
    const { isChatOpen, closeChat } = useChat();
    if (isChatOpen) {
        return <ChatWindow onClose={closeChat} />;
    }
    return null;
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { currentUser, loading, isFirebaseReady } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading || !isFirebaseReady) return;

        const isAuthFlowPage = ['/login', '/register', '/forgot-password'].includes(pathname);
        const isVerifyPage = pathname === '/verify-email';
        
        let isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthFlowPage && !isVerifyPage;
        if (pathname === '/') isProtectedRoute = true;
        if(pathname.startsWith('/cadastro/') || pathname.startsWith('/guia-comercial/') || pathname.startsWith('/turismo/')) isProtectedRoute = true;


        if (!currentUser && isProtectedRoute) {
            router.replace(`/login?redirect=${pathname}`);
        } else if (currentUser) {
            if (!currentUser.emailVerified && !isVerifyPage) {
                router.replace('/verify-email');
            } else if (currentUser.emailVerified && (isAuthFlowPage || isVerifyPage)) {
                router.replace('/streaming'); // Default page after login
            }
        }
    }, [currentUser, loading, isFirebaseReady, pathname, router]);


    const showLoadingScreen = loading || !isFirebaseReady;
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);

    if (showLoadingScreen) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // Se for uma página de autenticação, mostra um layout simples sem header/nav
    if (isAuthPage) {
        return (
             <main className="flex-grow container mx-auto px-2 py-8">
                {children}
            </main>
        )
    }
    
    // Se o usuário não estiver logado mas a página não for protegida (ex: publica), renderiza sem header/nav.
     if (!currentUser) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    // Layout principal para usuários logados
    return (
        <NotificationProvider>
            <ChatProvider>
                <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className={cn(
                        "flex-grow container mx-auto px-2 py-8",
                        !isAuthPage && "pb-20 sm:pb-8"
                    )}>
                        {children}
                    </main>
                    <Navigation />
                    <ChatManager />
                </div>
            </ChatProvider>
        </NotificationProvider>
    );
}
