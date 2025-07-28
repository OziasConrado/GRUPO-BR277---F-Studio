'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, ListFilter, Star } from "lucide-react";
import type { TouristPointData, TouristCategory, TouristPointReview } from '@/types/turismo';
import { touristCategories } from '@/types/turismo';
import TouristPointCard from '@/components/turismo/tourist-point-card';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { firestore, storage } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import IndicatePointModal, { type IndicatePointSubmitData } from '@/components/turismo/IndicatePointModal';
import { ToastAction } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={cn("my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3", className)}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50 ou Responsivo)</p>
  </div>
);

export default function TurismoPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser, isProfileComplete } = useAuth();
  
  const [allIndicatedPoints, setAllIndicatedPoints] = useState<TouristPointData[]>([]);
  const [loadingIndicatedPoints, setLoadingIndicatedPoints] = useState(true);
  
  const [isIndicateModalOpen, setIsIndicateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<TouristCategory | 'Todas'>('Todas');

  const fetchIndicatedPoints = useCallback(async () => {
    if (!firestore) return;
    setLoadingIndicatedPoints(true);
    try {
      const pointsCollection = collection(firestore, 'tourist_points_indicated');
      const q = query(pointsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPoints: TouristPointData[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TouristPointData));
      setAllIndicatedPoints(fetchedPoints);
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

  const filteredPoints = useMemo(() => {
    if (activeCategory === 'Todas') {
      return allIndicatedPoints;
    }
    return allIndicatedPoints.filter(point => point.category === activeCategory);
  }, [allIndicatedPoints, activeCategory]);


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
        
        const storagePath = `indicated_points_images/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, storagePath);
        
        const metadata = { contentType: imageFile.type };
        const uploadTask = uploadBytesResumable(storageRef, imageFile, metadata);

        const imageUrl = await new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {},
                (error) => {
                    console.error("Upload error on tourism page:", error);
                    toast({
                        variant: "destructive",
                        title: "Erro ao Enviar Imagem",
                        description: `A foto do local não pôde ser enviada. Erro: ${error.code}`,
                    });
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
                }
            );
        });

        const docToSave = {
            ...pointData,
            imageUrl: imageUrl,
            dataAIImageHint: `tourist spot ${pointData.category} ${pointData.name}`,
            indicatedByUserId: currentUser.uid,
            indicatedByUserName: currentUser.displayName,
            indicatedByUserAvatarUrl: currentUser.photoURL || null,
            status: 'pending' as const,
            createdAt: serverTimestamp(),
            averageRating: 0,
            reviewCount: 0,
        };

        const docRef = await addDoc(collection(firestore, 'tourist_points_indicated'), docToSave);
        
        const newPoint: TouristPointData = { ...docToSave, id: docRef.id, createdAt: new Date().toISOString() } as TouristPointData;
        setAllIndicatedPoints(prev => [newPoint, ...prev]);

        toast({
            title: "Indicação Enviada!",
            description: "Obrigado! Sua sugestão foi enviada para análise.",
        });
        setIsIndicateModalOpen(false);

    } catch (error) {
        console.error("Error indicating point: ", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddReview = useCallback(async (pointId: string, reviewData: Omit<TouristPointReview, 'id' | 'timestamp' | 'author' | 'userId' | 'pointId'>) => {
    if (!currentUser || !firestore) {
      toast({ variant: "destructive", title: "Login Necessário", description: "Você precisa estar logado para avaliar." });
      throw new Error("User not logged in or firestore not available");
    }
    if (!isProfileComplete) {
      toast({
        title: "Perfil Incompleto",
        description: "Complete seu perfil para poder avaliar.",
        variant: "destructive",
        action: <ToastAction altText="Editar Perfil" onClick={() => router.push('/profile/edit')}>Editar Perfil</ToastAction>,
      });
      throw new Error("Profile not complete");
    }

    const pointRef = doc(firestore, 'tourist_points_indicated', pointId);
    const reviewsCollectionRef = collection(firestore, 'tourist_point_reviews');

    try {
      await runTransaction(firestore, async (transaction) => {
        const pointDoc = await transaction.get(pointRef);
        if (!pointDoc.exists()) {
          throw new Error("Ponto turístico não encontrado.");
        }

        const newReviewRef = doc(reviewsCollectionRef);
        const newReviewPayload = {
          ...reviewData,
          pointId: pointId,
          userId: currentUser.uid,
          author: currentUser.displayName || "Anônimo",
          userAvatarUrl: currentUser.photoURL || null,
          timestamp: serverTimestamp(),
        };
        transaction.set(newReviewRef, newReviewPayload);

        const currentData = pointDoc.data() as TouristPointData;
        const currentRating = currentData.averageRating || 0;
        const currentCount = currentData.reviewCount || 0;
        const newCount = currentCount + 1;
        const newAverage = (currentRating * currentCount + reviewData.rating) / newCount;

        transaction.update(pointRef, {
          averageRating: newAverage,
          reviewCount: newCount,
        });
      });
      
      setAllIndicatedPoints(prevPoints => 
        prevPoints.map(p => {
          if (p.id === pointId) {
            const currentRating = p.averageRating || 0;
            const currentCount = p.reviewCount || 0;
            const newCount = currentCount + 1;
            const newAverage = (currentRating * currentCount + reviewData.rating) / newCount;
            return { ...p, averageRating: newAverage, reviewCount: newCount };
          }
          return p;
        })
      );
      
      toast({ title: "Avaliação Enviada!", description: "Obrigado por sua contribuição." });
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({ variant: "destructive", title: "Erro ao Avaliar", description: error.message || "Não foi possível enviar sua avaliação." });
      throw error;
    }
  }, [currentUser, isProfileComplete, router, toast]);

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
              <span className="font-semibold text-base mt-1">Ver Roteiros</span>
              <span className="text-xs text-muted-foreground">Dicas e roteiros oficiais</span>
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
          <h2 className="text-2xl font-semibold font-headline mb-4">Indicados pela Comunidade</h2>
          
           <div className="mb-6 p-4 rounded-lg bg-card border">
                <div className="flex items-center mb-2">
                    <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Filtrar por categoria:</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        key="Todas"
                        variant={activeCategory === 'Todas' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory('Todas')}
                        className="rounded-full text-xs px-3 py-1 h-auto"
                    >
                        Todas
                    </Button>
                    {touristCategories.map((category) => (
                        <Button
                            key={category}
                            variant={activeCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                            className="rounded-full text-xs px-3 py-1 h-auto"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

           {loadingIndicatedPoints ? (
             <Alert>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <AlertTitle className="font-headline">Carregando Indicações...</AlertTitle>
            </Alert>
           ) : filteredPoints.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPoints.map((point) => (
                    <TouristPointCard 
                        key={point.id} 
                        point={point} 
                        onAddReview={handleAddReview}
                        showIndicatedBy 
                    />
                ))}
             </div>
           ) : (
            <div className="p-6 bg-muted/30 rounded-xl border border-dashed min-h-[100px] flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Ainda não há pontos indicados para a categoria "{activeCategory}".<br/>
                Seja o primeiro a indicar um local incrível!
              </p>
            </div>
          )}
        </section>
        
        <AdPlaceholder />

      </div>
      <IndicatePointModal 
        isOpen={isIndicateModalOpen}
        onSubmit={handleIndicatePoint}
        onClose={() => setIsIndicateModalOpen(false)}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
