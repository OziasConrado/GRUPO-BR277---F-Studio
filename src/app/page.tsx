
'use client';

import { useEffect, useState, useRef, type ChangeEvent, useCallback } from 'react';
import Link from 'next/link';
import {
  List,
  Store,
  Landmark,
  Headset,
  Newspaper,
  Video,
  ListChecks,
  Image as ImageIcon,
  XCircle,
  Edit,
  Edit3,
  PlayCircle,
  AlertTriangle,
  ShieldAlert, 
  Construction,
  TrafficConeIcon,
  CloudFog,
  Flame as FlameIcon,
  ArrowRightCircle,
  Loader2
} from 'lucide-react';

import PostCard, { type PostCardProps } from '@/components/feed/post-card';
import StoryCircle, { type StoryCircleProps } from '@/components/stories/StoryCircle';
import StoryViewerModal from '@/components/stories/StoryViewerModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import HomeAlertCard, { type HomeAlertCardData } from '@/components/alerts/home-alert-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { firestore, storage } from '@/lib/firebase/client';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';


const backgroundOptions = [
  { name: 'Padrão', bg: 'hsl(var(--card))', text: 'hsl(var(--card-foreground))' },
  { name: 'Azul', bg: '#002776', text: '#FFFFFF' },
  { name: 'Verde', bg: '#009c3b', text: '#FFFFFF' },
  { name: 'Amarelo', bg: '#ffdf00', text: '#002776' },
  { name: 'Gradiente', gradient: 'linear-gradient(to right, #002776, #009c3b, #ffdf00)', text: '#FFFFFF' },
];

const alertTypesForSelection = ["Acidente", "Obras na Pista", "Congestionamento", "Neblina/Cond. Climática", "Animal na Pista", "Queimada/Fumaça", "Outro"];


