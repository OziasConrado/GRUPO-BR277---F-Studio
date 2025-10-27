
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
import { useToast } from '@/hooks/use-toast';
import { getUserLocation, calculateDistance } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { firestore } from '@/lib/firebase/client';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';


const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2", className)}>
    <p className="text-muted-foreground text-sm">Publicidade</p>
  </div>
);


export default function GuiaComercialPage() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<BusinessCategory | 'Todas'>('Todas');

  const { toast } = useToast();
  
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
    if (!firestore) return;
    setLoading(true);

    const businessesCollection = collection(firestore, 'businesses');
    const q = query(businessesCollection, where("statusPagamento", "==", "ATIVO"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedBusinesses = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as BusinessData));
        setBusinesses(fetchedBusinesses);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching businesses:", error);
        toast({ variant: "destructive", title: "Erro ao Carregar", description: "Não foi possível buscar os estabelecimentos."});
        setLoading(false);
    });
    
    requestLocation();

    return () => unsubscribe();
  }, [requestLocation, toast]);

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

    if (userLocation && locationStatus === 'success' && processedBusinesses.every(p => p.plano !== 'GRATUITO')) {
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
    
    // Fallback sort if no location or if free plans are included
    return processedBusinesses.sort((a, b) => {
        const aVal = a.isPremium ? 0 : 1;
        const bVal = b.isPremium ? 0 : 1;
        if (aVal !== bVal) {
            return aVal - bVal;
        }
        return a.name.localeCompare(b.name);
    });
  }, [businesses, searchTerm, activeCategory, userLocation, locationStatus]);


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
          
          <Link href="/planos" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
              <PlusCircle className="h-10 w-10 mb-2"/>
              <h3 className="font-semibold text-center">Cadastre Seu Negócio</h3>
              <p className="text-xs text-center text-muted-foreground">Apareça para milhares de usuários na estrada.</p>
          </Link>
          
          {loading || locationStatus === 'loading' ? (
            <div className="md:col-span-2 flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedBusinesses.length > 0 ? (
            filteredAndSortedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))
          ) : (
             <p className="text-center text-muted-foreground py-8 md:col-span-2">
              Nenhum comércio encontrado para "{searchTerm}" na categoria "{activeCategory}".
            </p>
          )}
        </div>
      </div>
    </>
  );
}

    