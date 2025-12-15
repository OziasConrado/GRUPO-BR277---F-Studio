'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Cctv } from 'lucide-react';

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
  onWatch: (stream: StreamCardProps) => void;
}

export default function StreamCard({ stream, onWatch }: StreamCardComponentProps) {
  return (
    <Card className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border rounded-lg overflow-hidden">
      <CardContent className="p-3 flex flex-row items-center gap-4">
        <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
          <Cctv className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-grow flex flex-col justify-center self-stretch">
          <h3 className="font-semibold font-headline line-clamp-1">{stream.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{stream.description}</p>
        </div>
        <div className="flex-shrink-0 self-center">
          <Button
            variant="default"
            size="sm"
            onClick={() => onWatch(stream)}
            className="rounded-full text-xs py-1 px-3 h-auto"
          >
            <PlayCircle className="mr-1 h-4 w-4" /> Assistir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