export default function FeedPage() {
  // State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryCircleProps | null>(null);
  const [newPostText, setNewPostText] = useState('');
  
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [reels, setReels] = useState<StoryCircleProps[]>([]);
  const [displayedAlertsFeed, setDisplayedAlertsFeed] = useState<HomeAlertCardData[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingReels, setLoadingReels] = useState(true);

  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedMediaForUpload, setSelectedMediaForUpload] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [selectedPostBackground, setSelectedPostBackground] = useState(backgroundOptions[0]);
  const [currentPostType, setCurrentPostType] = useState<'text' | 'video' | 'image' | 'alert'>('text');
  const [isAlertTypeModalOpen, setIsAlertTypeModalOpen] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState<string | undefined>(undefined);

  // Hooks
  const { toast } = useToast();
  const { currentUser, isProfileComplete } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time Posts Fetch
  useEffect(() => {
    if (!firestore) return setLoadingPosts(false);
    setLoadingPosts(true);

    const q = query(collection(firestore, 'posts'), where("deleted", "==", false), orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName || 'Usuário Anônimo',
          userAvatarUrl: data.userAvatarUrl || 'https://placehold.co/40x40.png',
          userLocation: data.userLocation || 'Local Desconhecido',
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          text: data.text || '',
          uploadedImageUrl: data.uploadedImageUrl,
          reactions: data.reactions || { thumbsUp: 0, thumbsDown: 0 },
          bio: data.bio,
          instagramUsername: data.instagramUsername,
          cardStyle: data.cardStyle,
          edited: data.edited || false,
        } as PostCardProps;
      });
      setPosts(fetchedPosts);
      setLoadingPosts(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Posts" });
      setLoadingPosts(false);
    });

    return () => unsubscribe();
  }, [toast]);

  // Real-time Reels Fetch
  useEffect(() => {
    if (!firestore) return setLoadingReels(false);
    setLoadingReels(true);
    const q = query(collection(firestore, 'reels'), orderBy('timestamp', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedReels = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                adminName: data.userName,
                avatarUrl: data.thumbnailUrl || 'https://placehold.co/180x320.png', // You'll need a way to generate thumbnails
                dataAIAvatarHint: 'video story content',
                hasNewStory: true,
                storyType: 'video',
                videoContentUrl: data.videoUrl
            } as StoryCircleProps;
        });
        setReels(fetchedReels);
        setLoadingReels(false);
    }, (error) => {
      console.error("Error fetching reels:", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Reels" });
      setLoadingReels(false);
    });
    return () => unsubscribe();
  }, [toast]);


  // Real-time Alerts Fetch
  useEffect(() => {
    if (!firestore) return setLoadingAlerts(false);
    setLoadingAlerts(true);
    const q = query(collection(firestore, 'alerts'), orderBy('timestamp', 'desc'), limit(5));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts: HomeAlertCardData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'Alerta',
          description: data.description || '',
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          userNameReportedBy: data.userNameReportedBy || 'Anônimo',
          userAvatarUrl: data.userAvatarUrl,
          bio: data.bio,
          instagramUsername: data.instagramUsername,
        } as HomeAlertCardData;
      });
      setDisplayedAlertsFeed(fetchedAlerts);
      setLoadingAlerts(false);
    }, (error) => {
      console.error("Error fetching alerts:", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Alertas" });
      setLoadingAlerts(false);
    });
    return () => unsubscribe();
  }, [toast]);

  // Handlers
  const handleStoryClick = (story: StoryCircleProps) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const handleMediaInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({ variant: 'destructive', title: 'Arquivo Inválido', description: 'Por favor, selecione uma imagem ou um vídeo.' });
        return;
      }
      
      const MAX_SIZE_MB = isVideo ? 50 : 5; // 50MB for video, 5MB for image
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Arquivo Muito Grande', description: `O tamanho máximo é ${MAX_SIZE_MB}MB.` });
        return;
      }

      setCurrentPostType(isVideo ? 'video' : 'image');
      setSelectedMediaForUpload(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
      setSelectedPostBackground(backgroundOptions[0]);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMediaForUpload(null);
    if(mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setMediaPreviewUrl(null);
    setCurrentPostType('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const resetFormState = () => {
    setNewPostText('');
    handleRemoveMedia();
    setIsPublishing(false);
    setSelectedAlertType(undefined);
  }

  const handlePublish = async () => {
    if (!currentUser || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado ou o serviço está indisponível.' });
      return;
    }
    
    if (!isProfileComplete) {
        toast({
            title: "Perfil Incompleto",
            description: "Por favor, preencha seu nome e cidade no seu perfil para poder publicar.",
            variant: "destructive",
            action: <ToastAction altText="Editar Perfil" onClick={() => router.push('/profile/edit')}>Editar Perfil</ToastAction>,
        });
        return;
    }

    setIsPublishing(true);

    try {
        let mediaUrl: string | undefined;
        let storagePath: string | undefined;

        if (selectedMediaForUpload) {
            const mediaType = selectedMediaForUpload.type.startsWith('image/') ? 'images' : 'videos';
            storagePath = `${mediaType}/${currentUser.uid}/${Date.now()}_${selectedMediaForUpload.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, selectedMediaForUpload);
            mediaUrl = await getDownloadURL(storageRef);
        }

        if (currentPostType === 'alert') {
          await addDoc(collection(firestore, 'alerts'), {
              type: selectedAlertType,
              description: newPostText.trim(),
              userId: currentUser.uid,
              userNameReportedBy: currentUser.displayName || 'Anônimo',
              userAvatarUrl: currentUser.photoURL,
              timestamp: serverTimestamp(),
          });
          toast({ title: "Alerta Publicado!", description: "Seu alerta foi adicionado ao mural." });
        
        } else if (currentPostType === 'video') {
            await addDoc(collection(firestore, 'reels'), {
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anônimo',
                userAvatarUrl: currentUser.photoURL,
                description: newPostText.trim(),
                videoUrl: mediaUrl,
                timestamp: serverTimestamp(),
            });
            toast({ title: "Reel Publicado!", description: "Seu vídeo está disponível para a comunidade." });

        } else { // 'image' or 'text' post
            const postData: any = {
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anônimo',
                userAvatarUrl: currentUser.photoURL,
                text: newPostText,
                reactions: { thumbsUp: 0, thumbsDown: 0 },
                edited: false,
                deleted: false,
                timestamp: serverTimestamp(),
            };
            if(mediaUrl) postData.uploadedImageUrl = mediaUrl;
            if (currentPostType === 'text' && !selectedMediaForUpload && newPostText.length <= 150 && selectedPostBackground.name !== 'Padrão') {
                postData.cardStyle = selectedPostBackground;
            }
            await addDoc(collection(firestore, 'posts'), postData);
            toast({ title: "Publicado!", description: "Sua postagem está na Time Line." });
        }

        resetFormState();
    } catch (error) {
        console.error("Error publishing content:", error);
        toast({ variant: 'destructive', title: 'Erro ao Publicar', description: 'Não foi possível salvar sua publicação.' });
        setIsPublishing(false);
    }
  };


  const handleOpenAlertTypeModal = () => {
    handleRemoveMedia(); 
    setCurrentPostType('alert'); 
    setSelectedPostBackground(backgroundOptions[0]); 
    setIsAlertTypeModalOpen(true);
  };
  
  const handleOpenMediaSelector = (type: 'image' | 'video') => {
    setCurrentPostType(type);
    if(fileInputRef.current) {
        fileInputRef.current.accept = `${type}/*`;
        fileInputRef.current.click();
    }
  }

  const handleConfirmAlertType = () => {
    if (!selectedAlertType) {
        toast({ variant: "destructive", title: "Nenhum tipo selecionado", description: "Por favor, selecione um tipo de alerta." });
        return;
    }
    setIsAlertTypeModalOpen(false);
    textareaRef.current?.focus();
    toast({ title: `Modo Alerta: ${selectedAlertType}`, description: "Descreva seu alerta." });
  };


  // Derived State
  const canPublish = !isPublishing && currentUser && (
    (currentPostType === 'alert' && selectedAlertType && newPostText.trim() !== '') || 
    (currentPostType !== 'alert' && (newPostText.trim() !== '' || selectedMediaForUpload !== null))
  );
  const showColorPalette = !mediaPreviewUrl && currentPostType === 'text' && newPostText.length <= 150 && newPostText.length > 0;
  
  const ProfileCompletionAlert = () => {
    if (isProfileComplete || !currentUser) return null;

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Complete seu Perfil</AlertTitle>
            <AlertDescription>
                Você precisa adicionar seu nome e cidade para interagir e publicar.
                <Link href="/profile/edit" className="font-bold underline ml-2">
                    Ir para o perfil
                </Link>
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="w-full space-y-6">
      <ProfileCompletionAlert />
      
      <Button asChild
        variant="destructive"
        size="default"
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-semibold rounded-lg shadow-md"
      >
        <Link href="/emergencia">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" className="mr-2 h-5 w-5">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            EMERGÊNCIA
        </Link>
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="py-3 text-base rounded-lg hover:bg-primary/10">
          <Link href="/sau">
            <Headset className="mr-2 h-5 w-5" />
            Contato SAU
          </Link>
        </Button>
        <Button asChild variant="outline" className="py-3 text-base rounded-lg hover:bg-primary/10">
          <Link href="/turismo">
            <Landmark className="mr-2 h-5 w-5" />
            Turismo
          </Link>
        </Button>
      </div>

      <Card className="p-4 shadow-sm rounded-xl">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Edit className="h-5 w-5 mr-2 text-primary" />
            Criar Publicação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Textarea
            ref={textareaRef}
            placeholder={
              currentPostType === 'alert' ? `ALERTA: ${selectedAlertType || 'Geral'} - Descreva o alerta (máx. 500 caracteres)...` :
              currentPostType === 'video' ? "Adicione uma legenda para seu vídeo..." :
              currentPostType === 'image' ? "Adicione uma legenda para sua foto..." :
              "No que você está pensando, viajante?"
            }
            className="mb-3 h-24 resize-none rounded-lg"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            style={
              !mediaPreviewUrl && currentPostType === 'text' && selectedPostBackground?.name !== 'Padrão'
                ? {
                    backgroundColor: selectedPostBackground.gradient ? undefined : selectedPostBackground.bg,
                    backgroundImage: selectedPostBackground.gradient,
                    color: selectedPostBackground.text,
                  }
                : {}
            }
            maxLength={currentPostType === 'alert' ? 500 : undefined}
          />

          {mediaPreviewUrl && (
            <div className="relative mb-3">
              {selectedMediaForUpload?.type.startsWith('video/') ? (
                <video src={mediaPreviewUrl} controls className="max-w-full h-auto rounded-md border" data-ai-hint="user uploaded video preview" />
              ) : (
                <img src={mediaPreviewUrl} alt="Prévia da imagem" className="max-w-full h-auto rounded-md border" data-ai-hint="user uploaded image preview"/>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 h-7 w-7"
                onClick={handleRemoveMedia}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          {showColorPalette && currentPostType !== 'alert' && (
            <div className="flex space-x-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              {backgroundOptions.map((option) => (
                <div
                  key={option.name}
                  className={cn(
                    'w-8 h-8 rounded-full cursor-pointer border-2 border-transparent flex-shrink-0 shadow-inner',
                    selectedPostBackground.name === option.name && 'ring-2 ring-primary ring-offset-1',
                  )}
                  style={{
                    backgroundColor: option.gradient ? undefined : option.bg,
                    backgroundImage: option.gradient,
                  }}
                  onClick={() => setSelectedPostBackground(option)}
                  title={option.name}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
            {!mediaPreviewUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={handleOpenAlertTypeModal}
                    title="Postar Alerta"
                  >
                    <Edit3 className="h-4 w-4" /> 
                    Alertas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => handleOpenMediaSelector('video')}
                    title="Postar Vídeo"
                  >
                    <Video className="h-4 w-4" />
                    Vídeo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => handleOpenMediaSelector('image')}
                    title="Postar Foto"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Foto
                  </Button>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleMediaInputChange}
            />
            <Button
              onClick={handlePublish}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              disabled={isPublishing || (isProfileComplete && !canPublish)}
            >
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Publicar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mb-3 mt-4">
        <div className="px-1">
            <h2 className="text-xl font-bold font-headline flex items-center mb-3 text-foreground">
            <PlayCircle className="h-5 w-5 mr-2 text-primary" />
            Reels
            </h2>
        </div>
        {loadingReels ? (
            <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : reels.length > 0 ? (
            <div className="flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4 no-scrollbar">
                {reels.map((story) => (
                    <StoryCircle key={story.id} {...story} onClick={() => handleStoryClick(story)} />
                ))}
            </div>
        ) : (
             <p className="text-muted-foreground text-center py-4 text-sm">Nenhum Reel publicado. Seja o primeiro!</p>
        )}
      </div>

      {loadingAlerts ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayedAlertsFeed.length > 0 ? (
        <div className="pt-4 pb-2">
          <div className="flex overflow-x-auto space-x-3 pb-2 -mx-1 px-1 no-scrollbar">
            {displayedAlertsFeed.slice(0, 3).map((alertData) => (
              <Link href="/alertas" key={alertData.id} className="block">
                <HomeAlertCard alert={alertData} />
              </Link>
            ))}
            {displayedAlertsFeed.length > 3 && (
              <div className="w-[260px] flex-shrink-0 h-full flex items-stretch">
                <Button asChild variant="outline" className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-3 shadow-lg hover:bg-card/95 dark:hover:bg-muted/30 transition-colors duration-150">
                  <Link href="/alertas" className="flex flex-col items-center justify-center h-full">
                    <ArrowRightCircle className="h-10 w-10 mb-2 text-primary" />
                    <span className="text-sm font-semibold">Mais Alertas</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <h2 className="text-xl font-bold pt-2 font-headline text-left">
        <List className="h-5 w-5 mr-2 text-primary inline-block" />
        Time Line
      </h2>

      {loadingPosts ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">Nenhuma postagem na Time Line ainda. Seja o primeiro a publicar!</p>
      )}


      {selectedStory && (
        <StoryViewerModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          story={selectedStory}
        />
      )}

      <Dialog open={isAlertTypeModalOpen} onOpenChange={setIsAlertTypeModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Selecione o Tipo de Alerta</DialogTitle>
            <DialogDescription>
              Escolha a categoria que melhor descreve seu alerta.
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={selectedAlertType} onValueChange={setSelectedAlertType} className="my-4 space-y-2">
            {alertTypesForSelection.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`alert-type-${type}`} />
                <Label htmlFor={`alert-type-${type}`} className="font-normal">{type}</Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleConfirmAlertType}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
