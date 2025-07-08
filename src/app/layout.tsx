
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/app-layout';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { AuthProvider } from '@/contexts/AuthContext';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className={`${ptSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            <ChatProvider>
              <AppLayout>{children}</AppLayout>
            </ChatProvider>
          </NotificationProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
