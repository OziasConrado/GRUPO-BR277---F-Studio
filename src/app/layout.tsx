
import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/contexts/NotificationContext';

export const metadata: Metadata = {
  title: 'Rota Segura',
  description: 'Aplicativo para caminhoneiros e viajantes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PT Sans font import removed */}
      </head>
      <body className="antialiased bg-background text-foreground"> {/* font-body class removed, Arial will be default */}
        <NotificationProvider>
          <AppLayout>{children}</AppLayout>
        </NotificationProvider>
        <Toaster />
      </body>
    </html>
  );
}

