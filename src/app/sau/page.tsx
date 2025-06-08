
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, AlertTriangle, Info } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SauLocationCard from '@/components/sau/sau-location-card';
import SauFilters from '@/components/sau/sau-filters'; // Import new filter component
import { useToast } from "@/hooks/use-toast";

// Concessionaires for the filter
const concessionairesForFilter = [
  "Todos", "Via Araucária", "EPR Litoral Pioneiro", "Arteris Litoral Sul",
  "Arteris Planalto Sul", "Arteris Régis Bitencourt", "CCR PRVias",
  "CCR RioSP", "COI DER/PR"
];

const newViaAraucariaServices = ["Banheiros/Adequados para pessoas com deficiência", "Fraldários", "bebedouros", "Totens de autoatendimento", "Ambulâncias", "Outros"];

// Increased mock data with more diverse locations (approximated for Brazil)
const mockSauLocations: SAULocation[] = [
  // Via Araucária (Paraná) - Existing updated and new BSOs
  { id: 'va-1', concessionaire: 'Via Araucária', name: 'SAU Km 520 - BR-277', address: 'BR-277, Km 520, Nova Laranjeiras - PR', latitude: -25.3303, longitude: -52.5414, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-2', concessionaire: 'Via Araucária', name: 'SAU Km 450 - BR-373', address: 'BR-373, Km 450, Candói - PR', latitude: -25.6037, longitude: -52.0305, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-1', concessionaire: 'Via Araucária', name: 'BSO 1: BR-277, km 108,80 - Curitiba', address: 'BR-277, km 108,80, Curitiba - PR', latitude: -25.4284, longitude: -49.2733, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-2', concessionaire: 'Via Araucária', name: 'BSO 2: BR-277, km 165,70 - Porto Amazonas', address: 'BR-277, km 165,70, Porto Amazonas - PR', latitude: -25.5380, longitude: -49.8930, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-3', concessionaire: 'Via Araucária', name: 'BSO 3: BR-277, km 211,70 - Palmeira', address: 'BR-277, km 211,70, Palmeira - PR', latitude: -25.4290, longitude: -50.0060, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-4', concessionaire: 'Via Araucária', name: 'BSO 4: BR-277, km 256,10 - Irati', address: 'BR-277, km 256,10, Irati - PR', latitude: -25.4670, longitude: -50.6510, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-5', concessionaire: 'Via Araucária', name: 'BSO 5: BR-277, km 300,30 - Prudentópolis', address: 'BR-277, km 300,30, Prudentópolis - PR', latitude: -25.2130, longitude: -50.9770, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-6', concessionaire: 'Via Araucária', name: 'BSO 6: BR-373, km 240,40 - Guamiranga', address: 'BR-373, km 240,40, Guamiranga - PR', latitude: -25.2180, longitude: -50.7890, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-7', concessionaire: 'Via Araucária', name: 'BSO 7: BR-373, km 201,80 - Ipiranga', address: 'BR-373, km 201,80, Ipiranga - PR', latitude: -25.0270, longitude: -50.5860, services: newViaAraucariaServices, operatingHours: '24 horas' },
  { id: 'va-bso-8', concessionaire: 'Via Araucária', name: 'BSO 8: PR-423, km 15,00 - Araucária', address: 'PR-423, km 15,00, Araucária - PR', latitude: -25.5920, longitude: -49.3999, services: newViaAraucariaServices, operatingHours: '24 horas' }, // Slightly adjusted lat/lon from existing Araucaria
  { id: 'va-bso-9', concessionaire: 'Via Araucária', name: 'BSO 9: BR-476, km 188,30 - Lapa', address: 'BR-476, km 188,30, Lapa - PR', latitude: -25.7690, longitude: -49.7160, services: newViaAraucariaServices, operatingHours: '24 horas' },

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
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reviews, setReviews] = useState<SAUReview[]>([]);
  const [activeConcessionaireFilter, setActiveConcessionaireFilter] = useState<string>('Todos');
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
    requestLocation();
  }, [requestLocation]);

  const processedSaus = useMemo(() => {
    let filteredSaus = mockSauLocations;

    if (activeConcessionaireFilter !== 'Todos') {
      filteredSaus = filteredSaus.filter(sau => sau.concessionaire === activeConcessionaireFilter);
    }

    if (userLocation) {
      const sausWithDistance = filteredSaus.map(sau => ({
        ...sau,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, sau.latitude, sau.longitude),
      }));
      sausWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return sausWithDistance;
    } else {
      // Default sort if no location (e.g., by name within the filtered list)
      return [...filteredSaus].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [userLocation, activeConcessionaireFilter]);

  const handleAddReview = (newReview: Omit<SAUReview, 'id' | 'timestamp' | 'author'>, sauId: string) => {
    const fullReview: SAUReview = {
      ...newReview,
      id: `review-${Date.now()}`,
      sauId: sauId,
      author: "Usuário Anônimo", 
      timestamp: new Date().toISOString(),
    };
    setReviews(prevReviews => [...prevReviews, fullReview]);
    toast({
      title: "Avaliação Enviada!",
      description: "Obrigado por sua contribuição.",
    });
  };

  return (
    <div className="w-full space-y-6"> {/* Reduced top-level space-y from 8 to 6 */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold font-headline">Serviços de Atendimento ao Usuário (SAU)</h1> {/* Adjusted heading size */}
        <p className="text-muted-foreground">Encontre os SAUs das concessionárias.</p>
      </div>

      <SauFilters
        concessionaires={concessionairesForFilter}
        currentFilter={activeConcessionaireFilter}
        onFilterChange={setActiveConcessionaireFilter}
      />

      {locationStatus === 'loading' && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-headline">Obtendo sua localização...</AlertTitle>
          <AlertDescription>
            Por favor, aguarde para listarmos os SAUs mais próximos.
          </AlertDescription>
        </Alert>
      )}

      {locationStatus === 'error' && (
         <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline">Localização indisponível</AlertTitle>
            <AlertDescription>
                Verifique as permissões de localização e tente novamente.
                <Button variant="outline" size="sm" onClick={requestLocation} className="ml-2 mt-1 sm:mt-0">
                    Tentar Novamente
                </Button>
            </AlertDescription>
        </Alert>
      )}
      
      {/* Outer Card removed, now directly mapping SauLocationCard */}
      <div className="space-y-4">
        {processedSaus.length > 0 ? processedSaus.map(sau => {
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
          <p className="text-muted-foreground text-center py-4">
            {locationStatus !== 'loading' ? 'Nenhum SAU encontrado para os filtros selecionados.' : 'Carregando SAUs...'}
          </p>
        )}
      </div>
      
       <Alert className="mt-6"> {/* Reduced margin-top from 8 to 6 */}
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="font-headline">Sobre os SAUs</AlertTitle>
          <AlertDescription>
            Os SAUs são pontos de apoio das concessionárias, oferecendo serviços como banheiros, água e informações.
          </AlertDescription>
        </Alert>
    </div>
  );
}

