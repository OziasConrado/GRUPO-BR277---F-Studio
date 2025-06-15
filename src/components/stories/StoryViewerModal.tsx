
'use client';

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { StoryCircleProps } from './StoryCircle';
import Image from 'next/image';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: StoryCircleProps | null;
}

export default function StoryViewerModal({ isOpen, onClose, story }: StoryViewerModalProps) {
  if (!isOpen || !story) return null;

  const AdMobSpace = () => (
    <div className="shrink-0 h-[100px] bg-secondary/20 flex items-center justify-center text-sm text-secondary-foreground">
      Banner AdMob (320x50 ou similar)
    </div>
  );

  const actualContentUrl = story.storyType === 'video' && story.videoContentUrl ? story.videoContentUrl : story.avatarUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!fixed !inset-0 !z-[200] !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !bg-black/95 !p-0 flex flex-col !translate-x-0 !translate-y-0"
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="shrink-0 p-2 sm:p-3 flex flex-row justify-between items-center bg-black/30 !z-[210]">
           <DialogTitle className="sr-only">
            Visualizador de Story: {story.adminName}
          </DialogTitle>
           <div className="text-white text-sm font-medium truncate flex-grow pl-2">
             {story.adminName}
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full h-9 w-9 sm:h-10 sm:w-10 !z-[210] flex-shrink-0">
              <X className="h-5 w-5 sm:h-6 sm:h-6" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex-grow flex items-center justify-center p-1 sm:p-2 overflow-hidden">
          <div className="relative w-full h-full max-w-md max-h-full mx-auto">
            {story.storyType === 'video' && story.videoContentUrl ? (
              <video
                src={story.videoContentUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                data-ai-hint={story.dataAIAvatarHint || "user uploaded video"}
              />
            ) : (
              <Image
                src={story.avatarUrl} 
                alt={`Story de ${story.adminName}`}
                layout="fill"
                objectFit="contain"
                data-ai-hint={story.dataAIAvatarHint || "story content"}
              />
            )}
          </div>
        </div>

        <AdMobSpace />
      </DialogContent>
    </Dialog>
  );
}
