
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Navigation from './navigation';
import EmergencyButton from '@/components/common/emergency-button';
import { UserCircle, RefreshCcw, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  if (!isMounted) {
    // Evita piscar de tema no carregamento inicial
    return (
      <div className="flex flex-col min-h-screen">
         <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg rounded-b-xl">
          <div className="container flex h-20 items-center justify-between">
            <div className="h-10 w-10"></div> {}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8"></div> {}
              <div className="h-8 w-8"></div> {}
              <div className="h-8 w-8"></div> {}
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 pb-24 sm:pb-8">
          {children}
        </main>
        {}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t glassmorphic sm:hidden h-16"></nav> {}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg rounded-b-xl">
          <div className="container flex h-20 items-center justify-between">
            <EmergencyButton className="h-11 w-11" iconClassName="h-5 w-5" />
            
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                    <UserCircle className="h-6 w-6" />
                    <span className="sr-only">Meu Perfil</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Meu Perfil</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center p-2 rounded-md hover:bg-primary/80 cursor-pointer">
                    {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={handleThemeChange}
                      aria-label="Toggle dark mode"
                      className="ml-2 data-[state=checked]:bg-primary-foreground/20 data-[state=unchecked]:bg-primary-foreground/20 [&>span]:bg-background"
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
                    className="text-primary-foreground hover:bg-primary/80"
                  >
                    <RefreshCcw className="h-5 w-5" />
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
        <main className="flex-grow container mx-auto px-4 py-8 pb-24 sm:pb-8">
          {children}
        </main>
        <Navigation />
      </div>
    </TooltipProvider>
  );
}
