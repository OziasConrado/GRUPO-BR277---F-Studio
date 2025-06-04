
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, Navigation, AlertTriangle, Info, Star, MessageSquare } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SauLocationCard from '@/components/sau/sau-location-card';
import { useToast } from "@/hooks/use-toast";

const concessionaires = [
  "Via Araucária", "EPR Litoral Pioneiro", "Arteris Litoral Sul",
  "Arteris Planalto Sul", "Arteris Régis Bitencourt", "CCR PRVias",
  "CCR RioSP", "COI DER/PR"
];

// Increased mock data with more diverse locations (approximated for Brazil)
const mockSauLocations: SAULocation[] = [
  // Via Araucária (Paraná)
  { id: 'va-1', concessionaire: 'Via Araucária', name: 'SAU Km 520 - BR-277', address: 'BR-277, Km 520, Nova Laranjeiras - PR', latitude: -25.3303, longitude: -52.5414, services: ['Banheiros', 'Água', 'Wi-Fi', 'Totem Infos'], operatingHours: '24 horas' },
  { id: 'va-2', concessionaire: 'Via Araucária', name: 'SAU Km 450 - BR-373', address: 'BR-373, Km 450, Candói - PR', latitude: -25.6037, longitude: -52.0305, services: ['Banheiros', 'Fraldário', 'Água'], operatingHours: '24 horas' },
  // EPR Litoral Pioneiro (Paraná)
  { id: 'epr-lp-1', concessionaire: 'EPR Litoral Pioneiro', name: 'SAU Km 60 - BR-277', address: 'BR-277, Km 60, São José dos Pinhais - PR', latitude: -25.5546, longitude: -49.0011, services: ['Banheiros', 'Água', 'Atendimento Médico'], operatingHours: '24 horas' },
  { id: 'epr-lp-2', concessionaire: 'EPR Litoral Pioneiro', name: 'SAU Km 25 - PR-407', address: 'PR-407, Km 25, Paranaguá - PR', latitude: -25.5924, longitude: -48.5458, services: ['Banheiros', 'Wi-Fi', 'Segurança'], operatingHours: '07:00 - 19:00' },
  // Arteris Litoral Sul (Paraná/Santa Catarina)
  { id: 'als-1', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 668 - BR-376', address: 'BR-376, Km 668, Guaratuba - PR', latitude: -25.8889, longitude: -48.6782, services: ['Banheiros', 'Água', 'Guincho', 'Wi-Fi'], operatingHours: '24 horas' },
  { id: 'als-2', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 10 - BR-101', address: 'BR-101, Km 10, Garuva - SC', latitude: -26.0373, longitude: -48.8384, services: ['Banheiros', 'Fraldário', 'Café'], operatingHours: '24 horas' },
  // Arteris Planalto Sul (Paraná/Santa Catarina)
  { id: 'aps-1', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 134 - BR-116', address: 'BR-116, Km 134, Fazenda Rio Grande - PR', latitude: -25.6578, longitude: -49.3103, services: ['Banheiros', 'Água', 'Mecânico Básico'], operatingHours: '24 horas' },
  { id: 'aps-2', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 298 - BR-116', address: 'BR-116, Km 298, Capão Alto - SC', latitude: -27.9286, longitude: -50.4953, services: ['Banheiros', 'Wi-Fi'], operatingHours: '06:00 - 22:00' },
  // Arteris Régis Bittencourt (São Paulo/Paraná)
  { id: 'arb-1', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 357 - BR-116', address: 'BR-116, Km 357, Miracatu - SP', latitude: -24.2796, longitude: -47.4612, services: ['Banheiros', 'Água', 'Ambulância'], operatingHours: '24 horas' },
  { id: 'arb-2', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 545 - BR-116', address: 'BR-116, Km 545, Barra do Turvo - SP', latitude: -24.9111, longitude: -48.3653, services: ['Banheiros', 'Água', 'Guincho'], operatingHours: '24 horas' },
  // CCR PRVias (Paraná) - Renamed to Via Araucária for some stretches, keeping as example if distinct.
  { id: 'ccr-prv-1', concessionaire: 'CCR PRVias', name: 'SAU Km 200 - BR-376', address: 'BR-376, Km 200, Ponta Grossa - PR', latitude: -25.0907, longitude: -50.2632, services: ['Banheiros', 'Água', 'Wi-Fi'], operatingHours: '24 horas' },
  // CCR RioSP (Rio de Janeiro/São Paulo)
  { id: 'ccr-rsp-1', concessionaire: 'CCR RioSP', name: 'SAU Km 229 - BR-116 (Via Dutra)', address: 'BR-116, Km 229, Piraí - RJ', latitude: -22.6292, longitude: -43.8984, services: ['Banheiros', 'Água', 'Atendimento 24h'], operatingHours: '24 horas' },
  { id: 'ccr-rsp-2', concessionaire: 'CCR RioSP', name: 'SAU Km 150 - BR-116 (Via Dutra)', address: 'BR-116, Km 150, Jacareí - SP', latitude: -23.3047, longitude: -45.9620, services: ['Banheiros', 'Fraldário', 'Restaurante'], operatingHours: '24 horas' },
  // COI DER/PR (Paraná - Operated by DER)
  { id: 'coi-der-1', concessionaire: 'COI DER/PR', name: 'Posto de Apoio PR-445 Km 50', address: 'PR-445, Km 50, Londrina - PR', latitude: -23.3874, longitude: -51.1311, services: ['Banheiros', 'Informações'], operatingHours: '08:00 - 18:00' },
];


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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

export default function SAUPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortedSaus, setSortedSaus] = useState<SAULocation[]>(mockSauLocations);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reviews, setReviews] = useState<SAUReview[]>([]);
  const { toast } = useToast();

  const requestLocation = useCallback(() => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          toast({
            title: "Erro de Localização",
            description: "Não foi possível obter sua localização. Mostrando SAUs em ordem padrão.",
            variant: "destructive"
          });
        }
      );
    } else {
      setLocationStatus('error');
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    // Request location on initial load
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (userLocation) {
      const sausWithDistance = mockSauLocations.map(sau => ({
        ...sau,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, sau.latitude, sau.longitude),
      }));
      sausWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      setSortedSaus(sausWithDistance);
    } else {
      // Default sort if no location (e.g., by concessionaire then name)
      const defaultSorted = [...mockSauLocations].sort((a, b) => {
        if (a.concessionaire < b.concessionaire) return -1;
        if (a.concessionaire > b.concessionaire) return 1;
        return a.name.localeCompare(b.name);
      });
      setSortedSaus(defaultSorted);
    }
  }, [userLocation]);

  const handleAddReview = (newReview: Omit<SAUReview, 'id' | 'timestamp' | 'author'>, sauId: string) => {
    const fullReview: SAUReview = {
      ...newReview,
      id: `review-${Date.now()}`,
      sauId: sauId,
      author: "Usuário Anônimo", // Or get from user profile if available
      timestamp: new Date().toISOString(),
    };
    setReviews(prevReviews => [...prevReviews, fullReview]);
    toast({
      title: "Avaliação Enviada!",
      description: "Obrigado por sua contribuição.",
    });
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold font-headline">Serviços de Atendimento ao Usuário (SAU)</h1>
        <p className="text-muted-foreground">Encontre os SAUs das concessionárias mais próximos de você.</p>
      </div>

      {locationStatus === 'loading' && (
        <Alert className="glassmorphic">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-headline">Obtendo sua localização...</AlertTitle>
          <AlertDescription>
            Por favor, aguarde enquanto tentamos determinar sua posição para listar os SAUs mais próximos.
          </AlertDescription>
        </Alert>
      )}

      {locationStatus === 'error' && (
         <Alert variant="destructive" className="glassmorphic">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline">Não foi possível obter sua localização</AlertTitle>
            <AlertDescription>
                Verifique as permissões de localização do seu navegador e tente novamente.
                Mostrando SAUs em ordem padrão.
                <Button variant="outline" size="sm" onClick={requestLocation} className="ml-2 mt-1 sm:mt-0">
                    Tentar Novamente
                </Button>
            </AlertDescription>
        </Alert>
      )}
      
      {locationStatus !== 'loading' && (
        <Card className="glassmorphic rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
                <MapPin className="mr-2 h-6 w-6 text-primary"/> Lista de SAUs
            </CardTitle>
            <CardDescription>
              {userLocation ? "Ordenados por proximidade." : "Ordenados por concessionária."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedSaus.length > 0 ? sortedSaus.map(sau => {
              const sauReviews = reviews.filter(r => r.sauId === sau.id);
              let averageRating = 0;
              if (sauReviews.length > 0) {
                averageRating = sauReviews.reduce((sum, r) => sum + r.rating, 0) / sauReviews.length;
              }
              return (
                <SauLocationCard
                  key={sau.id}
                  sau={{...sau, averageRating, reviewCount: sauReviews.length}}
                  reviews={sauReviews}
                  onAddReview={(reviewData) => handleAddReview(reviewData, sau.id)}
                />
              );
            }) : (
              <p className="text-muted-foreground text-center py-4">Nenhum SAU encontrado.</p>
            )}
          </CardContent>
        </Card>
      )}
       <Alert className="glassmorphic mt-8">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="font-headline">Sobre os SAUs</AlertTitle>
          <AlertDescription>
            Os SAUs (Serviços de Atendimento ao Usuário) são pontos de apoio mantidos pelas concessionárias de rodovias, oferecendo diversos serviços para os viajantes, como banheiros, água, informações e, em alguns casos, atendimento emergencial.
          </AlertDescription>
        </Alert>
    </div>
  );
}
