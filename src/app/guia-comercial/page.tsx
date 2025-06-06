
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, XCircle } from "lucide-react";
import type { BusinessData } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import RegisterBusinessModal from '@/components/guia-comercial/register-business-modal';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const mockBusinesses: BusinessData[] = [
  {
    id: 'comercio-1',
    name: 'Restaurante Sabor da Estrada',
    category: 'Restaurante',
    address: 'Rodovia BR-116, Km 300, Campina Grande do Sul - PR',
    phone: '4133334444',
    whatsapp: '5541999998888',
    description: 'Comida caseira de alta qualidade, buffet livre e pratos a la carte. Amplo estacionamento para caminhões.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'restaurant roadside',
    servicesOffered: ['Buffet Livre', 'A La Carte', 'Estacionamento Amplo', 'Wi-Fi Grátis', 'Banheiros Limpos'],
    operatingHours: 'Seg-Dom: 06:00 - 23:00',
    isPremium: true,
  },
  {
    id: 'comercio-2',
    name: 'Borracharia Confiança',
    category: 'Borracharia',
    address: 'Av. das Torres, 123, São José dos Pinhais - PR',
    phone: '4130305050',
    description: 'Serviços de borracharia 24 horas. Venda de pneus novos e usados. Atendimento rápido.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'tire shop',
    servicesOffered: ['Troca de Pneus', 'Conserto de Furos', 'Balanceamento', 'Venda de Pneus'],
    operatingHours: '24 horas',
    isPremium: false,
  },
  {
    id: 'comercio-3',
    name: 'Hotel Descanso do Viajante',
    category: 'Hotel/Pousada',
    address: 'Rua das Palmeiras, 789, Piraquara - PR',
    whatsapp: '5541977776666',
    description: 'Quartos confortáveis com café da manhã incluso. Preços acessíveis para caminhoneiros.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'motel facade',
    operatingHours: 'Recepção 24 horas',
    isPremium: true,
  },
];

// Conceptual component for full-screen ad
const FullScreenAdPlaceholder = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[999] bg-black/80 flex flex-col items-center justify-center p-4">
    <div className="bg-background p-8 rounded-xl shadow-2xl text-center w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Publicidade</h2>
      <p className="mb-6">Este é um espaço para um anúncio de tela cheia.</p>
      <img src="https://placehold.co/300x250.png?text=AD" alt="Anúncio" className="mx-auto mb-6" data-ai-hint="advertisement banner"/>
      <Button onClick={onClose} variant="outline" className="w-full">Fechar Anúncio</Button>
    </div>
  </div>
);


export default function GuiaComercialPage() {
  const [businesses, setBusinesses] = useState<BusinessData[]>(mockBusinesses);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [showFullScreenAd, setShowFullScreenAd] = useState(false);

  // Simulate showing a full-screen ad for non-premium users (conceptual)
  useEffect(() => {
    // This is a very basic simulation. In a real app, this would be based on user's plan.
    const timer = setTimeout(() => {
      // Let's assume the user is on a "free plan" for this demo
      // setShowFullScreenAd(true); // Temporarily disabled for better UX during dev
    }, 5000); // Show ad after 5 seconds for demo
    return () => clearTimeout(timer);
  }, []);


  const handleRegisterBusiness = (newBusinessData: Omit<BusinessData, 'id'>) => {
    const newBusiness: BusinessData = {
      ...newBusinessData,
      id: `comercio-${Date.now()}`,
    };
    setBusinesses(prev => [newBusiness, ...prev]);
    toast({
      title: "Comércio Cadastrado!",
      description: `${newBusiness.name} foi adicionado ao guia.`,
    });
    setIsRegisterModalOpen(false);
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {showFullScreenAd && <FullScreenAdPlaceholder onClose={() => setShowFullScreenAd(false)} />}
      
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
      
      {/* Placeholder for user plan choice / ad info */}
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <AlertTitle className="text-primary font-semibold">Plano de Visualização</AlertTitle>
        <AlertDescription className="text-primary/80">
          Você está no plano gratuito. Para uma experiência sem anúncios, considere nosso <Button variant="link" className="p-0 h-auto text-primary">Plano Premium</Button>.
          <div className="mt-2 h-16 bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
            Espaço para Banner AdMob (Ex: 320x50)
          </div>
        </AlertDescription>
      </Alert>

      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBusinesses.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? "Nenhum comércio encontrado para sua busca." : "Nenhum comércio cadastrado ainda."}
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
