
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';

export interface StoryCircleProps {
  id: string;
  adminName: string;
  avatarUrl: string;
  dataAIAvatarHint?: string;
  hasNewStory: boolean;
  storyType: 'image' | 'video';
}

export default function StoryCircle({ adminName, avatarUrl, dataAIAvatarHint, hasNewStory, storyType }: StoryCircleProps) {
  return (
    <div className="flex flex-col items-center space-y-1 flex-shrink-0 w-20 cursor-pointer group">
      <div
        className={cn(
          'relative rounded-full p-0.5 transition-all duration-300',
          hasNewStory ? 'bg-gradient-to-tr from-yellow-400 to-pink-500' : 'bg-muted/50',
          'group-hover:scale-105'
        )}
      >
        <div className="relative w-16 h-16 rounded-full bg-background p-0.5">
          <Image
            src={avatarUrl}
            alt={adminName}
            width={60}
            height={60}
            className="rounded-full object-cover"
            data-ai-hint={dataAIAvatarHint || 'admin profile'}
          />
          {storyType === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
              <PlayCircle className="w-6 h-6 text-white/90" />
            </div>
          )}
           {storyType === 'image' && !hasNewStory && (
             <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
                <ImageIcon className="w-3 h-3" />
             </div>
           )}
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground truncate w-full group-hover:text-primary">{adminName}</p>
    </div>
  );
}
