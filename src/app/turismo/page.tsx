'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import type { TouristPointData } from '@/types/turismo';
import TouristPointCard from '@/components/turismo/tourist-point-card';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { firestore, storage } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import IndicatePointModal, { type IndicatePointSubmitData } from '@/components/turismo/IndicatePointModal';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function TurismoPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, isProfileComplete } = useAuth();
  
  const [indicatedPoints, setIndicatedPoints] = useState<TouristPointData[]>([]);
  const [loadingIndicatedPoints, setLoadingIndicatedPoints] = useState(true);
  
  const [isIndicateModalOpen, setIsIndicateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchIndicatedPoints = useCallback(async () => {
    if (!firestore) return;
    setLoadingIndicatedPoints(true);
    try {
      // For now, fetching all pending points. In a real scenario, you might filter by status: 'approved'.
      const pointsCollection = collection(firestore, 'tourist_points_indicated');
      const q = query(pointsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPoints: TouristPointData[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TouristPointData));
      setIndicatedPoints(fetchedPoints);
    } catch (error) {
      console.error("Error fetching indicated tourist points: ", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Indicações", description: "Não foi possível buscar os pontos da comunidade." });
    } finally {
      setLoadingIndicatedPoints(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchIndicatedPoints();
  }, [fetchIndicatedPoints]);


  const handleOpenIndicateModal = () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Ação Requer Login", description: "Você precisa fazer login para indicar um local." });
      return;
    }
    if (!isProfileComplete) {
      toast({
        title: "Perfil Incompleto",
        description: "Complete seu perfil (nome e cidade) para poder indicar locais.",
        variant: "destructive",
        action: <ToastAction altText="Editar Perfil" onClick={() => router.push('/profile/edit')}>Editar Perfil</ToastAction>,
      });
      return;
    }
    setIsIndicateModalOpen(true);
  };

  const handleIndicatePoint = async (data: IndicatePointSubmitData) => {
    if (!currentUser || !firestore || !storage) return;

    setIsSubmitting(true);
    try {
        const { imageFile, ...pointData } = data;
        
        // 1. Upload image to Storage
        const storagePath = `indicated_points_images/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        // 2. Save data to Firestore
        const docToSave = {
            ...pointData,
            imageUrl: imageUrl,
            dataAIImageHint: `tourist spot ${pointData.category} ${pointData.name}`,
            indicatedByUserId: currentUser.uid,
            indicatedByUserName: currentUser.displayName,
            status: 'pending' as const,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(firestore, 'tourist_points_indicated'), docToSave);
        
        // Optimistic UI update
        // @ts-ignore
        const newPoint: TouristPointData = { ...docToSave, id: docRef.id, createdAt: new Date().toISOString() };
        setIndicatedPoints(prev => [newPoint, ...prev]);

        toast({
            title: "Indicação Enviada!",
            description: "Obrigado! Sua sugestão foi enviada para análise.",
        });
        setIsIndicateModalOpen(false);

    } catch (error) {
        console.error("Error indicating point: ", error);
        toast({ variant: "destructive", title: "Erro ao Enviar", description: "Não foi possível salvar sua indicação. Tente novamente." });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
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
            asChild
          >
            <Link href="/turismo/viaje-parana">
              <div className="relative w-40 h-16">
                <Image
                    src="https://firebasestorage.googleapis.com/v0/b/grupo-br277.firebasestorage.app/o/%C3%8Dcones%20e%20Logo%20do%20app%20GRUPO%20BR277%2FTurismo-PR%2Fviaje-parana.webp?alt=media"
                    alt="Logo Viaje Paraná"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="viaje parana logo"
                />
              </div>
              <span className="text-xs text-muted-foreground mt-2">Dicas e Roteiros</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full py-4 h-auto rounded-xl border-2 hover:bg-primary/10 flex flex-col items-center justify-center"
            onClick={handleOpenIndicateModal}
          >
            <PlusCircle className="h-8 w-8 mb-1 text-primary" />
            <span className="font-semibold text-base">Indicar Local</span>
            <span className="text-xs text-muted-foreground">Contribua com a comunidade</span>
          </Button>
        </div>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-4">Pontos Indicados pela Comunidade</h2>
           {loadingIndicatedPoints ? (
             <Alert>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <AlertTitle className="font-headline">Carregando Indicações...</AlertTitle>
            </Alert>
           ) : indicatedPoints.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {indicatedPoints.map((point) => (
                    <TouristPointCard key={point.id} point={point} showIndicatedBy />
                ))}
             </div>
           ) : (
            <div className="p-6 bg-muted/30 rounded-xl border border-dashed min-h-[100px] flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Ainda não há pontos indicados pela comunidade.<br/>
                Seja o primeiro a indicar um local incrível!
              </p>
            </div>
          )}
        </section>
        
        <AdPlaceholder />

      </div>
      <IndicatePointModal 
        isOpen={isIndicateModalOpen}
        onClose={() => setIsIndicateModalOpen(false)}
        onSubmit={handleIndicatePoint}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
