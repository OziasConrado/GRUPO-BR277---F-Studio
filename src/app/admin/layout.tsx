
'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Shield, LayoutDashboard, MessageSquareWarning, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace('/');
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/banners', label: 'Gestão de Banners', icon: LayoutDashboard },
    { href: '/admin/patrocinadores', label: 'Patrocinadores', icon: Handshake },
    { href: '/admin/feedbacks', label: 'Gestão de Feedbacks', icon: MessageSquareWarning },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-headline">Painel Administrativo</h1>
          <p className="text-muted-foreground text-sm">Gerencie o conteúdo do aplicativo.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        <aside>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Button
                        key={item.href}
                        asChild
                        variant={isActive ? 'default' : 'ghost'}
                        className="justify-start"
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
