import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, RadioTower } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface StreamCardProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  category: string;
  isLive: boolean;
  viewers?: number;
}

export default function StreamCard({ title, thumbnailUrl, category, isLive, viewers }: StreamCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg rounded-xl glassmorphic">
      <CardHeader className="p-0 relative">
        <div className="aspect-video w-full relative">
          <Image
            src={thumbnailUrl}
            alt={title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="live stream broadcast"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {isLive && (
            <Badge variant="destructive" className="absolute top-2 left-2 flex items-center gap-1 animate-pulse">
              <RadioTower className="h-3 w-3"/> AO VIVO
            </Badge>
          )}
           {viewers && isLive && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {viewers} espectadores
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-md font-headline mb-1 truncate">{title}</CardTitle>
        <Badge variant="outline" className="text-xs">{category}</Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full rounded-lg" variant="default">
          <PlayCircle className="mr-2 h-5 w-5" /> Assistir
        </Button>
      </CardFooter>
    </Card>
  );
}
