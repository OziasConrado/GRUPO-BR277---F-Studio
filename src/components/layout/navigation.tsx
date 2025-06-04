
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusSquare, Video, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppLayoutContextType } from './app-layout'; // Import a context type if available or define one
import { useAppLayout } from './app-layout'; // Assuming you'll create a context hook

const navItems = [
  { href: '/publicar', label: 'Publicar', icon: PlusSquare, action: 'navigate' }, // Placeholder href
  { href: '/streaming', label: 'AO VIVO', icon: Video, action: 'navigate' },
  { href: '#chat', label: 'Chat', icon: MessageCircle, action: 'openChat' }, // Action to open chat
];

export default function Navigation() {
  const pathname = usePathname();
  const { setIsChatOpen } = useAppLayout(); // Use context to control chat modal

  const handleItemClick = (action: string, href: string) => {
    if (action === 'openChat') {
      setIsChatOpen(true);
    }
    // Navigation will be handled by Link component for 'navigate' actions
  };

  return (
    <>
      {/* Navegação Mobile (rodapé) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="container mx-auto grid h-full grid-cols-3 items-stretch px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href && item.action === 'navigate';
            const isCentralButton = item.label === 'AO VIVO';

            const content = (
              <>
                <item.icon
                  className={cn(
                    'mb-0.5 h-6 w-6 transition-transform duration-200 ease-out',
                    isActive && item.action === 'navigate' ? 'scale-110' : 'group-hover:scale-105',
                    isCentralButton && 'h-7 w-7 text-destructive-foreground'
                  )}
                />
                <span className={cn(
                  "truncate text-xs",
                  isCentralButton ? "mt-1.5 font-semibold text-foreground" : "text-muted-foreground",
                  isActive && item.action === 'navigate' && !isCentralButton ? 'text-primary font-semibold' : '',
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
                  className="menu-item-central relative flex flex-col items-center justify-center -top-4"
                  onClick={() => handleItemClick(item.action, item.href)}
                  passHref
                >
                  <div className="live-icon-wrapper z-10">
                    <div className="live-icon bg-destructive w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative">
                      <div className="pulse-ring-animation"></div>
                      {content}
                    </div>
                  </div>
                </Link>
              );
            }
            
            const commonClasses = cn(
              'group flex h-full flex-col items-center justify-center text-center no-underline transition-colors duration-150 pt-1',
               isActive && item.action === 'navigate' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/80'
            );

            if (item.action === 'openChat') {
              return (
                 <button
                  key={item.href}
                  onClick={() => handleItemClick(item.action, item.href)}
                  className={commonClasses}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={commonClasses}
                passHref
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
