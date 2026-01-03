
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticating, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticating && !isAdmin) {
      router.replace('/'); 
    }
  }, [isAuthenticating, isAdmin, router]);

  if (isAuthenticating || !isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  return <>{children}</>;
}
