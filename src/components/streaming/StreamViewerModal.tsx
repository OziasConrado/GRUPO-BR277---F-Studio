
'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';
import type { StreamCardProps } from './stream-card';

interface StreamViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: StreamCardProps | null;
}

export default function StreamViewerModal({ isOpen, onClose, stream }: StreamViewerModalProps) {
  if (!isOpen || !stream) return null;

  const getAutoplayStreamUrlForModal = (originalUrl: string) => {
    try {
      const url = new URL(originalUrl);
      if (url.hostname.includes('rtsp.me')) {
        url.searchParams.set('autoplay', '1');
        return url.toString();
      }
      // For other types, rely on allow="autoplay" or provider's default behavior for now
    } catch (e) {
      // Invalid URL or other issue, return original
    }
    return originalUrl;
  };

  const streamUrlForModal = getAutoplayStreamUrlForModal(stream.streamUrl);

  const SponsorAdSpace = () => (
    <div className="shrink-0 h-[60px] bg-primary/20 flex items-center justify-center text-sm text-primary-foreground">
      Espaço do Patrocinador (Logo)
    </div>
  );

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
        <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-black/30 !z-[210]">
          <DialogTitle className="sr-only">
            Visualizador de Transmissão: {stream.title}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:h-6" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <SponsorAdSpace />

        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-md overflow-hidden">
            <iframe
              src={streamUrlForModal}
              title={stream.title}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
          </div>
        </div>

        <div className="shrink-0 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-primary-foreground/80 flex-shrink-0" />
                <h3 className="text-lg font-semibold">{stream.title}</h3>
            </div>
            <p className="text-sm text-primary-foreground/70 pl-7">
                {stream.description}
            </p>
        </div>


        <AdMobSpace />

      </DialogContent>
    </Dialog>
  );
}
