'use client';

import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Script from 'next/script';
import AppLayout from '@/components/layout/app-layout';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

// Metadata now needs to be exported from a server component, so we can't define it here anymore.
// We'll move it to a new server-side RootLayout or assume it's handled elsewhere.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Metadata should be defined in a server component layout, but for now we keep the title etc. */}
        <title>GRUPO BR277</title>
        <meta name="description" content="Aplicativo para caminhoneiros e viajantes." />
        <link rel="icon" href="https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2F512-512-app-web.png?alt=media" />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-SEU_PUBLISHER_ID_AQUI`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
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
