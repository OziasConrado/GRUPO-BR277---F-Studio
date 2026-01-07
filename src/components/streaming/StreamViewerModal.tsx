
'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MapPin, Loader2 } from 'lucide-react';
import type { StreamCardProps } from './stream-card';
import { useEffect, useState } from 'react';
import { fetchSponsorForCameraServer } from '@/app/actions/firestore';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
    <div className="shrink-0 px-8 py-2">
      {loadingSponsor ? (
        <div className="h-[50px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : sponsor ? (
        <a href={sponsor.linkDestino} target="_blank" rel="noopener noreferrer" className="h-[50px] w-full flex items-center justify-center">
          <Image src={sponsor.sponsorImageUrl} alt={`Patrocinador da câmera ${stream.title}`} height={40} width={120} className="object-contain h-full w-auto" />
        </a>
      ) : (
        <div className="h-[50px] w-full rounded-xl border border-dashed border-gray-500/30 flex items-center justify-center opacity-60">
            <span className="text-[10px] text-white/50 tracking-widest uppercase">Patrocínio</span>
        </div>
      )}
    </div>
  );

  const AdMobSpace = () => (
    <div className="shrink-0 flex items-center justify-center p-4">
      <div className={cn("max-w-[250px] w-full aspect-square p-4 rounded-xl bg-white/5 border border-dashed border-gray-500/30 flex items-center justify-center")}>
        <p className="text-white/50 text-sm">Publicidade Quadrada</p>
      </div>
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
          <DialogDescription className="sr-only">Transmissão ao vivo de {stream.description}.</DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:h-6" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <SponsorAdSpace />

        <div className="flex-grow flex flex-col items-center justify-center p-1 sm:p-2 overflow-hidden">
            {/* Bloco de Informações da Câmera */}
            <div className="w-full max-w-4xl mx-auto px-4 pb-2 text-white mt-2">
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

        <AdMobSpace />

      </DialogContent>
    </Dialog>
  );
}
