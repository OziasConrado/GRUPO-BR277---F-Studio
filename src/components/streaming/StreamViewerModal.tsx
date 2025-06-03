
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
      <DialogContent 
        className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/95 !p-0 flex flex-col"
        onInteractOutside={(e) => {
          e.preventDefault(); // Prevents closing on clicking outside the visible modal area
        }}
        onEscapeKeyDown={onClose} // Ensure escape key still closes
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="sr-only">Visualizador de Transmissão: {stream.title}</DialogTitle>
        </DialogHeader>
        
        <div className="absolute top-4 right-4 z-10"> {/* Ensure close button is on top */}
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>
        
        {/* Conteúdo simplificado para diagnóstico */}
        <div className="flex-grow flex items-center justify-center text-white text-xl p-4">
          <p>Conteúdo do Modal Stream: {stream.title}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
