
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Navigation from './navigation';
import EmergencyButton from '@/components/common/emergency-button';
import { UserCircle, RefreshCcw, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatFloatingButton from '@/components/chat/ChatFloatingButton';
import ChatWindow from '@/components/chat/ChatWindow';
import { RotaSeguraLogo } from '@/components/common/rota-segura-logo'; // Importei a logo

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const handleThemeChange = (checked: boolean) => {
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    }
  };

  // Cabeçalho unificado para desktop e mobile
  const AppHeader = () => (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        {/* Botão de Emergência à esquerda OU Logo em desktop */}
        <div className="sm:hidden">
          <EmergencyButton className="h-11 w-11" iconClassName="h-5 w-5" />
        </div>
        <div className="hidden sm:block">
          <RotaSeguraLogo height={30} width={120} />
        </div>
        
        {/* Ícone Rota Segura Centralizado em Mobile */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden">
          <RotaSeguraLogo height={28} width={110} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80 rounded-full">
                <UserCircle className="h-5 w-5 sm:h-6 sm:h-6" />
                <span className="sr-only">Meu Perfil</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Meu Perfil</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center p-1.5 sm:p-2 rounded-full hover:bg-primary/80 cursor-pointer">
                {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:h-5 text-yellow-400" /> : <Moon className="h-4 w-4 sm:h-5 sm:h-5" />}
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={handleThemeChange}
                  aria-label="Toggle dark mode"
                  className="ml-1.5 sm:ml-2 scale-75 sm:scale-100 data-[state=checked]:bg-primary-foreground/20 data-[state=unchecked]:bg-primary-foreground/20 [&>span]:bg-background"
                />
              </div>
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
                className="text-primary-foreground hover:bg-primary/80 rounded-full"
              >
                <RefreshCcw className="h-4 w-4 sm:h-5 sm:h-5" />
                <span className="sr-only">Recarregar Página</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Recarregar Página</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );


  if (!isMounted) {
    return ( // Fallback simples para evitar piscar de tema/layout
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
        <main className="flex-grow container mx-auto px-4 py-8 pb-24 sm:pb-8"> {/* Padding para rodapé mobile */}
          {children}
        </main>
        <Navigation /> {/* Contém a navegação de rodapé para mobile */}
        <ChatFloatingButton onClick={() => setIsChatOpen(true)} />
        {isChatOpen && <ChatWindow onClose={() => setIsChatOpen(false)} />}
      </div>
    </TooltipProvider>
  );
}
