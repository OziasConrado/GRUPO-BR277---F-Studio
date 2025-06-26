
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react'; // Import React for React.Fragment
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MapPin, AlertTriangle, Info } from 'lucide-react';
import type { SAULocation, SAUReview } from '@/types/sau';
import SauLocationCard from '@/components/sau/sau-location-card';
import SauFilters from '@/components/sau/sau-filters';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

const concessionairesForFilter = [
  "Todos", "EPR IGUAÇU", "Via Araucária", "EPR Litoral Pioneiro", "Arteris Litoral Sul",
  "Arteris Planalto Sul", "Arteris Régis Bitencourt", "CCR PRVias",
  "CCR RioSP"
];

const allSausData: SAULocation[] = [
  // EPR IGUAÇU
  { id: 'epr-iguacu-1', concessionaire: 'EPR IGUAÇU', name: 'SAU 01 - BR-277, km 310', address: 'Prudentópolis/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.21, longitude: -50.98 },
  { id: 'epr-iguacu-2', concessionaire: 'EPR IGUAÇU', name: 'SAU 02 - BR-277, km 381', address: 'Candói/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.56, longitude: -51.65 },
  { id: 'epr-iguacu-3', concessionaire: 'EPR IGUAÇU', name: 'SAU 03 - BR-277, km 454', address: 'Laranjeiras do Sul/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.41, longitude: -52.41 },
  { id: 'epr-iguacu-4', concessionaire: 'EPR IGUAÇU', name: 'SAU 04 - BR-277, km 519', address: 'Guaraniaçu/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.09, longitude: -52.88 },
  { id: 'epr-iguacu-5', concessionaire: 'EPR IGUAÇU', name: 'SAU 05 - BR-277, km 574', address: 'Cascavel/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -24.96, longitude: -53.46 },
  { id: 'epr-iguacu-6', concessionaire: 'EPR IGUAÇU', name: 'SAU 06 - BR-277, km 664', address: 'Matelândia/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.25, longitude: -53.99 },
  { id: 'epr-iguacu-7', concessionaire: 'EPR IGUAÇU', name: 'SAU 07 - BR-163, km 711', address: 'Santa Terezinha de Itaipu/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.43, longitude: -54.49 },
  { id: 'epr-iguacu-8', concessionaire: 'EPR IGUAÇU', name: 'SAU 08 - PR-182, km 177', address: 'Lindoeste/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.26, longitude: -53.54 },
  { id: 'epr-iguacu-9', concessionaire: 'EPR IGUAÇU', name: 'SAU 09 - PR-182, km 128', address: 'Marmelândia/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.64, longitude: -53.77 },
  { id: 'epr-iguacu-10', concessionaire: 'EPR IGUAÇU', name: 'SAU 10 - PR-280, km 521', address: 'Ampére/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.92, longitude: -53.46 },
  { id: 'epr-iguacu-11', concessionaire: 'EPR IGUAÇU', name: 'SAU 11 - PR-280, km 247', address: 'Renascença/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -26.15, longitude: -52.97 },

  // Via Araucária
  { id: 'via-araucaria-1', concessionaire: 'Via Araucária', name: 'SAU 01 - BR-277, km 107', address: 'Campo Largo/PR', services: ['Banheiro', 'Água', 'Wi-Fi'], operatingHours: '24 horas', latitude: -25.45, longitude: -49.52 },
  { id: 'via-araucaria-2', concessionaire: 'Via Araucária', name: 'SAU 02 - BR-277, km 152', address: 'Palmeira/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -25.42, longitude: -50.00 },
  { id: 'via-araucaria-3', concessionaire: 'Via Araucária', name: 'SAU 03 - BR-277, km 233', address: 'Irati/PR', services: ['Banheiro', 'Água', 'Wi-Fi', 'Totem'], operatingHours: '24 horas', latitude: -25.47, longitude: -50.65 },

  // EPR Litoral Pioneiro
  { id: 'epr-litoral-1', concessionaire: 'EPR Litoral Pioneiro', name: 'SAU 01 - PR-407, km 12', address: 'Pontal do Paraná/PR', services: ['Banheiro', 'Água'], operatingHours: '24 horas', latitude: -25.58, longitude: -48.56 },
  { id: 'epr-litoral-2', concessionaire: 'EPR Litoral Pioneiro', name: 'SAU 02 - PR-092, km 280', address: 'Wenceslau Braz/PR', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -23.87, longitude: -49.80 },

  // Arteris Litoral Sul
  { id: 'arteris-litoral-1', concessionaire: 'Arteris Litoral Sul', name: 'SAU 01 - BR-376, km 658', address: 'Tijucas do Sul/PR', services: ['Banheiro', 'Água', 'Wi-Fi'], operatingHours: '24 horas', latitude: -25.93, longitude: -49.19 },
  { id: 'arteris-litoral-2', concessionaire: 'Arteris Litoral Sul', name: 'SAU 02 - BR-101, km 157', address: 'Porto Belo/SC', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -27.15, longitude: -48.55 },

  // Arteris Planalto Sul
  { id: 'arteris-planalto-1', concessionaire: 'Arteris Planalto Sul', name: 'SAU 01 - BR-116, km 198', address: 'Rio Negro/PR', services: ['Banheiro', 'Água'], operatingHours: '24 horas', latitude: -26.10, longitude: -49.79 },
  { id: 'arteris-planalto-2', concessionaire: 'Arteris Planalto Sul', name: 'SAU 02 - BR-116, km 287', address: 'Correia Pinto/SC', services: ['Banheiro', 'Água', 'Wi-Fi'], operatingHours: '24 horas', latitude: -27.58, longitude: -50.36 },

  // Arteris Régis Bitencourt
  { id: 'arteris-regis-1', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU 01 - BR-116, km 426', address: 'Juquiá/SP', services: ['Banheiro', 'Água'], operatingHours: '24 horas', latitude: -24.32, longitude: -47.63 },
  { id: 'arteris-regis-2', concessionaire: 'Arteris Régis Bitencourt', name: 'SAU 02 - BR-116, km 548', address: 'Barra do Turvo/SP', services: ['Banheiro', 'Água', 'Informações'], operatingHours: '24 horas', latitude: -24.75, longitude: -48.50 },
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

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function SAUPage() {
  const [sauLocations, setSauLocations] = useState<SAULocation[]>([]);
  const [loadingSaus, setLoadingSaus] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reviews, setReviews] = useState<SAUReview[]>([]); // All reviews, fetched once
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeConcessionaireFilter, setActiveConcessionaireFilter] = useState<string>('Todos');
  const { toast } = useToast();
  const { currentUser } = useAuth();


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
    const loadDataAndLocation = async () => {
      // Set hardcoded SAUs immediately
      setSauLocations(allSausData);
      setLoadingSaus(false);

      // Fetch reviews from Firestore
      if (firestore) {
        setLoadingReviews(true);
        try {
            const reviewsCollection = collection(firestore, 'sau_reviews');
            const qReviews = query(reviewsCollection, orderBy('timestamp', 'desc'));
            const reviewSnapshot = await getDocs(qReviews);
            const fetchedReviews: SAUReview[] = reviewSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    sauId: data.sauId,
                    author: data.author,
                    rating: data.rating,
                    comment: data.comment,
                    timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
                } as SAUReview;
            });
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching SAU reviews: ", error);
            toast({ variant: "destructive", title: "Erro ao Carregar Avaliações", description: "Não foi possível buscar as avaliações." });
        } finally {
            setLoadingReviews(false);
        }
      } else {
        setLoadingReviews(false);
      }
      
      requestLocation();
    };

    loadDataAndLocation();
  }, [requestLocation, toast]);
  

  const processedSaus = useMemo(() => {
    let filteredSaus = sauLocations;

    if (activeConcessionaireFilter !== 'Todos') {
      filteredSaus = filteredSaus.filter(sau => sau.concessionaire === activeConcessionaireFilter);
    }

    const sausWithAggregatedReviews = filteredSaus.map(sau => {
        const sauSpecificReviews = reviews.filter(r => r.sauId === sau.id);
        let averageRating = 0;
        if (sauSpecificReviews.length > 0) {
            averageRating = sauSpecificReviews.reduce((sum, r) => sum + r.rating, 0) / sauSpecificReviews.length;
        }
        return {
            ...sau,
            averageRating,
            reviewCount: sauSpecificReviews.length,
        };
    });


    if (userLocation && locationStatus === 'success') {
      const sausWithDistance = sausWithAggregatedReviews.map(sau => {
        const distance = (sau.latitude && sau.longitude)
          ? calculateDistance(userLocation.latitude, userLocation.longitude, sau.latitude, sau.longitude)
          : Infinity;
        return { ...sau, distance };
      });
      sausWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return sausWithDistance;
    } else {
      return [...sausWithAggregatedReviews].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [sauLocations, reviews, userLocation, locationStatus, activeConcessionaireFilter]);

  const handleAddReview = async (newReviewData: Omit<SAUReview, 'id' | 'timestamp' | 'author' | 'sauId'>, sauId: string) => {
    if (!currentUser || !firestore) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para avaliar ou serviço indisponível." });
      return;
    }

    const reviewToSave = {
      ...newReviewData,
      sauId: sauId,
      author: currentUser.displayName || "Usuário Anônimo",
      userId: currentUser.uid,
      timestamp: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(firestore, 'sau_reviews'), reviewToSave);
      const addedReview: SAUReview = {
          ...reviewToSave,
          id: docRef.id,
          // @ts-ignore
          timestamp: new Date().toISOString() // For optimistic update
      };
      setReviews(prevReviews => [addedReview, ...prevReviews]);
      toast({
        title: "Avaliação Enviada!",
        description: "Obrigado por sua contribuição.",
      });
    } catch (error) {
        console.error("Error adding SAU review: ", error);
        toast({ variant: "destructive", title: "Erro ao Enviar Avaliação", description: "Não foi possível salvar sua avaliação." });
    }
  };

  const isLoading = loadingSaus || loadingReviews || locationStatus === 'loading';

  return (
    <div className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold font-headline">Serviços de Atendimento ao Usuário (SAU)</h1>
        <p className="text-muted-foreground">Encontre os SAUs das concessionárias.</p>
      </div>

      <SauFilters
        concessionaires={concessionairesForFilter}
        currentFilter={activeConcessionaireFilter}
        onFilterChange={setActiveConcessionaireFilter}
      />

      <AdPlaceholder />

      {isLoading && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-headline">Carregando SAUs e Avaliações...</AlertTitle>
          <AlertDescription>
            Buscando informações e {locationStatus === 'loading' ? "tentando obter sua localização..." : "calculando distâncias..."}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && locationStatus === 'error' && (
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

      <div className="space-y-4">
        {!isLoading && processedSaus.length > 0 ? processedSaus.map((sau, index) => {
          const sauSpecificReviews = reviews.filter(r => r.sauId === sau.id);
          return (
            <React.Fragment key={sau.id}>
              <SauLocationCard
                sau={sau} // already has aggregated review data from processedSaus
                reviews={sauSpecificReviews} // Pass filtered reviews for this SAU
                onAddReview={(reviewData) => handleAddReview(reviewData, sau.id)}
              />
              {(index + 1) % 3 === 0 && index < processedSaus.length - 1 && (
                <AdPlaceholder />
              )}
            </React.Fragment>
          );
        }) : !isLoading && (
          <p className="text-muted-foreground text-center py-4">
            Nenhum SAU encontrado para os filtros selecionados.
          </p>
        )}
      </div>

       <Alert className="mt-6">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="font-headline">Sobre os SAUs</AlertTitle>
          <AlertDescription>
            Os SAUs são pontos de apoio das concessionárias, oferecendo serviços como banheiros, água e informações.
          </AlertDescription>
        </Alert>
    </div>
  );
}
