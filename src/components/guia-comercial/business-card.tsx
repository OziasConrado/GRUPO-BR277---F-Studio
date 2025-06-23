
'use client';

import type { BusinessData } from '@/types/guia-comercial';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Settings, Info, ExternalLink, Clock, Instagram, Star as StarIcon, Edit3, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import StarDisplay from '@/components/sau/star-display'; // Reusing star display component
import { useToast } from '@/hooks/use-toast';

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
  
  const handleReviewClick = () => {
    toast({
        title: "Avaliar Local",
        description: "Funcionalidade de avaliação estará disponível em breve!",
    });
  };

  const handleNavigate = () => {
    if (business.latitude && business.longitude) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${business.latitude},${business.longitude}`;
                window.open(mapsUrl, '_blank');
            }, () => {
                // Fallback if user location cannot be obtained, but business location is known
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
                window.open(mapsUrl, '_blank');
            });
        } else {
            // Fallback if geolocation API not supported
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
            window.open(mapsUrl, '_blank');
        }
    } else {
        // Fallback if business location is not known, search by address
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
        window.open(mapsUrl, '_blank');
    }
  };


  return (
    <Card className="w-full overflow-hidden shadow-lg rounded-xl flex flex-col h-full bg-card/80 dark:bg-card/80 backdrop-blur-sm border-white/10 dark:border-slate-700/10">
      <div className="relative w-full h-48">
        <Image
          src={business.imageUrl}
          alt={business.name}
          layout="fill"
          objectFit="cover"
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

      <CardHeader className="pb-3">
        <CardTitle className="font-headline text-xl">{business.name}</CardTitle>
        <div className="flex items-center text-sm mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>{business.address}</span>
            {business.distance !== undefined && business.distance !== Infinity && (
                <Badge variant="outline" className="ml-2 text-xs whitespace-nowrap">
                    ~{business.distance.toFixed(1)} km
                </Badge>
            )}
        </div>

        {business.averageRating !== undefined && business.reviewCount !== undefined && (
            <div className="flex items-center gap-2 mt-1.5">
                <StarDisplay rating={business.averageRating} size={16} />
                <span className="text-xs text-muted-foreground">
                    ({business.averageRating.toFixed(1)} de {business.reviewCount} avaliações)
                </span>
            </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-4 flex-grow">
        <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-foreground/90">{business.description}</p>
        </div>

        {business.operatingHours && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <p className="text-sm font-medium">{business.operatingHours}</p>
          </div>
        )}

        {business.servicesOffered && business.servicesOffered.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center">
                <Settings className="h-3.5 w-3.5 mr-1"/> SERVIÇOS:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {business.servicesOffered.map(service => (
                <Badge key={service} variant="outline" className="text-xs">{service}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 pt-3 border-t">
        {business.phone && (
          <Button variant="outline" size="sm" onClick={handlePhoneCall} className="w-full">
            <Phone className="mr-1.5 h-4 w-4" /> Ligar
          </Button>
        )}
        {business.whatsapp && (
          <Button variant="outline" size="sm" onClick={handleWhatsAppClick} className="w-full bg-green-500/10 border-green-500/50 text-green-700 hover:bg-green-500/20 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
            <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
          </Button>
        )}
        
        {business.instagramUsername && (
            <Button variant="outline" size="sm" onClick={handleInstagramClick} className="w-full bg-pink-500/10 border-pink-500/50 text-pink-700 hover:bg-pink-500/20 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300">
                <Instagram className="mr-1.5 h-4 w-4" /> Instagram
            </Button>
        )}

        
         <Button variant="outline" size="sm" onClick={handleReviewClick} className="w-full">
            <Edit3 className="mr-1.5 h-4 w-4" /> Avaliar
        </Button>
        
        <Button 
            variant="default" 
            size="sm"
            className="w-full col-span-2 mt-2"
            onClick={handleNavigate}
        >
            <Navigation className="mr-1.5 h-4 w-4" />
            Navegar até o Local
        </Button>
      </CardFooter>
    </Card>
  );
}
