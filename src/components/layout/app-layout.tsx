
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import Link from 'next/link'; // Added Link
import Navigation from './navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCcw, Moon, Sun, ArrowLeft, Bell, User, MoreVertical, LifeBuoy, FileText, Shield, Bug, Edit3, LogOut } from 'lucide-react'; // Added Edit3, LogOut
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatFloatingButton from '@/components/chat/ChatFloatingButton'; 
import { useNotification } from '@/contexts/NotificationContext';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const { toast } = useToast();
  const { notificationCount, clearNotifications } = useNotification();
  const { isChatOpen, closeChat } = useChat(); 
  const { currentUser, signOutUser, isAuthenticating } = useAuth(); // Added signOutUser and isAuthenticating

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

  const handleNotificationClick = () => {
    toast({
        title: "Notificações",
        description: notificationCount > 0 ? `Você tem ${notificationCount} nova(s) notificação(ões).` : "Nenhuma nova notificação.",
    });
  };

  const handleMenuAction = (action: string) => {
    toast({
        title: "Menu Ação",
        description: `${action} clicado. Funcionalidade em breve!`,
    });
  };

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  const AppHeader = () => {
    if (isAuthPage) return null; // Don't render header on auth pages

    return (
    <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
      <div className="px-2 sm:px-4 flex h-16 sm:h-20 items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-0 sm:gap-0">
            <Tooltip>
            <TooltipTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Voltar</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Voltar</p>
            </TooltipContent>
            </Tooltip>

            <Tooltip>
            <TooltipTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                >
                <RefreshCcw className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="sr-only">Recarregar Página</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Recarregar</p>
            </TooltipContent>
            </Tooltip>
        </div>


        <div className="flex items-center gap-0 sm:gap-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
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
                onClick={handleNotificationClick}
                className="relative text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Notificações {notificationCount > 0 ? `(${notificationCount})` : ''}</p>
            </TooltipContent>
          </Tooltip>

          {currentUser && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                   <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 p-0 h-10 w-10 sm:h-12 sm:w-12">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                        {currentUser?.photoURL ? (
                            <AvatarImage
                                src={currentUser.photoURL}
                                alt={currentUser.displayName || 'User Avatar'}
                                data-ai-hint="user profile"
                            />
                          ) : null}
                          <AvatarFallback>
                            {currentUser.displayName ? currentUser.displayName.substring(0,1).toUpperCase() : <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Meu Perfil</span>
                      </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Meu Perfil</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{currentUser.displayName || currentUser.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile/edit" passHref>
                  <DropdownMenuItem>
                    <Edit3 className="mr-2 h-4 w-4" />
                    <span>Editar Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={signOutUser} disabled={isAuthenticating}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}


          <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12">
                            <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span className="sr-only">Mais Opções</span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>Opções</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuAction('Suporte')}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Suporte</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('Política de Privacidade')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Política de Privacidade</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuAction('Termos de Uso')}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Termos de Uso</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuAction('Relatar bugs')}>
                <Bug className="mr-2 h-4 w-4" />
                <span>Relatar bugs</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )};

  if (!isMounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {!isAuthPage && <div className="sticky top-0 z-50 w-full bg-primary h-16 sm:h-20"></div>}
        <main className={cn("flex-grow container mx-auto px-2 py-8", !isAuthPage && "pb-20 sm:pb-8")}></main>
        {!isAuthPage && <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background h-[65px] sm:hidden"></div>}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className={cn(
            "flex-grow container mx-auto px-2 py-8",
            !isAuthPage && "pb-20 sm:pb-8" // Only add bottom padding if not an auth page
        )}>
          {children}
        </main>
        {!isAuthPage && (
            <>
                <Navigation />
                <ChatFloatingButton />
                {isChatOpen && <ChatWindow onClose={closeChat} />}
            </>
        )}
      </div>
    </TooltipProvider>
  );
}
