

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlayCircle, UserCircle } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// 1. Tipo para os DADOS vindos do Firestore
export interface StoryData {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  timestamp: string; // ISO String
  description?: string;
  thumbnailUrl: string; // The main image/video thumbnail
  dataAIThumbnailHint?: string;
  storyType: 'image' | 'video';
  videoContentUrl?: string;
}

// 2. Tipo para as PROPRIEDADES do componente, que inclui os dados e as funções
export interface ReelCardProps extends StoryData {
  onClick: (story: StoryData) => void; // To open the story viewer
  onAuthorClick: (authorId: string, authorName: string, authorAvatarUrl?: string) => void; // To open the user profile modal
}

export default function ReelCard({
  id,
  authorId,
  authorName,
  authorAvatarUrl,
  thumbnailUrl,
  dataAIThumbnailHint,
  storyType,
  videoContentUrl,
  timestamp,
  description,
  onClick,
  onAuthorClick,
}: ReelCardProps) {
  
  const timeAgo = formatDistanceToNow(parseISO(timestamp), { addSuffix: true, locale: ptBR })
      .replace('cerca de ', '')
      .replace(' minuto', ' min')
      .replace(' minutos', ' min')
      .replace(' hora', ' h')
      .replace(' horas', ' h');

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the main onClick from firing
    onAuthorClick(authorId, authorName, authorAvatarUrl);
  };

  const handleStoryClick = () => {
    // Passamos o objeto de dados para o handler
    onClick({
      id, authorId, authorName, authorAvatarUrl, timestamp, description,
      thumbnailUrl, dataAIThumbnailHint, storyType, videoContentUrl
    });
  };

  const story = { id, authorId, authorName, authorAvatarUrl, timestamp, description, thumbnailUrl, dataAIThumbnailHint, storyType, videoContentUrl };

  return (
    <button
      type="button"
      onClick={handleStoryClick}
      className={cn(
        'group flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'transform-gpu transition-transform hover:scale-[1.03]',
        'w-[150px] h-[250px]'
      )}
      aria-label={`Ver reel de ${authorName}`}
    >
      <div
        className={cn(
          "relative w-full h-full bg-card rounded-md overflow-hidden shadow-md"
        )}
      >
        <video
          src={videoContentUrl || thumbnailUrl}
          muted
          loop
          autoPlay
          playsInline
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={dataAIThumbnailHint || 'video story content'}
        />

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="w-12 h-12 text-white/80 drop-shadow-lg" />
        </div>
        
        {/* Author Info at top */}
        <div 
          onClick={handleAuthorClick} 
          className="absolute top-2 left-2 flex items-center gap-1.5 p-1 rounded-full bg-black/30 backdrop-blur-sm cursor-pointer"
          aria-label={`Ver perfil de ${authorName}`}
        >
          <Avatar className="h-6 w-6 border-2 border-white/50">
            {authorAvatarUrl && <AvatarImage src={authorAvatarUrl} alt={authorName}/>}
            <AvatarFallback className="text-xs bg-primary/70 text-primary-foreground">
                {authorName ? authorName.substring(0,1).toUpperCase() : <UserCircle className="h-5 w-5"/>}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Title and Timestamp at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-2.5 cursor-pointer"
        >
          <p className="text-sm text-white font-semibold drop-shadow-sm line-clamp-2 leading-tight">{authorName}</p>
          <p className="text-xs text-white/80 drop-shadow-sm">{timeAgo}</p>
        </div>
      </div>
    </button>
  );
}
