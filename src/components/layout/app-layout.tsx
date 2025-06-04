
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from './navigation';
import EmergencyButton from '@/components/common/emergency-button';
import { UserCircle, RefreshCcw, Moon, Sun, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatFloatingButton from '@/components/chat/ChatFloatingButton';
import ChatWindow from '@/components/chat/ChatWindow';

interface AppLayoutProps {
  children: ReactNode;
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

  // Cabeçalho unificado para desktop e mobile
  const AppHeader = () => (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        {/* Botão de Voltar à esquerda */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="text-primary-foreground hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              <span className="sr-only">Voltar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Voltar</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Ícones da Direita */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="text-primary-foreground hover:bg-white/10 rounded-full"
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
                className="text-primary-foreground hover:bg-white/10 rounded-full"
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
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 rounded-full">
                <UserCircle className="h-6 w-6 sm:h-7 sm:w-7" />
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
        <main className="flex-grow container mx-auto px-4 py-8 pb-24 sm:pb-8"></main>
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background h-[65px] sm:hidden"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8 pb-20 sm:pb-8"> {/* Padding para rodapé mobile */}
          {children}
        </main>
        {/* Botão de Emergência Fixo e Navegação Mobile */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-3 sm:hidden">
            <EmergencyButton />
        </div>
        <div className="sm:hidden"> {/* Garante que ChatFloatingButton só apareça se Navigation não for o principal meio de chat */}
            <ChatFloatingButton onClick={() => setIsChatOpen(true)} />
        </div>

        <Navigation /> {/* Contém a navegação de rodapé para mobile */}
        
        {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
      </div>
    </TooltipProvider>
  );
}

