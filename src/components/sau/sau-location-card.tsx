
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { MapPin, Building, Clock, ShieldCheck, Star, MessageSquare, Edit3, Navigation } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SubmitReviewModal from './submit-review-modal';
import StarDisplay from './star-display';

interface SauLocationCardProps {
  sau: SAULocation;
  reviews: SAUReview[];
  onAddReview: (reviewData: Omit<SAUReview, 'id' | 'timestamp' | 'author' | 'sauId'>) => void;
}

export default function SauLocationCard({ sau, reviews, onAddReview }: SauLocationCardProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleNavigate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${sau.latitude},${sau.longitude}`;
            window.open(mapsUrl, '_blank');
        }, () => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${sau.latitude},${sau.longitude}`;
            window.open(mapsUrl, '_blank');
        });
    } else {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${sau.latitude},${sau.longitude}`;
        window.open(mapsUrl, '_blank');
    }
  };

  return (
    <>
      <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-card/80 dark:bg-card/80 backdrop-blur-sm border border-white/10 dark:border-slate-700/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div>
              <CardTitle className="text-lg font-headline flex items-center"> {/* Adjusted title size if needed by global font change */}
                <Building className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                {sau.name}
              </CardTitle>
              <CardDescription className="mt-1 ml-7 sm:ml-0">{sau.concessionaire}</CardDescription>
            </div>
            {sau.distance !== undefined && (
              <Badge variant="secondary" className="mt-1 sm:mt-0 self-start sm:self-auto whitespace-nowrap">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Aprox. {sau.distance.toFixed(1)} km
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4 space-y-4"> {/* Increased space-y from 3 to 4 */}
          
          <div>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{sau.address}</span>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span>{sau.operatingHours}</span>
            </div>
          </div>
          
          {sau.services.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-1.5 text-muted-foreground flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> SERVIÇOS:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sau.services.map(service => (
                    <Badge key={service} variant="outline">{service}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />

          <div className="pt-1"> {/* Adjusted padding top */}
            <div className="flex items-center gap-2 mb-2"> {/* Increased margin bottom */}
                <StarDisplay rating={sau.averageRating || 0} size={18}/>
                <span className="text-muted-foreground">
                    ({(sau.averageRating || 0).toFixed(1)} de {sau.reviewCount || 0} avaliações)
                </span>
            </div>
             <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleNavigate} className="rounded-md">
                    <Navigation className="mr-1.5 h-4 w-4" />
                    Navegar
                </Button>
                <Button variant="default" size="sm" onClick={() => setIsReviewModalOpen(true)} className="rounded-md">
                  <Edit3 className="mr-1.5 h-4 w-4" />
                  Avaliar SAU
                </Button>
             </div>
          </div>

        </CardContent>
        {reviews && reviews.length > 0 && (
             <CardFooter className="p-0">
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="reviews" className="border-t border-white/10 dark:border-slate-700/10">
                    <AccordionTrigger className="px-6 py-3 hover:no-underline">
                        <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                            Ver {reviews.length} Comentário(s)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 space-y-3">
                    {reviews.map(review => (
                        <div key={review.id} className="p-3 rounded-md bg-muted/30 dark:bg-slate-700/40">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">{review.author}</span>
                            <StarDisplay rating={review.rating} size={14} />
                        </div>
                        <p className="mb-1">{review.comment}</p>
                        <p className="text-muted-foreground/70 text-[10px]"> {/* Explicitly smaller for timestamp */}
                            {new Date(review.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        </div>
                    ))}
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </CardFooter>
        )}
      </Card>
      <SubmitReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={onAddReview}
        sauName={sau.name}
      />
    </>
  );
}
