'use client';

import type { BusinessData } from '@/types/guia-comercial';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Phone, Globe, MessageCircle, MapPin, Settings, Info, Clock, Instagram, Star as StarIcon, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import StarDisplay from '@/components/sau/star-display';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function BusinessCard({ business }: { business: BusinessData }) {
  const { toast } = useToast();

  const handleWhatsAppClick = () => {
    if (business.whatsapp) {
      let phoneNumber = business.whatsapp.replace(/\D/g, '');
      if (!phoneNumber.startsWith('55')) {
        phoneNumber = `55${phoneNumber}`;
      }
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const handlePhoneCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone.replace(/\D/g, '')}`;
    }
  };

  const handleInstagramClick = () => {
    if (business.instagramUsername) {
        window.open(`https://instagram.com/${business.instagramUsername.replace('@','')}`, '_blank');
    }
  };
  
  const handleReviewClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    toast({
        title: "Em Breve",
        description: "A funcionalidade de avaliação detalhada será implementada em breve!",
    });
  };

  return (
    <Link href={`/guia-comercial/${business.id}`} className="block group">
      <Card className="w-full overflow-hidden shadow-lg rounded-xl flex flex-col h-full bg-card/80 dark:bg-card/80 backdrop-blur-sm border-white/10 dark:border-slate-700/10 group-hover:border-primary/20 group-hover:shadow-xl transition-all duration-200">
        <div className="relative w-full h-40">
          <Image
            src={business.imageUrl}
            alt={business.name}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={business.dataAIImageHint}
          />
          {business.isPremium && (
            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-md flex items-center gap-1">
              <StarIcon className="h-3 w-3" /> PREMIUM
            </div>
          )}
          <Badge variant={business.isPremium ? "default" : "secondary"} className="absolute top-2 left-2 shadow-md bg-opacity-80 backdrop-blur-sm">
              {business.category}
          </Badge>
        </div>

        <CardHeader className="pb-2 pt-4">
          <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{business.name}</CardTitle>
          <div className="flex items-center text-sm mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{business.address}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2 pb-3 flex-grow">
          {business.averageRating !== undefined && business.reviewCount !== undefined && (
              <div className="flex items-center gap-2">
                  <StarDisplay rating={business.averageRating} size={16} />
                  <span className="text-xs text-muted-foreground">
                      ({business.averageRating.toFixed(1)} de {business.reviewCount} avaliações)
                  </span>
              </div>
          )}
          <p className="text-sm text-foreground/80 line-clamp-2">{business.description}</p>
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-2 pt-3 border-t">
          {business.whatsapp && (
            <Button variant="outline" size="sm" onClick={(e) => {e.preventDefault(); handleWhatsAppClick();}} className="w-full bg-green-500/10 border-green-500/50 text-green-700 hover:bg-green-500/20 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
              <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
            </Button>
          )}
          
          <Button variant="default" size="sm" className="w-full col-span-2">
              Ver Detalhes e Avaliar
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
