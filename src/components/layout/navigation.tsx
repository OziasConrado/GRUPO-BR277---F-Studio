
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Youtube, Wrench, Headset, AlertTriangle, MapPinned } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/streaming', label: 'Ao Vivo', icon: Youtube },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle }, // Novo item de Alertas
  { href: '/sau', label: 'SAU', icon: Headset },
];

export default function Navigation() {
  const pathname = usePathname();

  // Determinar se há um item central (se o número de itens for ímpar)
  const hasCentralItem = navItems.length % 2 !== 0;
  const centralIndex = hasCentralItem ? Math.floor(navItems.length / 2) : -1;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t glassmorphic sm:hidden">
      <div className="container mx-auto flex justify-around items-center h-20">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          const isCentral = index === centralIndex && item.href === '/streaming'; // Destacar apenas se for streaming

          if (isCentral) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 ease-in-out transform -translate-y-4 shadow-xl hover:shadow-2xl',
                  isActive 
                    ? 'bg-accent text-accent-foreground scale-110 animate-pulse' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
                style={{animationIterationCount: isActive ? 'infinite' : '1', animationDuration: isActive ? '1.5s' : '0.5s'}}
              >
                <item.icon className="h-7 w-7" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors h-16 w-[19%]', // Ajustar largura para 5 itens
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6 mb-0.5" />
              <span className="text-[0.6rem] text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
