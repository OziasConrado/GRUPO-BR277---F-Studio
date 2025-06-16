
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Map, Loader2 } from "lucide-react";
import type { TouristPointData } from '@/types/turismo';
import TouristPointCard from '@/components/turismo/tourist-point-card';
import type { BusinessData } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert imports
import { cn } from '@/lib/utils'; // Added cn import

const AdPlaceholder = ({ className }: { className?: string }) => ( // Modified AdPlaceholder
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function TurismoPage() {
  const { toast } = useToast();
  const [paranaPoints, setParanaPoints] = useState<TouristPointData[]>([]);
  const [loadingTouristPoints, setLoadingTouristPoints] = useState(true);
  const [accommodations, setAccommodations] = useState<BusinessData[]>([]);
  const [loadingAccommodations, setLoadingAccommodations] = useState(true);

  useEffect(() => {
    const fetchTouristPoints = async () => {
      if (!firestore) {
        toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao banco de dados." });
        setLoadingTouristPoints(false);
        return;
      }
      setLoadingTouristPoints(true);
      try {
        const pointsCollection = collection(firestore, 'tourist_points');
        const q = query(pointsCollection, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedPoints: TouristPointData[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            locationName: data.locationName,
            description: data.description,
            imageUrl: data.imageUrl,
            dataAIImageHint: data.dataAIImageHint,
            category: data.category,
            // averageRating: data.averageRating,
            // reviewCount: data.reviewCount,
          } as TouristPointData;
        });
        setParanaPoints(fetchedPoints);
      } catch (error) {
        console.error("Error fetching tourist points: ", error);
        toast({ variant: "destructive", title: "Erro ao Carregar Pontos Turísticos", description: "Não foi possível buscar os pontos turísticos." });
      } finally {
        setLoadingTouristPoints(false);
      }
    };

    const fetchAccommodations = async () => {
      if (!firestore) {
        // Toast already shown by fetchTouristPoints if firestore is null
        setLoadingAccommodations(false);
        return;
      }
      setLoadingAccommodations(true);
      try {
        const businessesCollection = collection(firestore, 'businesses');
        const q = query(businessesCollection, where('category', '==', 'Hotel/Pousada'), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedAccommodations: BusinessData[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            category: data.category,
            address: data.address,
            phone: data.phone,
            whatsapp: data.whatsapp,
            description: data.description,
            imageUrl: data.imageUrl,
            dataAIImageHint: data.dataAIImageHint,
            operatingHours: data.operatingHours,
            isPremium: data.isPremium,
            latitude: data.latitude,
            longitude: data.longitude,
            instagramUsername: data.instagramUsername,
            averageRating: data.averageRating,
            reviewCount: data.reviewCount,
          } as BusinessData;
        });
        setAccommodations(fetchedAccommodations);
      } catch (error) {
        console.error("Error fetching accommodations: ", error);
        toast({ variant: "destructive", title: "Erro ao Carregar Hospedagens", description: "Não foi possível buscar as sugestões de hospedagem." });
      } finally {
        setLoadingAccommodations(false);
      }
    };

    fetchTouristPoints();
    fetchAccommodations();
  }, [toast]);


  const handleIndicatePoint = () => {
    toast({
      title: "Indicar Ponto Turístico",
      description: "Funcionalidade de indicar novo ponto turístico estará disponível em breve!",
    });
  };

  const handleViajeParana = () => {
    toast({
      title: "Viaje Paraná",
      description: "Mais informações sobre como viajar pelo Paraná em breve!",
    });
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Explore o Turismo</h1>
        <p className="text-muted-foreground">Descubra lugares incríveis para visitar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Button
          variant="outline"
          size="lg"
          className="w-full py-4 h-auto rounded-xl border-2 hover:bg-primary/10 flex flex-col items-center justify-center"
          onClick={handleViajeParana}
        >
          <Map className="h-8 w-8 mb-1 text-primary" />
          <span className="font-semibold text-base">Viaje Paraná</span>
          <span className="text-xs text-muted-foreground">Dicas e Roteiros</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full py-4 h-auto rounded-xl border-2 hover:bg-primary/10 flex flex-col items-center justify-center"
          onClick={handleIndicatePoint}
        >
          <PlusCircle className="h-8 w-8 mb-1 text-primary" />
          <span className="font-semibold text-base">Indicar Local</span>
          <span className="text-xs text-muted-foreground">Contribua com a comunidade</span>
        </Button>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold font-headline">Descubra o Paraná</h2>
        </div>
        {loadingTouristPoints ? (
          <Alert>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <AlertTitle className="font-headline">Carregando Pontos Turísticos...</AlertTitle>
            <AlertDescription>Buscando maravilhas do Paraná para você.</AlertDescription>
          </Alert>
        ) : paranaPoints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paranaPoints.map((point, index) => (
              <React.Fragment key={`${point.id}-fragment`}>
                <TouristPointCard key={point.id} point={point} />
                {(index + 1) % 3 === 0 && index < paranaPoints.length -1 && <AdPlaceholder />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhum ponto turístico do Paraná cadastrado no momento.</p>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold font-headline">Sugestões de Hospedagem</h2>
        </div>
        {loadingAccommodations ? (
           <Alert>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <AlertTitle className="font-headline">Carregando Hospedagens...</AlertTitle>
            <AlertDescription>Encontrando os melhores lugares para sua estadia.</AlertDescription>
          </Alert>
        ) : accommodations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accommodations.map((business, index) => (
              <React.Fragment key={`${business.id}-fragment`}>
                <BusinessCard key={business.id} business={business} />
                {(index + 1) % 3 === 0 && index < accommodations.length - 1 && <AdPlaceholder />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhuma sugestão de hospedagem encontrada.</p>
        )}
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold font-headline mb-4">Pontos Indicados pela Comunidade</h2>
        <div className="p-6 bg-muted/30 rounded-xl border border-dashed min-h-[100px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Ainda não há pontos indicados pela comunidade.<br/>
            Use o botão "Indicar Local" acima para adicionar um!
          </p>
        </div>
      </section>
       
      <AdPlaceholder />

    </div>
  );
}
