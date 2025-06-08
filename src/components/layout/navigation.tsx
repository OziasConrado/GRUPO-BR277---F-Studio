
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Video, AlertTriangle, MessageSquare } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext'; 

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/streaming', label: 'AO VIVO', icon: Video },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/chat', label: 'Chat', icon: MessageSquare }, 
];

export default function Navigation() {
  const pathname = usePathname();
  const { openChat, setIsChatOpen } = useChat(); 

  const handleNavItemClick = (e: React.MouseEvent, href: string) => {
    if (href === '/chat') {
      e.preventDefault(); 
      setIsChatOpen(true);   
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="container mx-auto grid h-full grid-cols-5 items-stretch px-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href && item.href !== '/chat'; 
            const isChatButton = item.href === '/chat';
            const isCentralButton = index === 2 && item.label === 'AO VIVO';

            const itemContent = (
              <>
                <item.icon
                  className={cn(
                    'mb-0.5 h-6 w-6 transition-transform duration-200 ease-out group-hover:scale-105', // Aumentado para h-6 w-6
                    isActive && !isCentralButton ? 'scale-110 text-primary' : '',
                    isActive && isCentralButton ? 'scale-110' : '',
                    isCentralButton && 'text-destructive-foreground mb-0.5',
                    isChatButton && 'text-primary' 
                  )}
                />
                <span className={cn(
                  "truncate text-[10px] leading-tight",
                  isCentralButton ? "font-semibold text-destructive-foreground" : "text-muted-foreground",
                  isActive && !isCentralButton ? 'text-primary font-semibold' : '',
                  !isCentralButton && !isActive && 'group-hover:text-primary/80',
                   isChatButton ? 'text-primary font-semibold' : '' 
                )}>
                  {item.label}
                </span>
              </>
            );
            
            const commonClasses = cn(
              'group relative flex h-full flex-col items-center justify-center text-center no-underline transition-colors duration-150 pt-1 pb-0.5',
               isActive && !isCentralButton ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/80',
               isChatButton ? 'text-primary font-semibold' : '', 
               isActive && isCentralButton ? '' : '' 
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
                  <div className="live-icon-wrapper"> {/* Removido z-10 */}
                    <div className={cn(
                      "live-icon bg-destructive w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg relative",
                      isActive ? "ring-2 ring-offset-2 ring-destructive ring-offset-background" : ""
                    )}>
                      <div className="pulse-ring-animation"></div>
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
                {item.label === 'Alertas' && (
                  <span className="absolute top-1.5 right-[calc(50%-1.25rem)] transform translate-x-full -translate-y-1/4 text-[0.6rem] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 leading-none pointer-events-none shadow-md">
                    +2
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
