
'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Providers } from '@/app/providers'; 
import Header from '@/components/layout/header';
import Navigation from '@/components/layout/navigation';
import { useChat } from '@/contexts/ChatContext';
import ChatWindow from '@/components/chat/ChatWindow';
import { cn } from '@/lib/utils';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '@/lib/firebase/config';

// Componente interno para gerenciar a abertura do chat
function ChatManager() {
    const { isChatOpen, closeChat } = useChat();
    if (isChatOpen) {
        return <ChatWindow onClose={closeChat} />;
    }
    return null;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
    const [isFirebaseReady, setIsFirebaseReady] = useState(false);
    const pathname = usePathname();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);

    useEffect(() => {
        try {
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            const auth = getAuth(app);
            const firestore = initializeFirestore(app, {
                experimentalForceLongPolling: true,
            });
            const storage = getStorage(app);
            setFirebaseServices({ app, auth, firestore, storage });
            setIsFirebaseReady(true);
        } catch (error) {
            console.error("CRITICAL: Failed to initialize Firebase.", error);
        }
    }, []);

    if (!isFirebaseReady || !firebaseServices) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Conectando...</p>
            </div>
        );
    }
    
    return (
        <Providers auth={firebaseServices.auth} firestore={firebaseServices.firestore} storage={firebaseServices.storage}>
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
