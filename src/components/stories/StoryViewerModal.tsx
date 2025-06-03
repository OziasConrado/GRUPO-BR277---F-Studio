
'use client';

import Image from 'next/image';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, PlayCircle } from 'lucide-react';
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
      <DialogContent className="!fixed !inset-0 !z-[200] !flex !flex-col !bg-black/95 !p-0 !max-w-none !max-h-none !w-screen !h-screen !rounded-none !border-none">
        <div className="absolute top-2 right-2 z-10">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-10 w-10">
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>
        
        <div className="flex-grow w-full flex items-center justify-center overflow-hidden p-4">
          <div className="relative w-full h-full max-w-md max-h-full"> 
            <Image
              src={story.avatarUrl} 
              alt={`Story by ${story.adminName}`}
              layout="fill"
              objectFit="contain"
              data-ai-hint={story.dataAIAvatarHint || 'story content large view'}
              className="rounded-md"
            />
            {story.storyType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <PlayCircle className="w-20 h-20 text-white/80" />
                </div>
            )}
          </div>
        </div>

        <div className="w-full h-[100px] bg-neutral-800/80 flex flex-col items-center justify-center text-white text-xs shrink-0 border-t border-neutral-700">
          <p className="mb-1 text-muted-foreground">Publicidade</p>
          <div 
            className="w-[320px] h-[50px] bg-neutral-500 flex items-center justify-center text-neutral-300 rounded"
            data-ai-hint="advertisement banner"
          >
            Bloco de Anúncio (320x50)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
