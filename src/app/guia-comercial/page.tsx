
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, AlertTriangle, Search, ListFilter, PlusCircle } from 'lucide-react';
import type { BusinessData, BusinessCategory } from '@/types/guia-comercial';
import { businessCategories } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import RegisterBusinessModal from '@/components/guia-comercial/register-business-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ToastAction } from '@/components/ui/toast';
import { getUserLocation, calculateDistance } from '@/lib/utils';
import { cn } from '@/lib/utils';


// Mock Data - Substituir com dados do Firestore
const mockBusinesses: Omit<BusinessData, 'id'>[] = [
  {
    name: 'Borracharia do Zé',
    category: 'Borracharia',
    address: 'Av. das Torres, 123, São José dos Pinhais, PR',
    description: 'Serviços rápidos e de confiança para seu pneu não te deixar na mão. Mais de 20 anos de experiência.',
    imageUrl: 'https://picsum.photos/seed/borracharia/600/400',
    dataAIImageHint: 'tire shop',
    phone: '4133334444',
    whatsapp: '5541999998888',
    operatingHours: 'Seg-Sex: 08:00-18:00, Sáb: 08:00-12:00',
    servicesOffered: ['Conserto de Pneus', 'Balanceamento', 'Troca de Roda'],
    isPremium: true,
    latitude: -25.5398,
    longitude: -49.1925,
    averageRating: 4.8,
    reviewCount: 125,
  },
  {
    name: 'Restaurante Sabor da Estrada',
    category: 'Restaurante',
    address: 'Rod. BR-277, km 50, Curitiba, PR',
    description: 'A melhor comida caseira da região, com buffet livre e pratos executivos. Amplo estacionamento.',
    imageUrl: 'https://picsum.photos/seed/restaurante/600/400',
    dataAIImageHint: 'restaurant facade',
    whatsapp: '5541988887777',
    instagramUsername: 'saborestrada',
    operatingHours: 'Todos os dias: 11:00-15:00 e 18:00-22:00',
    servicesOffered: ['Buffet Livre', 'Marmitex', 'Wi-Fi Grátis', 'Banheiros Limpos'],
    isPremium: true,
    latitude: -25.4411,
    longitude: -49.2908,
    averageRating: 4.5,
    reviewCount: 210,
  },
  {
    name: 'Mecânica Confiança',
    category: 'Oficina Mecânica',
    address: 'Rua das Orquídeas, 45, Campina Grande do Sul, PR',
    description: 'Especialistas em motor e suspensão para veículos pesados. Socorro 24h.',
    imageUrl: 'https://picsum.photos/seed/mecanica/600/400',
    dataAIImageHint: 'auto repair shop',
    phone: '4136765555',
    operatingHours: 'Seg-Sex: 08:00-18:30',
    servicesOffered: ['Troca de Óleo', 'Freios', 'Suspensão', 'Motor'],
    latitude: -25.2959,
    longitude: -49.0543,
    averageRating: 4.9,
    reviewCount: 88,
  },
];

const businessesWithIds: BusinessData[] = mockBusinesses.map((business, index) => ({
  ...business,
  id: `mock-${index + 1}`
}));

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);


export default function GuiaComercialPage() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BusinessCategory | 'Todas'>('Todas');

  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const requestLocation = useCallback(() => {
    setLocationStatus('loading');
    getUserLocation()
      .then(location => {
        setUserLocation(location);
        setLocationStatus('success');
      })
      .catch(error => {
        console.error("Location error:", error);
        setLocationStatus('error');
        toast({
          title: "Geolocalização Falhou",
          description: "Não foi possível obter sua localização. A lista não será ordenada por proximidade.",
          variant: "destructive"
        });
      });
  }, [toast]);

  useEffect(() => {
    // Simula o carregamento dos dados
    setBusinesses(businessesWithIds);
    setLoading(false);
    requestLocation();
  }, [requestLocation]);

  const filteredAndSortedBusinesses = useMemo(() => {
    let processedBusinesses = businesses
      .filter(business =>
        activeCategory === 'Todas' || business.category === activeCategory
      )
      .filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (userLocation && locationStatus === 'success') {
      return processedBusinesses
        .map(business => ({
          ...business,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            business.latitude || 0,
            business.longitude || 0
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    
    // Fallback sort if no location
    return processedBusinesses.sort((a, b) => a.name.localeCompare(b.name));
  }, [businesses, searchTerm, activeCategory, userLocation, locationStatus]);

  const handleRegisterClick = () => {
    if (!currentUser) {
      toast({
        title: "Login Necessário",
        description: "Você precisa fazer login para cadastrar seu comércio.",
        variant: "destructive",
        action: <ToastAction altText="Fazer Login" onClick={() => router.push('/login')}>Login</ToastAction>,
      });
      return;
    }
    setIsRegisterModalOpen(true);
  };
  
  const handleRegisterSubmit = (data: any) => {
    toast({
        title: "Cadastro em Simulação",
        description: "Funcionalidade de cadastro será implementada com o backend.",
    });
    console.log("Registering Business (Simulated):", data);
    setIsRegisterModalOpen(false);
  }

  return (
    <>
      <div className="w-full space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-2 font-headline">Guia Comercial</h1>
          <p className="text-muted-foreground">Encontre os melhores estabelecimentos na sua rota.</p>
        </div>

        <div className="sticky top-[64px] sm:top-[80px] z-30 bg-background/80 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, serviço ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-full h-11 bg-card"
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Filtrar por categoria:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
                key="Todas"
                variant={activeCategory === 'Todas' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory('Todas')}
                className="rounded-full text-xs px-3 py-1 h-auto"
            >
                Todas
            </Button>
            {businessCategories.map((category) => (
                <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full text-xs px-3 py-1 h-auto"
                >
                {category}
                </Button>
            ))}
          </div>
        </div>

        {locationStatus === 'error' && (
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Não foi possível obter sua localização</AlertTitle>
              <AlertDescription>
                  Verifique as permissões do navegador para ordenar os locais por proximidade.
                   <Button variant="link" onClick={requestLocation} className="p-0 h-auto ml-1">Tentar Novamente</Button>
              </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdPlaceholder />
          
          <div 
            onClick={handleRegisterClick}
            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors"
          >
              <PlusCircle className="h-10 w-10 mb-2"/>
              <h3 className="font-semibold text-center">Cadastre Seu Negócio</h3>
              <p className="text-xs text-center text-muted-foreground">Apareça para milhares de usuários na estrada.</p>
          </div>
          
          {loading || locationStatus === 'loading' ? (
            <div className="md:col-span-2 flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedBusinesses.length > 0 ? (
            filteredAndSortedBusinesses.map((business, index) => (
              <React.Fragment key={business.id}>
                <BusinessCard business={business} />
                {(index + 1) % 4 === 0 && <AdPlaceholder />}
              </React.Fragment>
            ))
          ) : (
             <p className="text-center text-muted-foreground py-8 md:col-span-2">
              Nenhum comércio encontrado para "{searchTerm}" na categoria "{activeCategory}".
            </p>
          )}
        </div>
      </div>
      <RegisterBusinessModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterSubmit}
      />
    </>
  );
}
