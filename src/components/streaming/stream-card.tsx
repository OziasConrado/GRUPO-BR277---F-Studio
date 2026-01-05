
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
      className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border rounded-lg overflow-hidden group relative"
    >
      <CardContent className="p-3 flex items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
          <Cctv className="h-8 w-8 text-primary"/>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold font-headline line-clamp-1">{stream.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{stream.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 ml-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onWatch(stream)}
              className="rounded-full text-xs py-1 px-3 h-auto"
            >
              <PlayCircle className="mr-1 h-4 w-4" /> Assistir
            </Button>
        </div>
          <button
          onClick={(e) => onToggleFavorite(e, stream.id)}
          className="absolute top-1.5 right-1.5 z-10 p-2 bg-black/10 rounded-full text-white hover:bg-black/30 transition-colors"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
            {isFavoriting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className={cn("h-5 w-5", isFavorite ? "text-amber-400 fill-amber-400" : "text-white/80")}/>}
        </button>
      </CardContent>
    </Card>
  );
}
