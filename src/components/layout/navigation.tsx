
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Youtube, Wrench, Headset, AlertTriangle, Video } from 'lucide-react'; // Mantive Video caso seja usado, mas o central será diferente
import { cn } from '@/lib/utils';
import { RotaSeguraLogo } from '@/components/common/rota-segura-logo'; // Assumindo que esta era a logo usada no topo

// Itens de navegação como estavam antes da última grande mudança no rodapé
// Se o item central era diferente, precisaremos ajustar
const navItems = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/streaming', label: 'Ao Vivo', icon: Youtube }, // Ou Video, dependendo do que era antes
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/sau', label: 'SAU', icon: Headset },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Navegação Desktop (oculta em mobile) - Simples, pode ser expandida depois */}
      <nav className="hidden sm:flex sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-md items-center justify-between p-4">
        <div>
          <RotaSeguraLogo height={30} width={120}/>
        </div>
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/80 transition-colors',
                pathname === item.href ? 'bg-primary/90' : 'text-primary-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Navegação Mobile (rodapé) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.1)] sm:hidden">
        <div className="container mx-auto grid h-full max-w-lg grid-cols-5 items-center px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex h-full flex-col items-center justify-center text-center text-xs no-underline transition-colors duration-150',
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
