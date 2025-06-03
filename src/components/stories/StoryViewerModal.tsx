
'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { StoryCircleProps } from './StoryCircle';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryCircleProps | null;
}

export default function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  if (!isOpen || !story) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!fixed !inset-0 !z-[200] !bg-black/95 !p-4 !max-w-none !max-h-none !w-screen !h-screen !rounded-none !border-none flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Visualizador de Story: {story.adminName}</DialogTitle>
        </DialogHeader>

        <div className="absolute top-4 right-4 z-10"> {/* Ajustado para p-4 do DialogContent */}
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>
        
        {/* Conteúdo simplificado para diagnóstico */}
        <div className="flex-grow flex items-center justify-center text-white text-xl">
          <p>Conteúdo do Modal Story: {story.adminName}</p>
          {/* Você pode adicionar a imagem aqui se quiser testar com ela, mas sem o layout complexo */}
          {/* Exemplo:
          <div className="relative w-full max-w-md h-auto aspect-[9/16] mt-4">
            <Image
              src={story.avatarUrl}
              alt={`Story by ${story.adminName}`}
              layout="fill"
              objectFit="contain"
              data-ai-hint={story.dataAIAvatarHint || 'story content large view'}
              className="rounded-md"
            />
          </div>
          */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
