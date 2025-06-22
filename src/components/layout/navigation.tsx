
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, Store, Wrench, Map, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import MoreFeaturesSheet from '../MoreFeaturesSheet';

const navItems = [
  { href: '/', label: 'Feed277', icon: Newspaper },
  { href: '/guia-comercial', label: 'Comercial', icon: Store },
  { href: '#', label: 'Mais', icon: Grid },
  { href: '/ferramentas', label: 'Ferramentas', icon: Wrench },
  { href: '/turismo', label: 'Turismo', icon: Map },
];

export default function Navigation() {
  const pathname = usePathname();

  const handleNavItemClick = (e: React.MouseEvent, href: string) => {
    // Logic for special handling can be added here if needed in the future
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[65px] border-t bg-background/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] sm:hidden">
        <div className="container mx-auto grid h-full grid-cols-5 items-stretch px-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const isCentralButton = index === 2;

            const itemContent = (
              <>
                <item.icon
                  className={cn(
                    'mb-0.5 h-6 w-6 transition-transform duration-200 ease-out group-hover:scale-105',
                    isActive && !isCentralButton ? 'scale-110 text-primary' : '',
                    isActive && isCentralButton ? 'scale-110' : '',
                     isCentralButton ? 'text-primary-foreground mb-0.5' : ''
                  )}
                />
                <span className={cn(
                  "truncate text-[10px] leading-tight",
                  isCentralButton ? "font-semibold text-primary-foreground" : "text-muted-foreground",
                  isActive && !isCentralButton ? 'text-primary font-semibold' : '',
                  !isCentralButton && !isActive && 'group-hover:text-primary/80'
                )}>
                  {item.label}
                </span>
              </>
            );
            
            const commonItemContainerClasses = cn(
              'group relative flex h-full flex-col items-center justify-center text-center no-underline transition-colors duration-150 pt-1 pb-0.5'
            );
            
            const activeSpecificClasses = isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary/80';

            if (isCentralButton) {
              return (
                <MoreFeaturesSheet key={item.href}>
                  <div className="menu-item-central relative flex flex-col items-center justify-center -top-3 cursor-pointer">
                    <div className="live-icon-wrapper">
                      <div className={cn(
                        "live-icon bg-primary w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg relative"
                      )}>
                        {itemContent}
                      </div>
                    </div>
                  </div>
                </MoreFeaturesSheet>
              );
            } else {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(commonItemContainerClasses, activeSpecificClasses)}
                  onClick={(e) => handleNavItemClick(e, item.href)}
                >
                  {itemContent}
                </Link>
              );
            }
          })}
        </div>
      </nav>
    </>
  );
}
