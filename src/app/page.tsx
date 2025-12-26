'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This is a client-side redirect. The primary redirect should be in next.config.js
    // but this serves as a fallback.
    router.replace('/streaming');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
