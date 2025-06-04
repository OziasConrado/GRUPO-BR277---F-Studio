
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Video, AlertTriangle, Headset } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/streaming', label: 'AO VIVO', icon: Video },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/sau', label: 'SAU', icon: Headset },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Navegação Mobile (rodapé) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="container mx-auto grid h-full grid-cols-5 items-stretch px-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const isCentralButton = index === 2 && item.label === 'AO VIVO';

            const itemContent = (
              <>
                <item.icon
                  className={cn(
                    'mb-0.5 h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-105',
                    isActive ? 'scale-110' : '',
                    isCentralButton && 'h-7 w-7 text-destructive-foreground'
                  )}
                />
                <span className={cn(
                  "truncate text-[10px] leading-tight",
                  isCentralButton ? "mt-1 font-semibold text-destructive-foreground" : "text-muted-foreground",
                  isActive && !isCentralButton ? 'text-primary font-semibold' : '',
                  !isCentralButton && !isActive && 'group-hover:text-primary/80'
                )}>
                  {item.label}
                </span>
              </>
            );

            if (isCentralButton) {
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="menu-item-central relative flex flex-col items-center justify-center -top-3"
                  passHref
                >
                  <div className="live-icon-wrapper z-10">
                    <div className="live-icon bg-destructive w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative">
                      <div className="pulse-ring-animation"></div>
                      {itemContent}
                    </div>
                  </div>
                </Link>
              );
            }
            
            const commonClasses = cn(
              'group relative flex h-full flex-col items-center justify-center text-center no-underline transition-colors duration-150 pt-1 pb-0.5',
               isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/80'
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={commonClasses}
                passHref
              >
                {itemContent}
                {item.label === 'Alertas' && (
                  <span className="absolute top-1 right-1.5 sm:right-2.5 bg-destructive text-destructive-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none">
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
