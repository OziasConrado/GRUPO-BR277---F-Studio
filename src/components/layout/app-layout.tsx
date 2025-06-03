import type { ReactNode } from 'react';
import Navigation from './navigation';
import EmergencyButton from '@/components/common/emergency-button';
import { RotaSeguraLogo } from '@/components/common/rota-segura-logo';
import Link from 'next/link';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <RotaSeguraLogo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg font-headline">Rota Segura</span>
          </Link>
          {/* Desktop Navigation could go here if needed */}
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 pb-24 sm:pb-8">
        {children}
      </main>
      <EmergencyButton />
      <Navigation />
    </div>
  );
}
