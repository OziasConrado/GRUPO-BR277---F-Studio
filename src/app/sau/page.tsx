
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
  "Todos", "Via Araucária", "EPR Litoral Pioneiro", "Arteris Litoral Sul",
  "Arteris Planalto Sul", "Arteris Régis Bitencourt", "CCR PRVias",
  "CCR RioSP"
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


  const fetchSausAndReviews = useCallback(async () => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao banco de dados." });
      setLoadingSaus(false);
      setLoadingReviews(false);
      return;
    }
    setLoadingSaus(true);
    setLoadingReviews(true);

    try {
      // Fetch SAUs
      const sausCollection = collection(firestore, 'sau_locations');
      const qSaus = query(sausCollection); // REMOVED orderBy to prevent index errors
      const sauSnapshot = await getDocs(qSaus);
      const fetchedSaus: SAULocation[] = sauSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          concessionaire: data.concessionaire,
          name: data.name,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          services: data.services || [],
          operatingHours: data.operatingHours,
        } as SAULocation;
      });
      setSauLocations(fetchedSaus);
    } catch (error) {
      console.error("Error fetching SAUs: ", error);
      toast({ variant: "destructive", title: "Erro ao Carregar SAUs", description: "Não foi possível buscar os SAUs." });
    } finally {
      setLoadingSaus(false);
    }

    try {
        // Fetch all Reviews
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
        toast({ variant: "destructive", title: "Erro ao Carregar Avaliações", description: "Não foi possível buscar as avaliações dos SAUs." });
    } finally {
        setLoadingReviews(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchSausAndReviews();
  }, [fetchSausAndReviews]);


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
          // toast({ // Can be noisy
          //   title: "Erro de Localização",
          //   description: "Não foi possível obter sua localização. Mostrando SAUs em ordem padrão.",
          //   variant: "default"
          // });
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
      const sausWithDistance = sausWithAggregatedReviews.map(sau => ({
        ...sau,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, sau.latitude, sau.longitude),
      }));
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
