
'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, XCircle, Loader2, AlertTriangle, MapPinIcon } from "lucide-react";
import type { BusinessData } from '@/types/guia-comercial';
import BusinessCard from '@/components/guia-comercial/business-card';
import RegisterBusinessModal from '@/components/guia-comercial/register-business-modal';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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


export default function GuiaComercialPage() {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { currentUser } = useAuth();


  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!firestore) {
        toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao banco de dados." });
        setLoadingBusinesses(false);
        return;
      }
      setLoadingBusinesses(true);
      try {
        const businessesCollection = collection(firestore, 'businesses');
        // Ordenar por nome ou por um campo de timestamp se existir, por exemplo 'createdAt'
        const q = query(businessesCollection, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedBusinesses: BusinessData[] = querySnapshot.docs.map(doc => {
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
            servicesOffered: data.servicesOffered,
            operatingHours: data.operatingHours,
            isPremium: data.isPremium,
            latitude: data.latitude,
            longitude: data.longitude,
            instagramUsername: data.instagramUsername,
            averageRating: data.averageRating, // Assuming these might be stored
            reviewCount: data.reviewCount,     // Assuming these might be stored
            // createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined
          } as BusinessData;
        });
        setBusinesses(fetchedBusinesses);
      } catch (error) {
        console.error("Error fetching businesses: ", error);
        toast({ variant: "destructive", title: "Erro ao Carregar Comércios", description: "Não foi possível buscar os comércios." });
      } finally {
        setLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, [toast]);


  useEffect(() => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
          toast({
            title: "Localização Ativada",
            description: "Mostrando comércios próximos a você.",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          // toast({ // This toast can be a bit noisy if user denies permission
          //   variant: 'default',
          //   title: "Localização Desativada",
          //   description: "Não foi possível obter sua localização. Mostrando comércios em ordem padrão.",
          // });
        }
      );
    } else {
      setLocationStatus('error');
      toast({
        variant: "destructive",
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
      });
    }
  }, [toast]);

  const processedBusinesses = useMemo(() => {
    let filtered = businesses.filter(business =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.address && business.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (userLocation && locationStatus === 'success') {
      const businessesWithDistance = filtered.map(business => {
        if (business.latitude && business.longitude) {
          return {
            ...business,
            distance: calculateDistance(userLocation.latitude, userLocation.longitude, business.latitude, business.longitude),
          };
        }
        return { ...business, distance: Infinity };
      });
      businessesWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      return businessesWithDistance;
    }
    return filtered.sort((a,b) => a.name.localeCompare(b.name));
  }, [businesses, searchTerm, userLocation, locationStatus]);


  const handleRegisterBusiness = async (newBusinessData: Omit<BusinessData, 'id' | 'imageUrl' | 'dataAIImageHint'> & { imagePreviewUrl: string }) => {
     if (!currentUser || !firestore) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para cadastrar um comércio ou serviço indisponível." });
      return;
    }
    const { imagePreviewUrl, ...restOfData } = newBusinessData;
    const businessToSave = {
      ...restOfData,
      imageUrl: imagePreviewUrl, // For now, use preview URL. Later, this will be Firebase Storage URL.
      dataAIImageHint: "user uploaded business photo",
      averageRating: 0,
      reviewCount: 0,
      userId: currentUser.uid, // Store who registered it
      createdAt: serverTimestamp(),
      // latitude and longitude would ideally be captured from a map input or geocoding service
    };

    try {
      const docRef = await addDoc(collection(firestore, 'businesses'), businessToSave);
      const newBusinessWithId: BusinessData = {
        ...businessToSave,
        id: docRef.id,
        // @ts-ignore
        createdAt: new Date().toISOString() // Approximate for local state
      };
      setBusinesses(prev => [newBusinessWithId, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
      toast({
        title: "Comércio Cadastrado!",
        description: `${newBusinessData.name} foi adicionado ao guia.`,
      });
      setIsRegisterModalOpen(false);
    } catch (error) {
        console.error("Error adding business: ", error);
        toast({ variant: "destructive", title: "Erro ao Cadastrar", description: "Não foi possível salvar o comércio." });
    }
  };


  return (
    <div className="w-full space-y-6">
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

      {(locationStatus === 'loading' || loadingBusinesses) && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle className="font-headline">Carregando Comércios...</AlertTitle>
          <AlertDescription>
            Buscando os melhores estabelecimentos para você.
            {locationStatus === 'loading' && " Tentando obter sua localização..."}
          </AlertDescription>
        </Alert>
      )}

      {locationStatus === 'error' && !loadingBusinesses && (
         <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline">Localização Indisponível</AlertTitle>
            <AlertDescription>
                Verifique as permissões de localização no seu navegador.
                Os comércios serão listados em ordem padrão.
            </AlertDescription>
        </Alert>
      )}
      
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <AlertTitle className="text-primary font-semibold">Plano de Visualização</AlertTitle>
        <AlertDescription className="text-primary/80">
          Você está no plano gratuito. Para uma experiência sem anúncios e com mais recursos, considere nosso <Button variant="link" className="p-0 h-auto text-primary">Plano Premium</Button>.
          <div className="mt-2 h-16 bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
            Espaço para Banner AdMob (Ex: 320x50)
          </div>
        </AlertDescription>
      </Alert>

      {!loadingBusinesses && processedBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedBusinesses.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : !loadingBusinesses && (
        <p className="text-center text-muted-foreground py-8">
          {searchTerm ? "Nenhum comércio encontrado para sua busca." : "Nenhum comércio cadastrado ainda. Seja o primeiro a adicionar!"}
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
