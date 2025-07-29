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

export const metadata: Metadata = {
  title: 'GRUPO BR277',
  description: 'Aplicativo para caminhoneiros e viajantes.',
  icons: {
    icon: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2F512-512-app-web.png?alt=media',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
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
