
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, MapPin, Tag, Info, AlertTriangle, ExternalLink, Star, MessageSquare, Clock, Phone, Globe, Instagram } from 'lucide-react';
import StarDisplay from '@/components/sau/star-display';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { BusinessData } from '@/types/guia-comercial';
import { cn } from '@/lib/utils';
import { firestore } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';


const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const router = useRouter();

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !firestore) return;

    setLoading(true);
    const businessDocRef = doc(firestore, 'businesses', id);
    
    getDoc(businessDocRef).then(docSnap => {
      if (docSnap.exists()) {
        setBusiness({ id: docSnap.id, ...docSnap.data() } as BusinessData);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'O estabelecimento que você está tentando acessar não foi encontrado.',
        });
        router.push('/guia-comercial');
      }
    }).catch(error => {
        console.error("Error fetching business:", error);
        toast({ variant: "destructive", title: "Erro de Rede", description: "Não foi possível carregar os dados do estabelecimento." });
        router.push('/guia-comercial');
    }).finally(() => {
      setLoading(false);
    });

  }, [id, toast, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return null; // O redirect já foi acionado pelo useEffect
  }
  
  const getVisiblePromoImages = () => {
    if (!business.promoImages) return [];
    if (business.plano === 'PREMIUM') return business.promoImages.slice(0, 4);
    if (business.plano === 'INTERMEDIARIO') return business.promoImages.slice(0, 2);
    return [];
  };

  const visiblePromoImages = getVisiblePromoImages();
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${business.address}`)}`;

  const handlePhoneCall = () => {
    if (business.phone) window.location.href = `tel:${business.phone.replace(/\D/g, '')}`;
  };
  const handleWhatsAppClick = () => {
    if (business.whatsapp) window.open(`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`, '_blank');
  };
  const handleInstagramClick = () => {
    if (business.instagramUsername) window.open(`https://instagram.com/${business.instagramUsername.replace('@','')}`, '_blank');
  };


  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Link href="/guia-comercial" className="inline-flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para o Guia
      </Link>

      <Card className="rounded-xl shadow-lg overflow-hidden">
        <div className="relative w-full h-56 md:h-72 bg-muted">
          <Image
            src={business.imageUrl || 'https://placehold.co/800x400/e2e8f0/64748b?text=Sem+Foto'}
            alt={`Foto de ${business.name}`}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={business.dataAIImageHint}
            priority
          />
        </div>
        <CardHeader className="pt-4">
          <Badge variant="secondary" className="w-fit mb-2">{business.category}</Badge>
          <CardTitle className="font-headline text-2xl sm:text-3xl">{business.name}</CardTitle>
          <div className="flex items-center text-sm pt-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>{business.address}</span>
          </div>
          <div className="flex items-center gap-2 pt-2">
              <StarDisplay rating={business.averageRating || 0} size={18} />
              <span className="text-sm text-muted-foreground">
                  ({(business.averageRating || 0).toFixed(1)} de {business.reviewCount || 0} avaliações)
              </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {business.plano === 'GRATUITO' && <AdPlaceholder />}
          
          <div>
            <h3 className="flex items-center text-lg font-semibold mb-2">
                <Info className="h-5 w-5 mr-2 text-primary" />
                Sobre
            </h3>
            <p className="text-base text-foreground/90 whitespace-pre-line">
              {business.description}
            </p>
          </div>
          
          <Separator />

          {visiblePromoImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Destaques e Promoções</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {visiblePromoImages.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                        <Image src={img.url} alt={`Promoção ${index + 1}`} fill style={{ objectFit: 'cover' }} data-ai-hint={img.hint} />
                    </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {business.phone && <Button variant="outline" size="lg" className="rounded-full w-full" onClick={handlePhoneCall}><Phone className="mr-2 h-4 w-4" /> Ligar</Button>}
            {business.whatsapp && business.plano !== 'GRATUITO' && <Button variant="outline" size="lg" className="rounded-full w-full border-green-500 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={handleWhatsAppClick}><MessageSquare className="mr-2 h-4 w-4" /> WhatsApp</Button>}
            {business.instagramUsername && (business.plano === 'INTERMEDIARIO' || business.plano === 'PREMIUM') && <Button variant="outline" size="lg" className="rounded-full w-full border-pink-500 text-pink-600 hover:bg-pink-500/10 hover:text-pink-700" onClick={handleInstagramClick}><Instagram className="mr-2 h-4 w-4" /> Instagram</Button>}
            <Button asChild size="lg" className="rounded-full w-full sm:col-span-2">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Ver no Mapa e Rotas
                </a>
            </Button>
          </div>

          <Separator />
          
          <div>
            <h3 className="flex items-center text-lg font-semibold mb-3">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Avaliações Recentes
            </h3>
            <div className="text-center py-6 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground text-sm">Seção de comentários em breve.</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
