
'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { StreamCardProps } from './stream-card';

interface StreamViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: StreamCardProps | null;
}

export default function StreamViewerModal({ isOpen, onClose, stream }: StreamViewerModalProps) {
  if (!isOpen || !stream) return null;

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
            Visualizador de Transmissão: {stream.title}
          </DialogTitle>
          {/* Placeholder para informações do stream, se necessário */}
          <div className="text-white text-sm font-medium truncate flex-grow pl-2">
             {stream.title}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Espaço do Patrocinador (simulado) */}
        {/* <SponsorAdSpace /> */}
        
        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          {/* Conteúdo simplificado para diagnóstico */}
          <p className="text-white text-lg">Conteúdo do Modal Stream: {stream.title}</p>
          {/* <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-md overflow-hidden">
            <iframe
              src={stream.streamUrl}
              title={stream.title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
          </div> */}
        </div>

        {/* Banner AdMob (simulado) */}
        {/* <AdMobSpace /> */}

      </DialogContent>
    </Dialog>
  );
}
