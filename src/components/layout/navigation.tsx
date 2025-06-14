
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Video, Store, MessageSquare, ShieldAlert, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/guia-comercial', label: 'Comercial', icon: Store },
  { href: '/streaming', label: 'AO VIVO', icon: Video },
  { href: '/alertas', label: 'Alertas', icon: ShieldAlert },
  { href: '/mais', label: 'Mais', icon: PlusCircle }, // Alterado de Chat para Mais
];

export default function Navigation() {
  const pathname = usePathname();
  const { setIsChatOpen } = useChat(); // setIsChatOpen ainda pode ser útil se o botão "Mais" abrir um menu com chat

  const handleNavItemClick = (e: React.MouseEvent, href: string) => {
    // A lógica de abrir o chat diretamente foi removida daqui.
    // Se o botão "Mais" tiver uma ação especial no futuro, ela pode ser adicionada aqui.
    // Por enquanto, ele se comportará como um link normal.
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="container mx-auto grid h-full grid-cols-5 items-stretch px-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href; // Simplificado, não mais trata /chat especialmente aqui
            const isCentralButton = index === 2 && item.label === 'AO VIVO';

            const itemContent = (
              <>
                <item.icon
                  className={cn(
                    'mb-0.5 h-6 w-6 transition-transform duration-200 ease-out group-hover:scale-105',
                    isActive && !isCentralButton ? 'scale-110 text-primary' : '',
                    isActive && isCentralButton ? 'scale-110' : '',
                    isCentralButton && 'text-destructive-foreground mb-0.5'
                  )}
                />
                <span className={cn(
                  "truncate text-[10px] leading-tight",
                  isCentralButton ? "font-semibold text-destructive-foreground" : "text-muted-foreground",
                  isActive && !isCentralButton ? 'text-primary font-semibold' : '',
                  !isCentralButton && !isActive && 'group-hover:text-primary/80'
                )}>
                  {item.label}
                </span>
              </>
            );

            const commonClasses = cn(
              'group relative flex h-full flex-col items-center justify-center text-center no-underline transition-colors duration-150 pt-1 pb-0.5',
               isActive && !isCentralButton ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/80'
            );

            if (isCentralButton) {
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="menu-item-central relative flex flex-col items-center justify-center -top-3"
                  passHref
                  onClick={(e) => handleNavItemClick(e, item.href)}
                >
                  <div className="live-icon-wrapper">
                    <div className={cn(
                      "live-icon bg-destructive w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg relative",
                      isActive ? "ring-2 ring-offset-2 ring-destructive ring-offset-background" : ""
                    )}>
                      <div className="pulse-ring-animation"></div> {/* Pulse animation div */}
                      {itemContent}
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={commonClasses}
                passHref
                onClick={(e) => handleNavItemClick(e, item.href)}
              >
                {itemContent}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
