
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Map } from "lucide-react"; // Map icon added
import type { TouristPointData } from '@/types/turismo';
import TouristPointCard from '@/components/turismo/tourist-point-card';
import type { BusinessData } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card'; // Import Card for new buttons
import React from 'react'; // Import React for React.Fragment

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
  {
    id: 'parana-tp-5',
    name: 'Cânion Guartelá',
    locationName: 'Tibagi, PR',
    description: 'O sexto maior cânion do mundo em extensão, com paisagens deslumbrantes e trilhas.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'guartela canyon',
    category: 'Aventura',
  },
  {
    id: 'parana-tp-6',
    name: 'Opera de Arame',
    locationName: 'Curitiba, PR',
    description: 'Teatro construído em estrutura tubular e teto transparente, integrado à natureza.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'opera de arame curitiba',
    category: 'Cultural',
  },
];

const mockBusinessesForAccommodation: BusinessData[] = [
  {
    id: 'comercio-1-hotel',
    name: 'Hotel Descanso do Viajante (Premium)',
    category: 'Hotel/Pousada',
    address: 'Rua das Palmeiras, 789, Piraquara - PR',
    whatsapp: '5541977776666',
    description: 'Quartos confortáveis com café da manhã incluso. Preços acessíveis para caminhoneiros e viajantes.',
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
    isPremium: false,
    latitude: -25.3880,
    longitude: -48.8460,
  },
  {
    id: 'comercio-Y-resort',
    name: 'Resort Águas Claras',
    category: 'Hotel/Pousada', // Assuming Resort fits here for simplicity
    address: 'Rodovia das Cataratas, Km 20, Foz do Iguaçu - PR',
    phone: '4521027000',
    description: 'Luxuoso resort com piscinas, spa, e vista para a natureza exuberante.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'luxury resort pool',
    operatingHours: '24 horas',
    isPremium: true,
    latitude: -25.6710,
    longitude: -54.4772,
  },
   {
    id: 'comercio-Z-camping',
    name: 'Camping Paraíso Verde',
    category: 'Hotel/Pousada', // Assuming Camping fits here
    address: 'Estrada Colônia Cristina, s/n, Guaratuba - PR',
    whatsapp: '5541988776655',
    description: 'Área de camping com infraestrutura completa, banheiros, churrasqueiras e contato com a natureza.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'campsite nature',
    operatingHours: 'Diariamente: 08:00 - 20:00',
    isPremium: false,
    latitude: -25.8700,
    longitude: -48.6000,
  },
];

const AdPlaceholder = () => (
  <div className="my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3">
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function TurismoPage() {
  const { toast } = useToast();
  const [paranaPoints] = useState<TouristPointData[]>(mockParanaTouristPoints);
  const accommodations = mockBusinessesForAccommodation.filter(
    business => business.category === 'Hotel/Pousada'
  );

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
    // Potencialmente abrir um link externo ou uma seção específica no futuro
    // window.open('https://www.viajeparana.com/', '_blank');
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
        {paranaPoints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paranaPoints.map((point, index) => (
              <React.Fragment key={`${point.id}-fragment`}>
                <TouristPointCard key={point.id} point={point} />
                {(index + 1) % 3 === 0 && index < paranaPoints.length -1 && <AdPlaceholder />}
              </React.Fragment>
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
            {accommodations.map((business, index) => (
              <React.Fragment key={`${business.id}-fragment`}>
                <BusinessCard key={business.id} business={business} />
                {(index + 1) % 3 === 0 && index < accommodations.length - 1 && <AdPlaceholder />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma sugestão de hospedagem encontrada.</p>
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

    
