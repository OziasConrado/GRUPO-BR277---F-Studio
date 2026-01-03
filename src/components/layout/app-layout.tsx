
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCcw, Moon, Sun, ArrowLeft, Bell, User, MoreVertical, LifeBuoy, FileText, Shield, Bug, Edit3, LogOut, Loader2, MessageCircle, BellRing, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ChatWindow from '@/components/chat/ChatWindow';
import { NotificationProvider, useNotification } from '@/contexts/NotificationContext';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { doc, writeBatch, Timestamp } from 'firebase/firestore';
import type { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const protectedRoutes = ['/', '/feed', '/profile/edit', '/admin/banners', '/turismo', '/ferramentas', '/sau', '/streaming']; // Add all routes that need auth

function HeaderAndNav({ isAuthPage }: { isAuthPage: boolean }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const { isChatOpen, closeChat } = useChat();
  const { currentUser, isAuthenticating, signOutUser, firestore, isAdmin } = useAuth();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotification();
  
  useEffect(() => {
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
  
  const handleMarkAsRead = async (notificationId?: string) => {
    if (!currentUser || !firestore || unreadCount === 0) return;

    const batch = writeBatch(firestore);
    if (notificationId) {
        const notifRef = doc(firestore, 'users', currentUser.uid, 'notifications', notificationId);
        batch.update(notifRef, { read: true });
    } else {
        notifications.forEach(n => {
            if (!n.read) {
                const notifRef = doc(firestore, 'users', currentUser.uid, 'notifications', n.id);
                batch.update(notifRef, { read: true });
            }
        });
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error marking notification(s) as read:", error);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
      if (!notification.read) {
          await handleMarkAsRead(notification.id);
      }
      let targetPath = '/';
      if (notification.type === 'mention_post') {
        targetPath = `/#post-${notification.postId}`;
      }
      
      router.push(targetPath);

      setTimeout(() => {
          const element = document.getElementById(`post-${notification.postId}`);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('bg-primary/10', 'ring-2', 'ring-primary/50', 'transition-all', 'duration-1000', 'ease-out', 'rounded-xl');
              setTimeout(() => {
                  element.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/50', 'rounded-xl');
              }, 2500);
          }
      }, 300);
  };

  const handleSupportClick = () => {
    const email = 'oziasconrado@opaatec.com.br';
    const subject = encodeURIComponent('Suporte GRUPO BR277');
    const body = encodeURIComponent('Olá,\\n\\nPreciso de ajuda com o seguinte:\\n\\n');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleReportBugClick = () => {
    const email = 'oziasconrado@opaatec.com.br';
    const subject = encodeURIComponent('Relatório de Bug - GRUPO BR277');
    const body = encodeURIComponent('Olá,\\n\\nEncontrei um bug no aplicativo. Seguem os detalhes:\\n\\n');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <TooltipProvider>
      {!isAuthPage && (
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

              <DropdownMenu onOpenChange={(open) => { if(!open && unreadCount > 0) handleMarkAsRead(); }}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12"
                            aria-label="Notificações"
                        >
                            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                                </span>
                            )}
                        </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Notificações {unreadCount > 0 ? `(${unreadCount})` : ''}</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notificationsLoading ? (
                        <DropdownMenuItem disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Carregando...
                        </DropdownMenuItem>
                    ) : notifications.length > 0 ? (
                        notifications.map(n => (
                            <DropdownMenuItem key={n.id} className={cn("flex items-start gap-2 h-auto whitespace-normal cursor-pointer", !n.read && "bg-primary/10")} onClick={() => handleNotificationClick(n)}>
                                <div className="mt-1">
                                    {n.type.includes('mention') ? <MessageCircle className="h-5 w-5 text-primary"/> : <BellRing className="h-5 w-5 text-yellow-500"/>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-semibold">{n.fromUserName}</span> mencionou você: <span className="text-muted-foreground italic">"{n.textSnippet}"</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {n.timestamp instanceof Timestamp ? formatDistanceToNow(n.timestamp.toDate(), { addSuffix: true, locale: ptBR })
                                          .replace('cerca de ', '')
                                          .replace(' minuto', ' min')
                                          .replace(' minutos', ' min')
                                          .replace(' hora', ' h')
                                          .replace(' horas', ' h')
                                          .replace(' dia', ' d')
                                          .replace(' dias', ' d')
                                          .replace('mês', 'm')
                                          .replace('meses', 'm')
                                          .replace(' ano', 'a')
                                          .replace(' anos', 'a')
                                      : 'agora'}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem disabled className="text-center justify-center">Nenhuma notificação</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>

              {currentUser ? (
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
                                {currentUser.displayName ? currentUser.displayName.substring(0,1).toUpperCase() : <User className="h-5 w-5 sm:h-6 smh-6 text-muted-foreground" />}
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
                    {isAdmin && (
                      <Link href="/admin/banners" passHref>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Administrativo</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuItem onClick={signOutUser} disabled={isAuthenticating}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 p-0 h-10 w-10 sm:h-12 sm:w-12" onClick={() => router.push('/login')}>
                          <User className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                      <p>Fazer Login</p>
                  </TooltipContent>
              </Tooltip>
              )}


              <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12">
                                <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6" />
                                <span className="sr-only">Opções</span>
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
                  {isAdmin && (
                      <>
                          <Link href="/admin/banners" passHref>
                              <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  <span>Administrativo</span>
                              </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                      </>
                  )}
                  <DropdownMenuItem onClick={handleSupportClick}>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Suporte</span>
                  </DropdownMenuItem>
                  <Link href="/politica-privacidade" passHref>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Política de Privacidade</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/termos-de-uso" passHref>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Termos de Uso</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReportBugClick}>
                    <Bug className="mr-2 h-4 w-4" />
                    <span>Relatar bugs</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </header>
      )}
      {currentUser && currentUser.emailVerified && !isAuthPage && (
          <>
              <Navigation />
              {isChatOpen && <ChatWindow onClose={closeChat} />}
          </>
      )}
    </TooltipProvider>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { currentUser, isAuthenticating, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && pathname !== '/';
        const isGuestRoute = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);
        const rootRedirect = pathname === '/';
        
        if (rootRedirect) {
            router.replace('/streaming');
            return;
        }

        if (!currentUser && isProtectedRoute) {
            router.replace(`/login?redirect=${pathname}`);
        } else if (currentUser) {
            if (!currentUser.emailVerified && !isGuestRoute && pathname !== '/verify-email') {
                router.replace('/verify-email');
            } else if (currentUser.emailVerified && isGuestRoute) {
                router.replace('/streaming');
            }
        }
    }, [currentUser, loading, pathname, router]);

    const showLoadingScreen = isAuthenticating || loading;
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-email'].includes(pathname);
    const isAuthenticated = !!currentUser && currentUser.emailVerified;

    if (showLoadingScreen) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // The main content and layout providers
    const mainContent = (
      <div className="flex flex-col min-h-screen">
          <main className={cn(
              "flex-grow container mx-auto px-2 py-8",
              !isAuthPage && "pb-20 sm:pb-8"
          )}>
              {children}
          </main>
      </div>
    );
    
    if (isAuthenticated && !isAuthPage) {
        return (
          <NotificationProvider>
            <ChatProvider>
              <HeaderAndNav isAuthPage={isAuthPage} />
              {mainContent}
            </ChatProvider>
          </NotificationProvider>
        );
    }

    // For unauthenticated users or auth pages
    return (
      <>
        <HeaderAndNav isAuthPage={isAuthPage} />
        {mainContent}
      </>
    );
}
