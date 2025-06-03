
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !z-[200] !bg-black/95 !p-4 !max-w-none !max-h-none !w-screen !h-screen !rounded-none !border-none flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Visualizador de Transmissão: {stream.title}</DialogTitle>
        </DialogHeader>
        
        <div className="absolute top-4 right-4 z-20"> {/* Ajustado para p-4 do DialogContent */}
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>

        {/* Conteúdo simplificado para diagnóstico */}
        <div className="flex-grow flex items-center justify-center text-white text-xl">
          <p>Conteúdo do Modal Stream: {stream.title}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
