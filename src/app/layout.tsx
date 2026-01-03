
import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import '@/app/globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { Providers } from './providers'; // Import the new Providers component

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

// Metadata can be defined here as it's a Server Component
export const metadata: Metadata = {
    title: 'GRUPO BR277',
    description: 'O aplicativo essencial para quem vive na estrada.',
    icons: {
        icon: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2F192-192-app-web.png?alt=media',
        apple: 'https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2F192-192-app-web.png?alt=media',
    },
};

export const viewport: Viewport = {
  themeColor: '#002776',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3646331718909935`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${ptSans.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
