
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
import type { BusinessData, PlanType } from '@/types/guia-comercial';
import { cn } from '@/lib/utils';


// Mock Data - Simula a busca no DB, agora com planos
const mockBusinesses: BusinessData[] = [
  {
    id: 'mock-1',
    name: 'Borracharia do Zé',
    category: 'Borracharia',
    plano: 'PREMIUM', // Plano Premium
    statusPagamento: 'ATIVO',
    address: 'Av. das Torres, 123, São José dos Pinhais, PR',
    description: 'Serviços rápidos e de confiança para seu pneu não te deixar na mão. Mais de 20 anos de experiência no ramo, atendendo carros, caminhões e motos. Temos pneus novos e remold.',
    imageUrl: 'https://picsum.photos/seed/borracharia/800/400',
    dataAIImageHint: 'tire shop interior',
    phone: '4133334444',
    whatsapp: '5541999998888',
    instagramUsername: 'borracharia_do_ze',
    operatingHours: 'Seg-Sex: 08:00-18:00, Sáb: 08:00-12:00',
    servicesOffered: ['Conserto de Pneus', 'Balanceamento', 'Troca de Roda', 'Venda de Pneus'],
    isPremium: true,
    latitude: -25.5398,
    longitude: -49.1925,
    averageRating: 4.8,
    reviewCount: 125,
    promoImages: [
        { url: 'https://picsum.photos/seed/promo1/500/300', hint: 'promotion tires' },
        { url: 'https://picsum.photos/seed/promo2/500/300', hint: 'mechanic working' },
        { url: 'https://picsum.photos/seed/promo3/500/300', hint: 'tire alignment machine' },
        { url: 'https://picsum.photos/seed/promo4/500/300', hint: 'car on lift' },
    ]
  },
  {
    id: 'mock-2',
    name: 'Restaurante Sabor da Estrada',
    category: 'Restaurante',
    plano: 'INTERMEDIARIO', // Plano Intermediário
    statusPagamento: 'ATIVO',
    address: 'Rod. BR-277, km 50, Curitiba, PR',
    description: 'A melhor comida caseira da região, com buffet livre e pratos executivos. Amplo estacionamento para caminhões e ambiente familiar. Wi-fi liberado para clientes.',
    imageUrl: 'https://picsum.photos/seed/restaurante/800/400',
    dataAIImageHint: 'restaurant exterior',
    whatsapp: '5541988887777',
    operatingHours: 'Todos os dias: 11:00-15:00 e 18:00-22:00',
    servicesOffered: ['Buffet Livre', 'Marmitex', 'Wi-Fi Grátis', 'Banheiros Limpos', 'Estacionamento Amplo'],
    isPremium: true,
    latitude: -25.4411,
    longitude: -49.2908,
    averageRating: 4.5,
    reviewCount: 210,
    promoImages: [
        { url: 'https://picsum.photos/seed/comida1/500/300', hint: 'plate of food' },
        { url: 'https://picsum.photos/seed/comida2/500/300', hint: 'restaurant buffet' },
    ]
  },
   {
    id: 'mock-3',
    name: 'Mecânica Confiança',
    category: 'Oficina Mecânica',
    plano: 'GRATUITO', // Plano Gratuito
    statusPagamento: 'ATIVO',
    address: 'Rua das Orquídeas, 45, Campina Grande do Sul, PR',
    description: 'Especialistas em motor e suspensão para veículos pesados. Socorro 24h na região. Orçamento sem compromisso.',
    imageUrl: 'https://picsum.photos/seed/mecanica/600/400',
    dataAIImageHint: 'auto repair bay',
    phone: '4136765555',
    latitude: -25.2959,
    longitude: -49.0543,
    averageRating: 4.9,
    reviewCount: 88,
  },
];


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
    if (id) {
      setLoading(true);
      // Simula a busca do negócio pelo ID
      const foundBusiness = mockBusinesses.find(b => b.id === id);
      if (foundBusiness) {
        setBusiness(foundBusiness);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'O estabelecimento que você está tentando acessar não foi encontrado.',
        });
        router.push('/guia-comercial');
      }
      setLoading(false);
    }
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
            src={business.plano !== 'GRATUITO' ? business.imageUrl : 'https://placehold.co/800x400/e2e8f0/64748b?text=Sem+Foto'}
            alt={`Foto de ${business.name}`}
            layout="fill"
            objectFit="cover"
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
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image src={img.url} alt={`Promoção ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint={img.hint} />
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
