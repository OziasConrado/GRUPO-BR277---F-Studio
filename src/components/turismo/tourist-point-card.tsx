
'use client';

import { useState } from 'react';
import type { TouristPointData, TouristPointReview } from '@/types/turismo';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { MapPin, Info, Star, Eye, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import SubmitReviewModal from './SubmitReviewModal';
import StarDisplay from '../sau/star-display';

interface TouristPointCardProps {
  point: TouristPointData;
  showIndicatedBy?: boolean;
  onAddReview: (pointId: string, reviewData: Omit<TouristPointReview, 'id' | 'timestamp' | 'author' | 'userId' | 'pointId' | 'userAvatarUrl'>) => Promise<void>;
}

export default function TouristPointCard({ point, showIndicatedBy = false, onAddReview }: TouristPointCardProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async (reviewData: Omit<TouristPointReview, 'id' | 'timestamp' | 'author' | 'userId' | 'pointId' | 'userAvatarUrl'>) => {
    setIsSubmitting(true);
    try {
      await onAddReview(point.id, reviewData);
    } catch (error) {
      // Error is handled by the parent component's toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="w-full overflow-hidden shadow-lg rounded-xl flex flex-col h-full bg-card/80 dark:bg-card/80 backdrop-blur-sm border-white/10 dark:border-slate-700/10">
        <div className="relative w-full h-48">
          <Image
            src={point.imageUrl}
            alt={point.name}
            fill
            style={{ objectFit: 'cover' }}
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
          <div className="flex items-center justify-between text-sm mt-1 text-muted-foreground">
            <div className="flex items-center min-w-0">
              <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
              <span className="truncate">{point.locationName}</span>
            </div>
            {point.reviewCount && point.reviewCount > 0 ? (
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-foreground">{(point.averageRating || 0).toFixed(1)}</span>
                <span className="text-xs">({point.reviewCount})</span>
              </div>
            ) : null}
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
          <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(true)} className="w-full">
            <Star className="mr-1.5 h-4 w-4" /> Avaliar
          </Button>
          <Button asChild variant="default" size="sm" className="w-full">
            <Link href={`/turismo/${point.id}`}>
              <Eye className="mr-1.5 h-4 w-4" /> Ver Detalhes
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <SubmitReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        pointName={point.name}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
