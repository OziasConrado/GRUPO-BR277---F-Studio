
'use client';

import type { BusinessData } from '@/types/guia-comercial';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Tag, Clock, Settings, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils'; // Added missing import

export default function BusinessCard({ business }: { business: BusinessData }) {
  
  const handleWhatsAppClick = () => {
    if (business.whatsapp) {
      let phoneNumber = business.whatsapp.replace(/\D/g, '');
      if (!phoneNumber.startsWith('55')) { // Assuming Brazilian numbers, add 55 if not present
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
        {!business.isPremium && (
           <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md font-semibold shadow-md">
            ANÚNCIO
          </div>
        )}
         <Badge variant={business.isPremium ? "default" : "secondary"} className="absolute top-2 left-2 shadow-md">
            {business.category}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="font-headline text-xl">{business.name}</CardTitle>
        <CardDescription className="flex items-start text-sm mt-1">
          <MapPin className="h-4 w-4 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
          {business.address}
        </CardDescription>
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
          <Button variant="outline" onClick={handlePhoneCall} className="w-full">
            <Phone className="mr-2 h-4 w-4" /> Ligar
          </Button>
        )}
        {business.whatsapp && (
          <Button variant="outline" onClick={handleWhatsAppClick} className="w-full bg-green-500/10 border-green-500/50 text-green-700 hover:bg-green-500/20 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
            <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
          </Button>
        )}
        {/* Show something if no contact buttons */}
        {(!business.phone && business.whatsapp) && <div className="hidden"></div> /* Consume one grid cell if only whatsapp */}
        {(!business.phone && !business.whatsapp) && (
             <Button variant="link" size="sm" className="col-span-2 text-muted-foreground cursor-default">
                Contato não disponível
            </Button>
        )}
         <Button variant="default" className={cn("w-full", (business.phone && business.whatsapp) ? "col-span-2 mt-2" : (!business.phone && !business.whatsapp) ? "hidden" : "w-full")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Detalhes
        </Button>
      </CardFooter>
      {!business.isPremium && (
        <div className="h-12 bg-muted/20 border-t flex items-center justify-center text-xs text-muted-foreground">
            Espaço para Anúncio no Card (Ex: 300x25)
        </div>
      )}
    </Card>
  );
}
