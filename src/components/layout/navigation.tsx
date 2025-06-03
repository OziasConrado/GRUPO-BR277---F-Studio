
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Youtube, Wrench, Headset, MapPin } from 'lucide-react'; 
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/streaming', label: 'Ao Vivo', icon: Youtube, isCentral: true },
  { href: '/sau', label: 'SAU', icon: Headset },
  { href: '/ferramentas/mapa', label: 'Mapa', icon: MapPin },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t glassmorphic sm:hidden">
      <div className="container mx-auto flex justify-around items-center h-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.isCentral) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 ease-in-out transform -translate-y-4 shadow-xl hover:shadow-2xl',
                  isActive 
                    ? 'bg-accent text-accent-foreground animate-pulse scale-110' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse'
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
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors h-16',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-6 w-6 mb-0.5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
