'use client';

import type { TouristPointData } from '@/types/turismo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MapPin, Info, Star, Eye, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


interface TouristPointCardProps {
  point: TouristPointData;
  showIndicatedBy?: boolean;
}


export default function TouristPointCard({ point, showIndicatedBy = false }: TouristPointCardProps) {
  const { toast } = useToast();

  const handleViewDetails = () => {
    toast({
      title: `Detalhes de ${point.name}`,
      description: "Página de detalhes do ponto turístico em breve!",
    });
  };

  const handleRatePlace = () => {
     toast({
      title: `Avaliar ${point.name}`,
      description: "Funcionalidade de avaliação em breve!",
    });
  }

  return (
    <Card className="w-full overflow-hidden shadow-lg rounded-xl flex flex-col h-full bg-card/80 dark:bg-card/80 backdrop-blur-sm border-white/10 dark:border-slate-700/10">
      <div className="relative w-full h-48">
        <Image
          src={point.imageUrl}
          alt={point.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={point.dataAIImageHint}
        />
        <Badge variant="secondary" className="absolute top-2 left-2 shadow-md bg-opacity-80 backdrop-blur-sm">
          {point.category}
        </Badge>
         {showIndicatedBy && point.status === 'pending' && (
             <Badge variant="destructive" className="absolute top-2 right-2 shadow-md bg-opacity-80 backdrop-blur-sm">
                Em Análise
            </Badge>
         )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="font-headline text-xl">{point.name}</CardTitle>
        <div className="flex items-center text-sm mt-1 text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
          <span>{point.locationName}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4 flex-grow">
        <div className="flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-foreground/90 line-clamp-3">{point.description}</p>
        </div>
        {showIndicatedBy && point.indicatedByUserName && (
             <div className="flex items-center text-xs text-muted-foreground pt-2">
                <UserCheck className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>Indicado por: <strong>{point.indicatedByUserName}</strong></span>
            </div>
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={handleRatePlace} className="w-full">
          <Star className="mr-1.5 h-4 w-4" /> Avaliar
        </Button>
        <Button variant="default" size="sm" onClick={handleViewDetails} className="w-full">
          <Eye className="mr-1.5 h-4 w-4" /> Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
