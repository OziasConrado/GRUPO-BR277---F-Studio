
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

const standardSauServices = ["Banheiros/Adequados para pessoas com deficiência", "Fraldários", "bebedouros", "Totens de autoatendimento", "Ambulâncias", "Outros"];

// Increased mock data with more diverse locations (approximated for Brazil)
const mockSauLocations: SAULocation[] = [
  // Via Araucária (Paraná) - Existing updated and new BSOs
  { id: 'va-1', concessionaire: 'Via Araucária', name: 'SAU Km 520 - BR-277', address: 'BR-277, Km 520, Nova Laranjeiras - PR', latitude: -25.3303, longitude: -52.5414, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-2', concessionaire: 'Via Araucária', name: 'SAU Km 450 - BR-373', address: 'BR-373, Km 450, Candói - PR', latitude: -25.6037, longitude: -52.0305, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-1', concessionaire: 'Via Araucária', name: 'BSO 1: BR-277, km 108,80 - Curitiba', address: 'BR-277, km 108,80, Curitiba - PR', latitude: -25.4284, longitude: -49.2733, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-2', concessionaire: 'Via Araucária', name: 'BSO 2: BR-277, km 165,70 - Porto Amazonas', address: 'BR-277, km 165,70, Porto Amazonas - PR', latitude: -25.5380, longitude: -49.8930, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-3', concessionaire: 'Via Araucária', name: 'BSO 3: BR-277, km 211,70 - Palmeira', address: 'BR-277, km 211,70, Palmeira - PR', latitude: -25.4290, longitude: -50.0060, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-4', concessionaire: 'Via Araucária', name: 'BSO 4: BR-277, km 256,10 - Irati', address: 'BR-277, km 256,10, Irati - PR', latitude: -25.4670, longitude: -50.6510, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-5', concessionaire: 'Via Araucária', name: 'BSO 5: BR-277, km 300,30 - Prudentópolis', address: 'BR-277, km 300,30, Prudentópolis - PR', latitude: -25.2130, longitude: -50.9770, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-6', concessionaire: 'Via Araucária', name: 'BSO 6: BR-373, km 240,40 - Guamiranga', address: 'BR-373, km 240,40, Guamiranga - PR', latitude: -25.2180, longitude: -50.7890, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-7', concessionaire: 'Via Araucária', name: 'BSO 7: BR-373, km 201,80 - Ipiranga', address: 'BR-373, km 201,80, Ipiranga - PR', latitude: -25.0270, longitude: -50.5860, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-8', concessionaire: 'Via Araucária', name: 'BSO 8: PR-423, km 15,00 - Araucária', address: 'PR-423, km 15,00, Araucária - PR', latitude: -25.5920, longitude: -49.3999, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'va-bso-9', concessionaire: 'Via Araucária', name: 'BSO 9: BR-476, km 188,30 - Lapa', address: 'BR-476, km 188,30, Lapa - PR', latitude: -25.7690, longitude: -49.7160, services: standardSauServices, operatingHours: '24 horas' },

  // EPR Litoral Pioneiro (Paraná) - New BSOs
  { id: 'epr-lp-bso-1', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 1: BR-369, Km 68,2 - Santa Mariana', address: 'BR-369, Km 68,2, Santa Mariana - PR', latitude: -23.145, longitude: -50.565, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-2', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 2: BR-369, Km 10 - Cambará', address: 'BR-369, Km 10, Cambará - PR', latitude: -23.048, longitude: -50.073, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-3', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 3: BR-153, Km 31,4 - Santo Antônio da Platina', address: 'BR-153, Km 31,4, Santo Antônio da Platina - PR', latitude: -23.295, longitude: -50.079, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-4', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 4: PR-092, Km 300,4 - Quatiguá', address: 'PR-092, Km 300,4, Quatiguá - PR', latitude: -23.573, longitude: -50.134, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-5', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 5: PR-092, Km 255,3 - Wenceslau Braz', address: 'PR-092, Km 255,3, Wenceslau Braz - PR', latitude: -23.875, longitude: -49.806, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-6', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 6: PR-092, Km 217 - Arapoti', address: 'PR-092, Km 217, Arapoti - PR', latitude: -24.156, longitude: -49.829, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-7', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 7: BR-153, Km 187,4 - Sengés', address: 'BR-153, Km 187,4, Sengés - PR', latitude: -24.113, longitude: -49.563, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-8', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 8: PR-151, Km 252,8 - Piraí do Sul', address: 'PR-151, Km 252,8, Piraí do Sul - PR', latitude: -24.527, longitude: -49.941, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-9', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 9: PR-151, Km 305,2 - Carambeí', address: 'PR-151, Km 305,2, Carambeí - PR', latitude: -24.917, longitude: -50.098, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-10', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 10: BR-277, Km 60,6 - São José dos Pinhais', address: 'BR-277, Km 60,6, São José dos Pinhais - PR', latitude: -25.5546, longitude: -49.0011, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-11', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 11: BR-277, Km 10,7 - Paranaguá', address: 'BR-277, Km 10,7, Paranaguá - PR', latitude: -25.520, longitude: -48.530, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'epr-lp-bso-12', concessionaire: 'EPR Litoral Pioneiro', name: 'BSO 12: BR-277, Km 35 - Morretes', address: 'BR-277, Km 35, Morretes - PR', latitude: -25.470, longitude: -48.830, services: standardSauServices, operatingHours: '24 horas' },

  // Arteris Litoral Sul (Paraná/Santa Catarina) - Updated
  { id: 'als-1', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 1.3 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 1.3 (sentido Sul), Garuva - SC', latitude: -26.0261, longitude: -48.8519, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-2', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 46.8 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 46.8 (sentido Norte), Joinville - SC', latitude: -26.3031, longitude: -48.8416, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-3', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 79.4 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 79.4 (sentido Sul), Araquari - SC', latitude: -26.3708, longitude: -48.7222, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-4', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 129.8 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 129.8 (sentido Norte), Camboriú - SC', latitude: -27.0272, longitude: -48.6303, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-5', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 157.4 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 157.4 (sentido Sul), Porto Belo - SC', latitude: -27.1575, longitude: -48.5528, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-6', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 192.4 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 192.4 (sentido Norte), Biguaçu - SC', latitude: -27.4931, longitude: -48.6544, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-7', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 243 (Norte) - BR-101/SC', address: 'BR-101/SC, Km 243 (sentido Norte), Palhoça - SC', latitude: -27.6464, longitude: -48.6678, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-8', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 205 (Sul) - BR-101/SC', address: 'BR-101/SC, Km 205 (sentido Sul), São José - SC', latitude: -27.6146, longitude: -48.6280, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-9', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 90.3 (Sul) - BR-116/PR (Contorno Leste)', address: 'BR-116/PR (Contorno Leste), Km 90.3 (sentido Sul), Piraquara - PR', latitude: -25.4442, longitude: -49.0628, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'als-10', concessionaire: 'Arteris Litoral Sul', name: 'SAU Km 635.4 (Norte) - BR-376/PR', address: 'BR-376/PR, Km 635.4 (sentido Norte), São José dos Pinhais - PR', latitude: -25.5313, longitude: -49.1959, services: standardSauServices, operatingHours: '24 horas' },
  
  // Arteris Planalto Sul (Paraná/Santa Catarina) - Updated
  { id: 'aps-new-1', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 42 - BR-116', address: 'BR-116, Km 42, Itaiópolis - SC', latitude: -26.3312, longitude: -49.9015, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-2', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 82 - BR-116', address: 'BR-116, Km 82, Monte Castelo - SC', latitude: -26.4530, longitude: -50.2300, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-3', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 120 - BR-116', address: 'BR-116, Km 120, Monte Castelo - SC', latitude: -26.6200, longitude: -50.3200, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-4', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 152 - BR-116', address: 'BR-116, Km 152, Santa Cecília - SC', latitude: -26.9450, longitude: -50.4320, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-5', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 195 - BR-116', address: 'BR-116, Km 195, São Cristóvão do Sul - SC', latitude: -27.2780, longitude: -50.4250, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-6', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 233 - BR-116', address: 'BR-116, Km 233, Correia Pinto - SC', latitude: -27.5860, longitude: -50.3610, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-7', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 276 - BR-116', address: 'BR-116, Km 276, Capão Alto - SC', latitude: -27.9350, longitude: -50.5040, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-8', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 134 - BR-116', address: 'BR-116, Km 134, Fazenda Rio Grande - PR', latitude: -25.6578, longitude: -49.3103, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'aps-new-9', concessionaire: 'Arteris Planalto Sul', name: 'SAU Km 204 - BR-116', address: 'BR-116, Km 204, Rio Negro - PR', latitude: -26.0980, longitude: -49.7950, services: standardSauServices, operatingHours: '24 horas' },
  
  // Arteris Régis Bittencourt (São Paulo/Paraná) - Updated
  { id: 'arb-new-1', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 287 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 287 (sentido Curitiba), Itapecerica da Serra - SP', latitude: -23.7169, longitude: -46.8487, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-2', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 299 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 299 (sentido Curitiba), São Lourenço da Serra - SP', latitude: -23.8614, longitude: -46.9419, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-3', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 343 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 343 (sentido São Paulo), Miracatu - SP', latitude: -24.2796, longitude: -47.4612, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-4', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 357 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 357 (sentido Curitiba), Miracatu - SP', latitude: -24.2796, longitude: -47.4612, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-5', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 370 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 370 (sentido São Paulo), Miracatu - SP', latitude: -24.2796, longitude: -47.4612, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-6', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 426 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 426 (sentido Curitiba), Juquiá - SP', latitude: -24.3194, longitude: -47.6369, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-7', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 485 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 485 (sentido São Paulo), Cajati - SP', latitude: -24.7378, longitude: -48.1042, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-8', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 542 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 542 (sentido Curitiba), Barra do Turvo - SP', latitude: -24.9111, longitude: -48.3653, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-9', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 31 (Sentido São Paulo) - BR-116', address: 'BR-116, Km 31 (sentido São Paulo), Campina Grande do Sul - PR', latitude: -25.3033, longitude: -49.0528, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-10', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 57 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 57 (sentido Curitiba), Campina Grande do Sul - PR', latitude: -25.3033, longitude: -49.0528, services: standardSauServices, operatingHours: '24 horas' },
  { id: 'arb-new-11', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU Km 70 (Sentido Curitiba) - BR-116', address: 'BR-116, Km 70 (sentido Curitiba), Quatro Barras - PR', latitude: -25.3683, longitude: -49.0769, services: standardSauServices, operatingHours: '24 horas' },
  
  // CCR PRVias (Paraná) - Renamed to Via Araucária for some stretches, keeping as example if distinct.
  { id: 'ccr-prv-1', concessionaire: 'CCR PRVias', name: 'SAU Km 200 - BR-376', address: 'BR-376, Km 200, Ponta Grossa - PR', latitude: -25.0907, longitude: -50.2632, services: ['Banheiros', 'Água', 'Wi-Fi'], operatingHours: '24 horas' },
  // CCR RioSP (Rio de Janeiro/São Paulo)
  { id: 'ccr-rsp-1', concessionaire: 'CCR RioSP', name: 'SAU Km 229 - BR-116 (Via Dutra)', address: 'BR-116, Km 229, Piraí - RJ', latitude: -22.6292, longitude: -43.8984, services: ['Banheiros', 'Água', 'Atendimento 24h'], operatingHours: '24 horas' },
  { id: 'ccr-rsp-2', concessionaire: 'CCR RioSP', name: 'SAU Km 150 - BR-116 (Via Dutra)', address: 'BR-116, Km 150, Jacareí - SP', latitude: -23.3047, longitude: -45.9620, services: ['Banheiros', 'Fraldário', 'Restaurante'], operatingHours: '24 horas' },
  // COI DER/PR (Paraná - Operated by DER)
  { id: 'coi-der-1', concessionaire: 'COI DER/PR', name: 'Posto de Apoio PR-445 Km 50', address: 'PR-445, Km 50, Londrina - PR', latitude: -23.3874, longitude: -51.1311, services: ['Banheiros', 'Informações'], operatingHours: '08:00 - 18:00' },
].filter(sau => sau.concessionaire !== 'Arteris Régis Bitencourt' || sau.id.startsWith('arb-new-')); // Keep new ARB, remove old ARB

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
