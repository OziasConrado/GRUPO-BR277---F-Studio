import type { ReactNode } from 'react';
import Navigation from './navigation';
import EmergencyButton from '@/components/common/emergency-button';
import { RotaSeguraLogo } from '@/components/common/rota-segura-logo';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Mock user data - replace with actual data fetching logic
  const user = {
    name: 'Usuário Teste',
    city: 'Cidade Exemplo',
    avatarUrl: 'https://placehold.co/40x40.png?text=UT',
    avatarFallback: 'UT',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full bg-primary text-primary-foreground shadow-lg">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <RotaSeguraLogo className="h-10 w-auto" />
            <span className="font-bold text-xl font-headline">Rota Segura</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile picture" />
              <AvatarFallback>{user.avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-xs text-primary-foreground/80 leading-tight">{user.city}</p>
            </div>
          </div>
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
