
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, ShieldCheck, Star, MessageSquare, Edit3, Navigation } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SubmitReviewModal from './submit-review-modal';
import StarDisplay from './star-display';
import { cn } from '@/lib/utils';

interface SauLocationCardProps {
  sau: SAULocation;
  reviews: SAUReview[];
  onAddReview: (reviewData: Omit<SAUReview, 'id' | 'timestamp' | 'author' | 'sauId'>) => void;
}

const concessionaireLogos: Record<string, { url: string; hint: string }> = {
  'Via Araucária': { url: 'https://placehold.co/64x64.png?text=VA', hint: 'logo via araucaria' },
  'EPR Litoral Pioneiro': { url: 'https://placehold.co/64x64.png?text=EPRLP', hint: 'logo epr litoral pioneiro' },
  'Arteris Litoral Sul': { url: 'https://placehold.co/64x64.png?text=ALS', hint: 'logo arteris litoral sul' },
  'Arteris Planalto Sul': { url: 'https://placehold.co/64x64.png?text=APS', hint: 'logo arteris planalto sul' },
  'Arteris Régis Bitencourt': { url: 'https://placehold.co/64x64.png?text=ARB', hint: 'logo arteris regis bitencourt' },
  'CCR PRVias': { url: 'https://placehold.co/64x64.png?text=CCRPR', hint: 'logo ccr prvias' },
  'CCR RioSP': { url: 'https://placehold.co/64x64.png?text=CCRRS', hint: 'logo ccr riosp' },
  'EPR IGUAÇU': { url: 'https://placehold.co/64x64.png?text=EPR-I', hint: 'logo epr iguacu' },
};


export default function SauLocationCard({ sau, reviews, onAddReview }: SauLocationCardProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const logoData = concessionaireLogos[sau.concessionaire] || { url: 'https://placehold.co/64x64.png?text=LOGO', hint: 'logo concessionaria generico' };


  const handleNavigate = () => {
    if (sau.latitude && sau.longitude) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${sau.latitude},${sau.longitude}`;
                window.open(mapsUrl, '_blank');
            }, () => {
                // Fallback if user location cannot be obtained, but business location is known
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${sau.latitude},${sau.longitude}`;
                window.open(mapsUrl, '_blank');
            });
        } else {
            // Fallback if geolocation API not supported
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${sau.latitude},${sau.longitude}`;
            window.open(mapsUrl, '_blank');
        }
    } else {
        // Fallback if business location is not known, search by address
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sau.address)}`;
        window.open(mapsUrl, '_blank');
    }
  };

  return (
    <>
      <Card className="w-full shadow-lg rounded-xl overflow-hidden bg-card/80 dark:bg-card/80 border border-border">
        <CardHeader className="p-4 flex flex-row items-start gap-3">
          <Image
            src={logoData.url}
            alt={`${sau.concessionaire} logo`}
            width={64}
            height={64}
            className="rounded-md w-16 h-16 flex-shrink-0"
            data-ai-hint={logoData.hint}
          />
          <div className="flex-grow">
            <h2 className="text-md font-semibold text-foreground">{sau.concessionaire}</h2>
            {sau.distance !== undefined && sau.distance !== Infinity && (
              <Badge variant="outline" className="mt-1.5 text-xs whitespace-nowrap">
                <MapPin className="h-3 w-3 mr-1" />
                Aprox. {sau.distance.toFixed(1)} km
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-4 pt-2 px-4 space-y-3">
          
          <div>
            <h3 className="text-md font-headline text-foreground">{sau.name}</h3>
          </div>

          <Separator />
          
          <div>
            <div className="flex items-start text-sm">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{sau.address}</span>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span>{sau.operatingHours}</span>
            </div>
          </div>

          {sau.services && sau.services.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1"/> SERVIÇOS DISPONÍVEIS:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sau.services.map(service => (
                    <Badge key={service} variant="secondary" className="text-xs">{service}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <Separator />

          <Button variant="default" size="sm" onClick={handleNavigate} className="w-full mt-2">
            <Navigation className="mr-1.5 h-4 w-4" />
            Navegar até o Local
          </Button>

          <Separator />

          <div className="pt-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <StarDisplay rating={sau.averageRating || 0} size={18}/>
                <span className="text-xs text-muted-foreground mt-0.5">
                    ({(sau.averageRating || 0).toFixed(1)} de {sau.reviewCount || 0} avaliações)
                </span>
              </div>
              <Button variant="default" size="sm" onClick={() => setIsReviewModalOpen(true)}>
                <Edit3 className="mr-1.5 h-4 w-4" />
                Avaliar Serviço
              </Button>
            </div>
          </div>

        </CardContent>
        {reviews && reviews.length > 0 && (
             <CardFooter className="p-0">
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="reviews" className="border-t border-border">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline text-sm">
                        <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                            Ver {reviews.length} Comentário(s)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-3">
                    {reviews.map(review => (
                        <div key={review.id} className="p-3 rounded-md bg-muted/20 dark:bg-muted/30">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold">{review.author}</span>
                            <StarDisplay rating={review.rating} size={14} />
                        </div>
                        <p className="text-sm mb-1">{review.comment}</p>
                        <p className="text-muted-foreground/70 text-[10px]">
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
