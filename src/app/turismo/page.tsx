
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Map } from "lucide-react";
import type { TouristPointData } from '@/types/turismo';
import TouristPointCard from '@/components/turismo/tourist-point-card';
import type { BusinessData } from '@/types/guia-comercial'; // Reutilizando BusinessData para acomodações
import BusinessCard from '@/components/guia-comercial/business-card'; // Reutilizando BusinessCard
import { useToast } from "@/hooks/use-toast";

// Mock data for Paraná tourist points
const mockParanaTouristPoints: TouristPointData[] = [
  {
    id: 'parana-tp-1',
    name: 'Cataratas do Iguaçu',
    locationName: 'Foz do Iguaçu, PR',
    description: 'Um dos maiores conjuntos de quedas d\'água do mundo, Patrimônio Natural da Humanidade.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'iguazu falls',
    category: 'Natureza',
  },
  {
    id: 'parana-tp-2',
    name: 'Jardim Botânico de Curitiba',
    locationName: 'Curitiba, PR',
    description: 'Principal cartão postal de Curitiba, com sua famosa estufa de vidro e jardins franceses.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'botanical garden curitiba',
    category: 'Lazer',
  },
  {
    id: 'parana-tp-3',
    name: 'Ilha do Mel',
    locationName: 'Paranaguá, PR',
    description: 'Paraíso ecológico com praias preservadas, trilhas e o Farol das Conchas.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'ilha do mel beach',
    category: 'Natureza',
  },
  {
    id: 'parana-tp-4',
    name: 'Parque Estadual de Vila Velha',
    locationName: 'Ponta Grossa, PR',
    description: 'Formações rochosas areníticas esculpidas pela natureza, como a Taça e o Camelo.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'vila velha park ponta grossa',
    category: 'Natureza',
  },
];

// Mock data for businesses (simulating Guia Comercial data source for accommodations)
// Copied relevant items from GuiaComercial mock data
const mockBusinessesForAccommodation: BusinessData[] = [
  {
    id: 'comercio-1-hotel', // Changed ID to avoid conflict if merging later
    name: 'Hotel Descanso do Viajante (Premium)',
    category: 'Hotel/Pousada',
    address: 'Rua das Palmeiras, 789, Piraquara - PR',
    whatsapp: '5541977776666',
    description: 'Quartos confortáveis com café da manhã incluso. Preços acessíveis para caminhoneiros e viajantes. Ambiente seguro e tranquilo.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'motel facade',
    operatingHours: 'Recepção 24 horas',
    isPremium: true,
    latitude: -25.4442,
    longitude: -49.0628,
    instagramUsername: 'hoteldescanso',
    averageRating: 4.2,
    reviewCount: 88,
  },
   {
    id: 'comercio-X-hotel',
    name: 'Pousada Aconchego da Serra',
    category: 'Hotel/Pousada',
    address: 'Estrada da Graciosa, Km 10, Morretes - PR',
    phone: '4134620000',
    description: 'Chalés rústicos em meio à Mata Atlântica, com piscina e restaurante regional.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'cozy inn mountain',
    operatingHours: 'Check-in: 14:00, Check-out: 12:00',
    isPremium: false, // Example of non-premium
    latitude: -25.3880,
    longitude: -48.8460,
  },
];

export default function TurismoPage() {
  const { toast } = useToast();
  const [paranaPoints] = useState<TouristPointData[]>(mockParanaTouristPoints);
  // Filter for accommodations from the mock business data
  const accommodations = mockBusinessesForAccommodation.filter(
    business => business.category === 'Hotel/Pousada' // Add 'Camping', 'Resort' if needed
  );

  const handleIndicatePoint = () => {
    toast({
      title: "Indicar Ponto Turístico",
      description: "Funcionalidade de indicar novo ponto turístico estará disponível em breve!",
    });
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Explore o Turismo</h1>
        <p className="text-muted-foreground">Descubra lugares incríveis para visitar.</p>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold font-headline">Descubra o Paraná</h2>
        </div>
        {paranaPoints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paranaPoints.map(point => (
              <TouristPointCard key={point.id} point={point} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum ponto turístico do Paraná cadastrado no momento.</p>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold font-headline">Sugestões de Hospedagem</h2>
        </div>
        {accommodations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accommodations.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma sugestão de hospedagem encontrada.</p>
        )}
      </section>
      
      <section className="text-center py-6 bg-card border rounded-xl">
        <h2 className="text-xl font-semibold font-headline mb-2">Conhece um lugar legal?</h2>
        <p className="text-muted-foreground mb-4">Ajude outros viajantes indicando novos pontos turísticos!</p>
        <Button onClick={handleIndicatePoint} size="lg" className="rounded-full">
          <PlusCircle className="mr-2 h-5 w-5" />
          Indicar Ponto Turístico
        </Button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold font-headline mb-4">Pontos Indicados pela Comunidade</h2>
        <div className="p-6 bg-muted/30 rounded-xl border border-dashed min-h-[100px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Ainda não há pontos indicados pela comunidade.<br/>
            Seja o primeiro a adicionar um!
          </p>
        </div>
      </section>
       
       {/* Placeholder for AdMob Banner */}
      <div className="my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
      </div>

    </div>
  );
}
