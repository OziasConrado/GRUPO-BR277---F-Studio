
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Youtube, Wrench, Headset, AlertTriangle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmergencyButton from '@/components/common/emergency-button'; // Importar EmergencyButton

const navItems = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/streaming', label: 'Ao Vivo', icon: Video }, // Ícone central "AO VIVO"
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/sau', label: 'SAU', icon: Headset },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Navegação Desktop (oculta em mobile) - Removida conforme novas diretrizes do header global */}
      {/* <nav className="hidden sm:flex sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md items-center justify-between p-4">
        ... (código anterior do header desktop)
      </nav> */}

      {/* Navegação Mobile (rodapé) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="container mx-auto grid h-full grid-cols-5 items-center px-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const isCentralButton = item.href === '/streaming'; // Identifica o botão "AO VIVO"

            if (isCentralButton) {
              return (
                <div key={item.href} className="menu-item-central relative flex flex-col items-center justify-center -top-5">
                  <Link href={item.href} className="live-icon-wrapper z-10">
                    <div className="live-icon bg-destructive w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative">
                      <div className="pulse-ring-animation"></div>
                      <item.icon className={cn('h-6 w-6 text-destructive-foreground')} />
                    </div>
                  </Link>
                  <span className="mt-1.5 text-xs font-semibold text-center text-foreground">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex h-full flex-col items-center justify-center text-center text-xs no-underline transition-colors duration-150 pt-1',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/80'
                )}
              >
                <item.icon
                  className={cn(
                    'mb-0.5 h-5 w-5 transition-transform duration-200 ease-out',
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
