
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';

export interface StoryCircleProps {
  id: string;
  adminName: string;
  avatarUrl: string; // Should be a URL to a rectangular image (e.g., 9:16 aspect ratio)
  dataAIAvatarHint?: string;
  hasNewStory: boolean;
  storyType: 'image' | 'video';
}

export default function StoryCircle({ adminName, avatarUrl, dataAIAvatarHint, hasNewStory, storyType }: StoryCircleProps) {
  return (
    <div className="group flex-shrink-0 cursor-pointer">
      <div
        className={cn(
          'rounded-lg transition-all duration-300 shadow-md',
          hasNewStory 
            ? 'p-1 bg-gradient-to-br from-story-blue via-story-green to-story-yellow' 
            : 'p-0.5 bg-muted/40 hover:bg-muted/60'
        )}
      >
        <div 
          className={cn(
            "relative w-[76px] h-[135px] bg-background rounded-[5px] overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-[1.03]",
          )}
        >
          <Image
            src={avatarUrl}
            alt={adminName}
            layout="fill"
            objectFit="cover"
            className="" // Removed rounded-md as parent handles rounding and overflow
            data-ai-hint={dataAIAvatarHint || 'admin story content'}
          />
          
          {/* Admin Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <p className="text-xs text-white font-semibold truncate drop-shadow-sm">{adminName}</p>
          </div>

          {/* Story Type Icon */}
          {storyType === 'video' && (
            <div className="absolute top-1.5 right-1.5 bg-black/40 p-0.5 rounded-full backdrop-blur-sm">
              <PlayCircle className="w-4 h-4 text-white/90" />
            </div>
          )}
          {/* Add specific icon for 'image' type if needed, e.g. when not new */}
          {storyType === 'image' && hasNewStory && ( // Example: Icon for new image story
             <div className="absolute top-1.5 right-1.5 bg-black/40 p-0.5 rounded-full backdrop-blur-sm">
                <ImageIcon className="w-4 h-4 text-white/90" />
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
