
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';

export interface StoryCircleProps {
  id: string;
  adminName: string;
  avatarUrl: string; // Should always be an image URL (placeholder or actual thumbnail)
  dataAIAvatarHint?: string;
  hasNewStory: boolean;
  storyType: 'image' | 'video';
  videoContentUrl?: string; // Optional: URL or Data URI for the actual video content
  onClick?: () => void;
}

export default function StoryCircle({ adminName, avatarUrl, dataAIAvatarHint, hasNewStory, storyType, onClick }: StoryCircleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex-shrink-0 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'transform-gpu transition-transform group-hover:scale-[1.03]',
        'w-24 h-[160px]' 
      )}
      aria-label={`Ver story de ${adminName}`}
    >
      <div
        className={cn(
          "relative w-full h-full bg-card rounded-md overflow-hidden"
        )}
      >
        <Image
          src={avatarUrl}
          alt={adminName}
          layout="fill"
          objectFit="cover"
          className="rounded-sm"
          data-ai-hint={dataAIAvatarHint || (storyType === 'video' ? 'video story content' : 'image story content')}
        />

        {/* Overlay Icon for Video Type */}
        {storyType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle className="w-8 h-8 text-white/80 drop-shadow-lg" />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <p className="text-xs text-white font-semibold drop-shadow-sm line-clamp-2">{adminName}</p>
        </div>
        
        {storyType === 'image' && hasNewStory && (
           <div className="absolute top-1.5 right-1.5 bg-black/40 p-0.5 rounded-full backdrop-blur-sm">
              <ImageIcon className="w-4 h-4 text-white/90" />
           </div>
         )}
      </div>
    </button>
  );
}
