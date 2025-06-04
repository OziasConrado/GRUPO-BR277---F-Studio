
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Youtube, Wrench, Headset, AlertTriangle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/streaming', label: 'AO VIVO', icon: Video, isCentral: true },
  { href: '/alertas', label: 'Alertas', icon: AlertTriangle },
  { href: '/sau', label: 'SAU', icon: Headset },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] bg-white shadow-[0_-1px_10px_rgba(0,0,0,0.05)] sm:hidden">
      <div className="container mx-auto flex h-full justify-around items-center px-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isCentral) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'menu-item-central relative -translate-y-5 flex flex-col items-center justify-center text-center no-underline',
                  isActive ? 'active' : ''
                )}
              >
                <div className="live-icon-wrapper">
                  <span className="pulse-ring-animation"></span>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <span className="mt-1 text-[11px] font-bold text-black">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center text-center text-[11px] no-underline transition-opacity hover:opacity-100',
                isActive ? 'text-primary opacity-100' : 'text-gray-700 opacity-80'
              )}
            >
              <item.icon className="mb-0.5 h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
