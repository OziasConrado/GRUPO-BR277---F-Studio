
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, runTransaction, serverTimestamp, DocumentData } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/client';
import type { TouristPointData, TouristPointReview } from '@/types/turismo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, MapPin, Tag, Info, AlertTriangle, ExternalLink, Star, MessageSquare, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import SubmitReviewModal from '@/components/turismo/SubmitReviewModal';
import StarDisplay from '@/components/sau/star-display';
import { ToastAction } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import UserProfileModal, { type UserProfileData } from '@/components/profile/UserProfileModal';

const AdPlaceholder = ({ className }: { className?: string }) => (
  <div className={`my-6 p-4 rounded-xl bg-muted/30 border border-dashed h-24 flex items-center justify-center ${className}`}>
    <p className="text-muted-foreground text-sm">Espaço para Banner AdMob</p>
  </div>
);

export default function TouristPointDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const { currentUser, isProfileComplete } = useAuth();
  const router = useRouter();

  const [point, setPoint] = useState<TouristPointData | null>(null);
  const [reviews, setReviews] = useState<TouristPointReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    if (!id || !firestore) return;

    setLoading(true);
    const pointRef = doc(firestore, 'tourist_points_indicated', id);

    const unsubPoint = onSnapshot(pointRef, (docSnap) => {
      if (docSnap.exists()) {
        setPoint({ id: docSnap.id, ...docSnap.data() } as TouristPointData);
      } else {
        setError('Ponto turístico não encontrado.');
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'O ponto turístico que você está tentando acessar não existe.',
        });
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching tourist point:', err);
      setError('Ocorreu um erro ao carregar as informações.');
      setLoading(false);
    });

    const reviewsQuery = query(collection(firestore, 'tourist_point_reviews'), where('pointId', '==', id), orderBy('timestamp', 'desc'));
    const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TouristPointReview));
      setReviews(fetchedReviews);
    });

    return () => {
      unsubPoint();
      unsubReviews();
    };
  }, [id, toast]);
  
  const handleShowUserProfile = useCallback(async (userId?: string, fallbackName?: string, fallbackAvatar?: string) => {
    if (!userId) return;
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de banco de dados indisponível.' });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'Usuarios', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSelectedUserProfile({
          id: userDoc.id,
          name: userData.displayName || 'Usuário',
          avatarUrl: userData.photoURL,
          location: userData.location,
          bio: userData.bio,
          instagramUsername: userData.instagramUsername,
        });
      } else {
        setSelectedUserProfile({
          id: userId,
          name: fallbackName || 'Usuário',
          avatarUrl: fallbackAvatar,
        });
      }
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar o perfil do usuário.' });
    }
  }, [toast]);
  
  const handleAddReview = async (reviewData: Omit<TouristPointReview, 'id' | 'timestamp' | 'author' | 'userId' | 'pointId' | 'userAvatarUrl'>) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Login Necessário", description: "Você precisa estar logado para avaliar." });
      return;
    }
    if (!isProfileComplete) {
      toast({
        title: "Perfil Incompleto",
        description: "Complete seu perfil para poder avaliar.",
        variant: "destructive",
        action: <ToastAction altText="Editar Perfil" onClick={() => router.push('/profile/edit')}>Editar Perfil</ToastAction>,
      });
      return;
    }
    if (!firestore) {
      toast({ variant: "destructive", title: "Erro de Conexão", description: "Serviço indisponível. Tente novamente mais tarde."});
      return;
    }
    
    setIsSubmittingReview(true);
    const pointRef = doc(firestore, 'tourist_points_indicated', id);
    const reviewsCollectionRef = collection(firestore, 'tourist_point_reviews');
    
    try {
      await runTransaction(firestore, async (transaction) => {
        const pointDoc = await transaction.get(pointRef);
        if (!pointDoc.exists()) throw new Error("Ponto turístico não encontrado.");

        const newReviewRef = doc(reviewsCollectionRef);
        const newReviewPayload = {
          ...reviewData,
          pointId: id,
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
      toast({ title: "Avaliação Enviada!", description: "Obrigado por sua contribuição." });
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({ variant: "destructive", title: "Erro ao Avaliar", description: error.message || "Não foi possível enviar sua avaliação." });
    } finally {
      setIsSubmittingReview(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] text-center">
        <Card className="w-full max-w-md p-6">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold text-destructive">Erro</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/turismo">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Turismo
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!point) return null;
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.name}, ${point.locationName}`)}`;

  return (
    <>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Link href="/turismo" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para a página de Turismo
        </Link>

        <Card className="rounded-xl shadow-lg overflow-hidden">
          <div className="relative w-full h-64 md:h-80 bg-muted">
            <Image
              src={point.imageUrl}
              alt={`Foto de ${point.name}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={point.dataAIImageHint}
            />
          </div>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{point.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="secondary" className="flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                {point.category}
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {point.locationName}
              </Badge>
              {point.reviewCount && point.reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <StarDisplay rating={point.averageRating || 0} size={16} />
                  <span className="text-xs text-muted-foreground">({(point.averageRating || 0).toFixed(1)})</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdPlaceholder />
            <div>
              <h3 className="flex items-center text-lg font-semibold mb-2">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  Sobre o local
              </h3>
              <p className="text-base text-foreground/90 whitespace-pre-line">
                {point.description}
              </p>
               {point.indicatedByUserName && point.indicatedByUserId && (
                  <div className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                      <button 
                        className="flex items-center gap-2 hover:underline" 
                        onClick={() => handleShowUserProfile(point.indicatedByUserId, point.indicatedByUserName, point.indicatedByUserAvatarUrl)}
                      >
                        <Avatar className="h-6 w-6">
                            {point.indicatedByUserAvatarUrl && <AvatarImage src={point.indicatedByUserAvatarUrl} alt={point.indicatedByUserName}/>}
                            <AvatarFallback className="text-xs"><UserCircle className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <span>
                            Indicado por: <strong>{point.indicatedByUserName}</strong>
                        </span>
                      </button>
                  </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Button asChild size="lg" className="rounded-full">
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Como chegar
                  </a>
              </Button>
               <Button variant="outline" size="lg" className="rounded-full" onClick={() => setIsReviewModalOpen(true)}>
                  <Star className="mr-2 h-4 w-4" /> Avaliar este local
              </Button>
            </div>
             <Separator />
              <div>
                <h3 className="flex items-center text-lg font-semibold mb-3">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Avaliações da Comunidade ({reviews.length})
                </h3>
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start">
                           <button 
                            className="flex items-center gap-2 hover:underline"
                            onClick={() => handleShowUserProfile(review.userId, review.author, review.userAvatarUrl)}
                          >
                            <Avatar className="h-8 w-8">
                                {review.userAvatarUrl && <AvatarImage src={review.userAvatarUrl} alt={review.author} />}
                                <AvatarFallback>{review.author.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm text-left">{review.author}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.timestamp?.toDate() || Date.now()), { locale: ptBR, addSuffix: true })}</p>
                            </div>
                           </button>
                          <StarDisplay rating={review.rating} size={16} />
                        </div>
                        <p className="text-sm mt-2 ml-10">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ainda não há avaliações para este local. Seja o primeiro!
                    </p>
                  )}
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      <SubmitReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleAddReview}
        pointName={point.name}
        isSubmitting={isSubmittingReview}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUserProfile}
      />
    </>
  );
}
