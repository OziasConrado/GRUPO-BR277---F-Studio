
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
  onClick?: () => void;
}

export default function StoryCircle({ adminName, avatarUrl, dataAIAvatarHint, hasNewStory, storyType, onClick }: StoryCircleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex-shrink-0 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'transform-gpu transition-transform group-hover:scale-[1.03]'
      )}
      aria-label={`Ver story de ${adminName}`}
    >
      <div
        className={cn(
          "relative w-[76px] h-[135px] bg-card rounded-md overflow-hidden"
        )}
      >
        <Image
          src={avatarUrl}
          alt={adminName}
          layout="fill"
          objectFit="cover"
          className="rounded-sm"
          data-ai-hint={dataAIAvatarHint || 'admin story content'}
        />

        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <p className="text-xs text-white font-semibold truncate drop-shadow-sm">{adminName}</p>
        </div>

        {/* PlayCircle icon removed for storyType === 'video' */}
        
        {storyType === 'image' && hasNewStory && (
           <div className="absolute top-1.5 right-1.5 bg-black/40 p-0.5 rounded-full backdrop-blur-sm">
              <ImageIcon className="w-4 h-4 text-white/90" />
           </div>
         )}
      </div>
    </button>
  );
}
