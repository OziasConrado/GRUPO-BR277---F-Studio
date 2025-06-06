
'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, XCircle, Loader2, AlertTriangle, MapPinIcon } from "lucide-react";
import type { BusinessData } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import RegisterBusinessModal from '@/components/guia-comercial/register-business-modal';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const mockBusinesses: BusinessData[] = [
  {
    id: 'comercio-1',
    name: 'Restaurante Sabor da Estrada (Premium)',
    category: 'Restaurante',
    address: 'Rodovia BR-116, Km 300, Campina Grande do Sul - PR',
    phone: '4133334444',
    whatsapp: '5541999998888',
    description: 'Comida caseira de alta qualidade, buffet livre e pratos a la carte. Amplo estacionamento para caminhões. Wi-Fi e banheiros limpos.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'restaurant roadside',
    servicesOffered: ['Buffet Livre', 'A La Carte', 'Estacionamento Amplo', 'Wi-Fi Grátis', 'Banheiros Limpos'],
    operatingHours: 'Seg-Dom: 06:00 - 23:00',
    isPremium: true,
    latitude: -25.3200, // Approximate coordinates for Campina Grande do Sul
    longitude: -49.0500,
    instagramUsername: 'sabordaestrada',
    averageRating: 4.7,
    reviewCount: 152,
  },
  {
    id: 'comercio-2',
    name: 'Borracharia Confiança',
    category: 'Borracharia',
    address: 'Av. das Torres, 123, São José dos Pinhais - PR',
    phone: '4130305050',
    description: 'Serviços de borracharia 24 horas. Venda de pneus novos e usados. Atendimento rápido e eficiente para todos os tipos de veículos.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'tire shop',
    servicesOffered: ['Troca de Pneus', 'Conserto de Furos', 'Balanceamento', 'Venda de Pneus'],
    operatingHours: '24 horas',
    isPremium: false,
    latitude: -25.5313, // Approximate coordinates for São José dos Pinhais
    longitude: -49.1959,
  },
  {
    id: 'comercio-3',
    name: 'Hotel Descanso do Viajante (Premium)',
    category: 'Hotel/Pousada',
    address: 'Rua das Palmeiras, 789, Piraquara - PR',
    whatsapp: '5541977776666',
    description: 'Quartos confortáveis com café da manhã incluso. Preços acessíveis para caminhoneiros e viajantes. Ambiente seguro e tranquilo.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'motel facade',
    operatingHours: 'Recepção 24 horas',
    isPremium: true,
    latitude: -25.4442, // Approximate coordinates for Piraquara
    longitude: -49.0628,
    instagramUsername: 'hoteldescanso',
    averageRating: 4.2,
    reviewCount: 88,
  },
  {
    id: 'comercio-4',
    name: 'Posto Petro Rota',
    category: 'Posto de Combustível',
    address: 'BR-376, Km 620, Tijucas do Sul - PR',
    phone: '4136221122',
    description: 'Combustíveis de qualidade, loja de conveniência completa e banheiros sempre limpos. Pátio amplo para manobras.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'gas station night',
    servicesOffered: ['Gasolina Comum/Aditivada', 'Diesel S10/S500', 'Etanol', 'Loja Conveniência', 'Troca de Óleo'],
    operatingHours: '24 horas',
    isPremium: false,
    latitude: -25.9278, // Approximate coordinates for Tijucas do Sul
    longitude: -49.1914,
  },
  {
    id: 'comercio-5',
    name: 'Mecânica Diesel Master (Premium)',
    category: 'Oficina Mecânica',
    address: 'Rodovia do Xisto, Km 15, Araucária - PR',
    whatsapp: '5541988887777',
    description: 'Especializada em motores diesel de grande porte. Equipe qualificada e equipamentos modernos para diagnóstico e reparo.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'truck repair shop',
    servicesOffered: ['Revisão Motor Diesel', 'Troca de Filtros', 'Sistema de Injeção', 'Freios', 'Suspensão'],
    operatingHours: 'Seg-Sáb: 07:30 - 19:00',
    isPremium: true,
    latitude: -25.5925, // Approximate coordinates for Araucária
    longitude: -49.3989,
    instagramUsername: 'dieselmasteroficial',
    averageRating: 4.9,
    reviewCount: 213,
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}


export default function GuiaComercialPage() {
  const [businesses, setBusinesses] = useState<BusinessData[]>(mockBusinesses);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');


  useEffect(() => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
          toast({
            title: "Localização Ativada",
            description: "Mostrando comércios próximos a você.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          toast({
            variant: 'default',
            title: "Localização Desativada",
            description: "Não foi possível obter sua localização. Mostrando comércios em ordem padrão.",
          });
        }
      );
    } else {
      setLocationStatus('error');
      toast({
        variant: "destructive",
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
      });
    }
  }, [toast]);

  const processedBusinesses = useMemo(() => {
    let filtered = businesses.filter(business =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.address && business.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (userLocation && locationStatus === 'success') {
      const businessesWithDistance = filtered.map(business => {
        if (business.latitude && business.longitude) {
          return {
            ...business,
            distance: calculateDistance(userLocation.latitude, userLocation.longitude, business.latitude, business.longitude),
          };
        }
        return { ...business, distance: Infinity }; // Businesses without lat/lng go to the end
      });
      businessesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return businessesWithDistance;
    }
    // Default sort (e.g., by name or original mock order) if no location or error
    return filtered.sort((a,b) => a.name.localeCompare(b.name));
  }, [businesses, searchTerm, userLocation, locationStatus]);


  const handleRegisterBusiness = (newBusinessData: Omit<BusinessData, 'id' | 'imageUrl' | 'dataAIImageHint'> & { imagePreviewUrl: string }) => {
    const { imagePreviewUrl, ...restOfData } = newBusinessData;
    const newBusiness: BusinessData = {
      ...restOfData,
      id: `comercio-${Date.now()}`,
      imageUrl: imagePreviewUrl, // Using the Data URL from preview
      dataAIImageHint: "user uploaded business photo",
      // For new businesses, lat/long might not be immediately available or require separate input
      // averageRating and reviewCount would typically start at 0 or be undefined
    };
    setBusinesses(prev => [newBusiness, ...prev].sort((a,b) => a.name.localeCompare(b.name))); // Add and re-sort
    toast({
      title: "Comércio Cadastrado!",
      description: `${newBusiness.name} foi adicionado ao guia.`,
    });
    setIsRegisterModalOpen(false);
  };


  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold font-headline">Guia Comercial</h1>
          <p className="text-muted-foreground text-sm">Encontre serviços e estabelecimentos na sua rota.</p>
        </div>
        <Button onClick={() => setIsRegisterModalOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Cadastrar Meu Comércio
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome, categoria, endereço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full rounded-full h-11 bg-background/70"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={() => setSearchTerm('')}
          >
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {locationStatus === 'loading' && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-headline">Obtendo sua localização...</AlertTitle>
          <AlertDescription>
            Por favor, aguarde para listarmos os comércios mais próximos.
          </AlertDescription>
        </Alert>
      )}

      {locationStatus === 'error' && (
         <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline">Localização Indisponível</AlertTitle>
            <AlertDescription>
                Verifique as permissões de localização no seu navegador.
                Os comércios serão listados em ordem padrão.
            </AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <AlertTitle className="text-primary font-semibold">Plano de Visualização</AlertTitle>
        <AlertDescription className="text-primary/80">
          Você está no plano gratuito. Para uma experiência sem anúncios e com mais recursos, considere nosso <Button variant="link" className="p-0 h-auto text-primary">Plano Premium</Button>.
          <div className="mt-2 h-16 bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
            Espaço para Banner AdMob (Ex: 320x50)
          </div>
        </AlertDescription>
      </Alert>

      {processedBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedBusinesses.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? "Nenhum comércio encontrado para sua busca." : (locationStatus === 'loading' ? "Carregando comércios..." : "Nenhum comércio cadastrado ainda.")}
        </p>
      )}

      <RegisterBusinessModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterBusiness}
      />
    </div>
  );
}
