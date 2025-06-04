
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './navigation';
// EmergencyButton removed as per request from this component
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; 
import { RefreshCcw, Moon, Sun, ArrowLeft } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// ChatFloatingButton removed as per request
import ChatWindow from '@/components/chat/ChatWindow';

interface AppLayoutProps {
  children: ReactNode;
}

export interface AppLayoutContextType {
  isChatOpen: boolean;
  setIsChatOpen: Dispatch<SetStateAction<boolean>>;
}

const AppLayoutContext = createContext<AppLayoutContextType | undefined>(undefined);

export function useAppLayout() {
  const context = useContext(AppLayoutContext);
  if (context === undefined) {
    throw new Error('useAppLayout must be used within an AppLayoutProvider');
  }
  return context;
}


export default function AppLayout({ children }: AppLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDarkMode(newIsDarkMode);
  };

  const AppHeader = () => (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-primary-foreground hover:bg-white/10 rounded-full h-10 w-10 sm:h-11 sm:w-11"
            >
              <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="sr-only">Voltar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Voltar</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-primary-foreground hover:bg-white/10 rounded-full h-10 w-10 sm:h-11 sm:w-11"
                aria-label="Alternar tema claro/escuro"
              >
                {isDarkMode ? <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" /> : <Moon className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="text-primary-foreground hover:bg-white/10 rounded-full h-10 w-10 sm:h-11 sm:w-11"
              >
                <RefreshCcw className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Recarregar Página</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Recarregar Página</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 rounded-full p-0 h-10 w-10 sm:h-11 sm:w-11">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage src="https://placehold.co/80x80.png" alt="Foto do Usuário" data-ai-hint="user profile"/>
                  <AvatarFallback>
                    {/* Placeholder for user initials or icon if image fails */}
                    U
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Meu Perfil</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Meu Perfil</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="sticky top-0 z-50 w-full bg-primary h-16 sm:h-20"></div>
        <main className="flex-grow container mx-auto px-4 py-8 pb-20 sm:pb-8"></main>
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background h-[65px] sm:hidden"></div>
      </div>
    );
  }

  return (
    <AppLayoutContext.Provider value={{ isChatOpen, setIsChatOpen }}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-grow container mx-auto px-4 py-8 pb-20 sm:pb-8">
            {children}
          </main>
          {/* EmergencyButton and ChatFloatingButton removed from here */}
          <Navigation />
          {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
        </div>
      </TooltipProvider>
    </AppLayoutContext.Provider>
  );
}
