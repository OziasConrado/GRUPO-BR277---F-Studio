'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MapPin, Loader2 } from 'lucide-react';
import type { StreamCardProps } from './stream-card';
import { useEffect, useState } from 'react';
import { fetchSponsorForCameraServer } from '@/app/actions/firestore';
import Image from 'next/image';

interface StreamViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: StreamCardProps | null;
}

interface Sponsor {
  id: string;
  cameraId: string;
  sponsorImageUrl: string;
  linkDestino: string;
  isActive: boolean;
}

export default function StreamViewerModal({ isOpen, onClose, stream }: StreamViewerModalProps) {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loadingSponsor, setLoadingSponsor] = useState(true);

  useEffect(() => {
    if (isOpen && stream) {
      setLoadingSponsor(true);
      setSponsor(null);
      fetchSponsorForCameraServer(stream.id)
        .then(result => {
          if (result.success && result.data) {
            setSponsor(result.data);
          }
        })
        .finally(() => setLoadingSponsor(false));
    }
  }, [isOpen, stream]);

  if (!isOpen || !stream) return null;

  const getAutoplayStreamUrlForModal = (originalUrl: string) => {
    try {
      const url = new URL(originalUrl);
      if (url.hostname.includes('rtsp.me')) {
        url.searchParams.set('autoplay', '1');
        return url.toString();
      }
    } catch (e) {
      // Invalid URL or other issue, return original
    }
    return originalUrl;
  };

  const streamUrlForModal = getAutoplayStreamUrlForModal(stream.streamUrl);

  const SponsorAdSpace = () => (
    <div className="shrink-0 px-8 py-2 text-center">
      {loadingSponsor ? (
        <div className="h-[50px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : sponsor ? (
        <a href={sponsor.linkDestino} target="_blank" rel="noopener noreferrer" className="h-[50px] w-full flex items-center justify-center">
          <Image src={sponsor.sponsorImageUrl} alt={`Patrocinador da câmera ${stream.title}`} height={40} width={120} className="object-contain h-full w-auto" />
        </a>
      ) : (
        <div className="border border-dashed border-gray-600/30 rounded-lg py-2 px-8 inline-block mx-auto">
             <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-medium">Patrocínio</span>
        </div>
      )}
    </div>
  );

  const AdMobSpace = () => (
    <div className="shrink-0 flex justify-center mt-6">
      <div className="w-64 h-64 border border-dashed border-gray-600/30 rounded-xl flex items-center justify-center text-gray-500 text-sm">
        Publicidade Quadrada
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-neutral-950 !p-0 flex flex-col !translate-x-0 !translate-y-0"
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-end items-center bg-transparent absolute top-0 right-0 !z-[210]">
          <DialogTitle className="sr-only">
            Visualizador de Transmissão: {stream.title}
          </DialogTitle>
          <DialogDescription className="sr-only">Transmissão ao vivo de {stream.description}.</DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:h-6" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex-grow flex flex-col items-center justify-center p-1 sm:p-2 overflow-hidden gap-0">
            
            <div className="w-full max-w-4xl mx-auto px-4 mt-2">
                 <SponsorAdSpace />
            </div>

            {/* Bloco de Informações da Câmera (justaposto ao vídeo) */}
            <div className="w-full max-w-4xl mx-auto px-4 text-white mt-2">
                <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary-foreground/80 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-bold">{stream.title}</h3>
                        <p className="text-sm text-primary-foreground/70 -mt-1">
                            {stream.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Player de Vídeo */}
            <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-md overflow-hidden mt-2">
              <iframe
                src={streamUrlForModal}
                title={stream.title}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
              ></iframe>
            </div>

            <AdMobSpace />
        </div>

      </DialogContent>
    </Dialog>
  );
}
