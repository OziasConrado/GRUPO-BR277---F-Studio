'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Cctv, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StreamCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  dataAIThumbnailHint?: string;
  category: string;
  isLive: boolean;
  streamUrl: string;
}

interface StreamCardComponentProps {
  stream: StreamCardProps;
  isFavorite: boolean;
  isFavoriting: boolean;
  onWatch: (stream: StreamCardProps) => void;
  onToggleFavorite: (e: React.MouseEvent, streamId: string) => void;
}

export default function StreamCard({ stream, isFavorite, isFavoriting, onWatch, onToggleFavorite }: StreamCardComponentProps) {
  return (
    <Card 
      className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border rounded-lg overflow-hidden group relative cursor-pointer"
      onClick={() => onWatch(stream)}
    >
       <button
        onClick={(e) => onToggleFavorite(e, stream.id)}
        className="absolute top-2 right-2 z-10 p-2"
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {isFavoriting ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
          <Star className={cn("h-5 w-5 transition-all duration-200 ease-in-out", isFavorite ? "text-amber-400 fill-amber-400" : "text-slate-400/70 hover:text-amber-400 hover:scale-125")} />
        )}
      </button>
      <CardContent className="p-3 flex items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
          <Cctv className="h-8 w-8 text-primary"/>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold font-headline line-clamp-1">{stream.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{stream.description}</p>
           <Button 
              variant="default" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onWatch(stream); }}
              className="rounded-full text-xs py-1 px-3 h-auto mt-2"
           >
              <PlayCircle className="mr-1 h-4 w-4" /> Assistir
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
