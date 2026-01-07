
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
    <div className="shrink-0 h-[60px] bg-card flex items-center justify-center text-sm text-primary-foreground p-2">
      {loadingSponsor ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : sponsor ? (
        <a href={sponsor.linkDestino} target="_blank" rel="noopener noreferrer" className="h-full">
          <Image src={sponsor.sponsorImageUrl} alt={`Patrocinador da câmera ${stream.title}`} height={40} width={120} className="object-contain h-full w-auto" />
        </a>
      ) : (
        <div className="w-full h-full rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Patrocinador</span>
        </div>
      )}
    </div>
  );

  const AdMobSpace = () => (
    <div className="shrink-0 flex items-center justify-center p-4 bg-background">
      <div className={cn("h-64 w-64 p-4 rounded-xl bg-muted/30 border border-dashed flex items-center justify-center")}>
        <p className="text-muted-foreground text-sm">Publicidade Quadrada</p>
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

        <div className="shrink-0 px-4 pt-2 text-white">
            <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-primary-foreground/80 flex-shrink-0" />
                <h3 className="text-lg font-semibold">{stream.title}</h3>
            </div>
            <p className="text-sm text-primary-foreground/70 pl-7">
                {stream.description}
            </p>
        </div>

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

        <AdMobSpace />

      </DialogContent>
    </Dialog>
  );
}
