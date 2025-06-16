
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, Instagram, Youtube, MessageCircle, HelpCircle, ExternalLink, PlaySquare, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

// TikTok Icon SVG
const TikTokIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.57-.69-1.32-1.2-2.17-1.55-1.49-.58-3.16-.3-4.37.61-.38.28-.68.61-.92.99-.26.41-.39.87-.41 1.36-.02.47.05.93.18 1.37.17.58.47 1.1.87 1.51.41.42.9.72 1.42.91.55.21 1.12.33 1.71.35.6.02 1.17-.09 1.71-.29.96-.35 1.73-1.06 2.19-1.98.17-.33.3-.68.39-1.04.08-.37.11-.75.11-1.13C12.51 8.72 12.52 4.37 12.525.02z"/>
  </svg>
);

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);


export default function BioLinkPage() {
  const bioLinks = [
    { title: "Aplicativo Rota Segura", href: "https://play.google.com/store/apps/details?id=com.opaatec.rotasegura", Icon: PlaySquare, isExternal: true },
    { title: "Site Grupo BR 277", href: "https://grupobr277.com.br/", Icon: Globe, isExternal: true },
    { title: "Nossas Redes Sociais", href: "https://grupobr277.com.br/redes-sociais", Icon: ExternalLink, isExternal: true },
    { title: "Acompanhe o Trânsito Ao Vivo", href: "/streaming", Icon: PlaySquare, isExternal: false },
    { title: "Canais de Comunicação (SAU)", href: "/sau", Icon: HelpCircle, isExternal: false },
  ];

  const socialLinks = [
    { name: "Facebook", Icon: Facebook, href: "https://facebook.com/grupobr277", dataAiHint: "facebook logo" },
    { name: "Instagram", Icon: Instagram, href: "https://instagram.com/grupobr277", dataAiHint: "instagram logo" },
    { name: "YouTube", Icon: Youtube, href: "https://youtube.com/@grupobr277", dataAiHint: "youtube logo" },
    { name: "TikTok", Icon: TikTokIcon, href: "https://tiktok.com/@grupobr277", dataAiHint: "tiktok logo"},
    { name: "WhatsApp", Icon: MessageCircle, href: "https://wa.me/5541999999999", dataAiHint: "whatsapp logo"}, // Placeholder, atualize com seu número real
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-8 sm:pt-12 pb-20 px-4">
      <main className="w-full max-w-md mx-auto">
        <header className="flex flex-col items-center mb-8">
          <Avatar className="w-28 h-28 sm:w-32 sm:h-32 mb-4 border-4 border-primary/20 shadow-lg">
            <AvatarImage src="https://placehold.co/150x150.png" alt="Grupo BR 277 Logo" data-ai-hint="company brand logo"/>
            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">BR</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline text-primary">@grupobr277</h1>
          <p className="text-base text-muted-foreground mt-1 text-center">
            Acompanhe as novidades e dicas sobre o trânsito.
          </p>
        </header>

        <section className="space-y-3 mb-8">
          {bioLinks.map((link) => (
            <Button
              key={link.title}
              asChild
              variant="outline"
              className="w-full justify-start text-left py-7 rounded-xl shadow-sm border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-200 group focus-visible:ring-primary"
            >
              {link.isExternal ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                  <link.Icon className="h-6 w-6 mr-3 text-primary group-hover:text-primary/90 transition-colors" />
                  <span className="text-base font-medium text-foreground group-hover:text-primary/90 transition-colors flex-grow">{link.title}</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary/70 transition-colors flex-shrink-0" />
                </a>
              ) : (
                <Link href={link.href} className="flex items-center w-full">
                  <link.Icon className="h-6 w-6 mr-3 text-primary group-hover:text-primary/90 transition-colors" />
                  <span className="text-base font-medium text-foreground group-hover:text-primary/90 transition-colors flex-grow">{link.title}</span>
                </Link>
              )}
            </Button>
          ))}
        </section>

        <AdPlaceholder />

        <footer className="mt-10 mb-6">
          <p className="text-center text-sm text-muted-foreground mb-4">Siga-nos nas redes sociais:</p>
          <div className="flex justify-center space-x-5">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="text-muted-foreground hover:text-primary transition-colors transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
              >
                <social.Icon className="h-7 w-7 sm:h-8 sm:w-8" data-ai-hint={social.dataAiHint}/>
              </a>
            ))}
          </div>
        </footer>
         <p className="text-center text-xs text-muted-foreground/70 mt-8">
            Grupo BR 277 &copy; {new Date().getFullYear()}
          </p>
      </main>
    </div>
  );
}
      