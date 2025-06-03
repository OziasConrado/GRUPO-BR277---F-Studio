
'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { StoryCircleProps } from './StoryCircle';
// import Image from 'next/image'; // Será necessário quando re-adicionar o conteúdo

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryCircleProps | null;
}

export default function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  if (!isOpen || !story) return null;

  // Placeholder para a área de publicidade superior (patrocinador)
  const SponsorAdSpace = () => (
    <div className="shrink-0 h-[60px] bg-primary/20 flex items-center justify-center text-sm text-primary-foreground">
      Espaço do Patrocinador (Logo)
    </div>
  );

  // Placeholder para a área de publicidade inferior (AdMob)
  const AdMobSpace = () => (
    <div className="shrink-0 h-[100px] bg-secondary/20 flex items-center justify-center text-sm text-secondary-foreground">
      Banner AdMob (320x50 ou similar)
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/95 !p-0 flex flex-col !translate-x-0 !translate-y-0"
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-between items-center bg-black/30">
          <DialogTitle className="sr-only">
            Visualizador de Story: {story.adminName}
          </DialogTitle>
           {/* Placeholder para informações do story, se necessário */}
           <div className="text-white text-sm font-medium truncate flex-grow pl-2">
             {story.adminName}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:h-6" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        {/* Espaço do Patrocinador (simulado) */}
        {/* <SponsorAdSpace /> */}

        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          {/* Conteúdo simplificado para diagnóstico */}
          <p className="text-white text-lg">Conteúdo do Modal Story: {story.adminName}</p>
          {/* Conteúdo do Story (Imagem/Vídeo) iria aqui
          <div className="relative w-full h-full max-w-md max-h-full mx-auto">
            <Image
              src={story.avatarUrl} // Usar a URL do story real aqui
              alt={`Story de ${story.adminName}`}
              layout="fill"
              objectFit="contain" // ou "cover" dependendo do design
              data-ai-hint={story.dataAIAvatarHint || "story content"}
            />
          </div>
          */}
        </div>

         {/* Banner AdMob (simulado) */}
        {/* <AdMobSpace /> */}

      </DialogContent>
    </Dialog>
  );
}
