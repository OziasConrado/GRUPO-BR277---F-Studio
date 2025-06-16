
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

import PostCard, { type PostCardProps, type PostReactions } from '@/components/feed/post-card';
import StoryCircle, { type StoryCircleProps } from '@/components/stories/StoryCircle';
import StoryViewerModal from '@/components/stories/StoryViewerModal';
import EmergencyButtonModalTrigger from '@/components/common/emergency-button';
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
import { firestore } from '@/lib/firebase/client';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';


// Mocks and Constants
const defaultReactions: PostReactions = {
  thumbsUp: 0,
  thumbsDown: 0,
};

const MOCK_POST_USER_NAMES = [
  'Carlos Caminhoneiro',
  'Ana Viajante',
  'Rota Segura Admin',
  'Mariana Logística',
  'Pedro Estradeiro',
  'Segurança Rodoviária',
  'João Silva',
  'Você',
  'Ana Souza',
  'Carlos Santos',
  'Ozias Conrado',
];

// Mock data for User Video Stories - Stays as mock for now
const mockUserVideoStories: StoryCircleProps[] = [
  {
    id: 'user-story-1',
    adminName: 'Vídeo de @CarlosC',
    avatarUrl: 'https://placehold.co/180x320.png',
    dataAIAvatarHint: 'truck highway sunset',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'user-story-2',
    adminName: 'Paisagem da @AnaV',
    avatarUrl: 'https://placehold.co/180x320.png',
    dataAIAvatarHint: 'mountain road aerial',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'user-story-3',
    adminName: 'Dica do @PedroE',
    avatarUrl: 'https://placehold.co/180x320.png',
    dataAIAvatarHint: 'driver giving tips',
    hasNewStory: false,
    storyType: 'video',
  },
  {
    id: 'user-story-4',
    adminName: 'Alerta da @MariLog',
    avatarUrl: 'https://placehold.co/180x320.png',
    dataAIAvatarHint: 'road traffic alert',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'user-story-5',
    adminName: 'Manobra do @JoaoS',
    avatarUrl: 'https://placehold.co/180x320.png',
    dataAIAvatarHint: 'truck maneuvering',
    hasNewStory: false,
    storyType: 'video',
  },
  {
    id: 'user-story-6',
    adminName: 'Fim de Tarde com @Ozias',
    avatarUrl: 'https://placehold.co/180x320.png',
    dataAIAvatarHint: 'sunset over fields',
    hasNewStory: true,
    storyType: 'video',
  },
];


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
  const [displayedAlertsFeed, setDisplayedAlertsFeed] = useState<HomeAlertCardData[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const [selectedImageForUpload, setSelectedImageForUpload] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedPostBackground, setSelectedPostBackground] = useState(backgroundOptions[0]);
  const [currentPostType, setCurrentPostType] = useState<'text' | 'video' | 'image' | 'alert'>('text');
  const [isAlertTypeModalOpen, setIsAlertTypeModalOpen] = useState(false);
  const [selectedAlertType, setSelectedAlertType] = useState<string | undefined>(undefined);
  const [userVideoStories, setUserVideoStories] = useState<StoryCircleProps[]>(mockUserVideoStories);


  // Hooks
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Posts
  const fetchPosts = useCallback(async () => {
    if (!firestore) {
        console.error("Firestore not initialized");
        setLoadingPosts(false);
        return;
    }
    setLoadingPosts(true);
    try {
      const postsCollection = collection(firestore, 'posts');
      const q = query(postsCollection, orderBy('timestamp', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const fetchedPosts: PostCardProps[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userName: data.userName || 'Usuário Anônimo',
          userAvatarUrl: data.userAvatarUrl || 'https://placehold.co/40x40.png',
          dataAIAvatarHint: data.dataAIAvatarHint || 'user avatar',
          userLocation: data.userLocation || 'Local Desconhecido',
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          text: data.text || '',
          imageUrl: data.imageUrl,
          dataAIImageHint: data.dataAIImageHint,
          uploadedImageUrl: data.uploadedImageUrl, // Ensure this is fetched if used
          dataAIUploadedImageHint: data.dataAIUploadedImageHint, // Ensure this is fetched
          reactions: data.reactions || { ...defaultReactions },
          commentsData: data.commentsData || [],
          allKnownUserNames: MOCK_POST_USER_NAMES,
          bio: data.bio || 'Usuário da comunidade Rota Segura.',
          instagramUsername: data.instagramUsername,
          cardStyle: data.cardStyle,
        } as PostCardProps;
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Posts", description: "Não foi possível buscar os posts do servidor." });
    } finally {
      setLoadingPosts(false);
    }
  }, [toast]);

  // Fetch Alerts
  const fetchAlerts = useCallback(async () => {
    if (!firestore) {
        console.error("Firestore not initialized");
        setLoadingAlerts(false);
        return;
    }
    setLoadingAlerts(true);
    try {
      const alertsCollection = collection(firestore, 'alerts');
      const q = query(alertsCollection, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const fetchedAlerts: HomeAlertCardData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'Alerta',
          description: data.description || '',
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          userNameReportedBy: data.userNameReportedBy || 'Usuário Anônimo',
          userAvatarUrl: data.userAvatarUrl || 'https://placehold.co/40x40.png',
          dataAIAvatarHint: data.dataAIAvatarHint || 'user avatar',
          bio: data.bio || 'Usuário da comunidade Rota Segura.',
          instagramUsername: data.instagramUsername,
        } as HomeAlertCardData;
      });
      setDisplayedAlertsFeed(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching alerts: ", error);
      toast({ variant: "destructive", title: "Erro ao Carregar Alertas", description: "Não foi possível buscar os alertas do servidor." });
    } finally {
      setLoadingAlerts(false);
    }
  }, [toast]);


  // Effects
  useEffect(() => {
    fetchPosts();
    fetchAlerts();
  }, [fetchPosts, fetchAlerts]);

  useEffect(() => {
    const style = document.createElement('style');
    const css = [
      '.no-scrollbar::-webkit-scrollbar {',
      '  display: none;',
      '}',
      '.no-scrollbar {',
      '  -ms-overflow-style: none;',
      '  scrollbar-width: none;',
      '}',
    ].join('\n');
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handlers
  const handleStoryClick = (story: StoryCircleProps) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O tamanho máximo é 5MB. Considere cortar o ${file.type.startsWith('video/') ? 'vídeo' : 'arquivo'} ou usar um formato mais compacto. Tipo: ${file.type}`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (currentPostType === 'video' && !file.type.startsWith('video/')) {
         toast({ variant: 'destructive', title: 'Tipo de arquivo inválido', description: 'Por favor, selecione um vídeo.' });
         if (fileInputRef.current) fileInputRef.current.value = '';
         return;
      }
      if (currentPostType === 'image' && !file.type.startsWith('image/')) {
         toast({ variant: 'destructive', title: 'Tipo de arquivo inválido', description: 'Por favor, selecione uma imagem.' });
         if (fileInputRef.current) fileInputRef.current.value = '';
         return;
      }


      setSelectedImageForUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedPostBackground(backgroundOptions[0]); // Reset background if image is selected
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishPost = async () => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Usuário não autenticado', description: 'Faça login para publicar.' });
      return;
    }
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Erro de Conexão', description: 'Não foi possível conectar ao servidor.' });
        return;
    }

    if (newPostText.trim() === '' && !selectedImageForUpload && currentPostType !== 'alert') {
      toast({ variant: 'destructive', title: 'Publicação vazia', description: 'Escreva algo ou adicione uma imagem/vídeo para publicar.'});
      return;
    }
  
    if (currentPostType === 'alert') {
      if (!selectedAlertType || !newPostText.trim()) {
        toast({ variant: 'destructive', title: 'Alerta incompleto', description: 'Selecione um tipo e descreva o alerta.'});
        return;
      }
      try {
        const alertData: Omit<HomeAlertCardData, 'id' | 'timestamp'> & { userId: string, timestamp: any } = {
            type: selectedAlertType || 'Alerta Geral',
            description: newPostText.trim(),
            userNameReportedBy: currentUser.displayName || 'Usuário Anônimo',
            userAvatarUrl: currentUser.photoURL || 'https://placehold.co/40x40.png',
            dataAIAvatarHint: 'user avatar',
            userId: currentUser.uid,
            timestamp: serverTimestamp(),
            bio: "Usuário do Rota Segura",
        };
        await addDoc(collection(firestore, 'alerts'), alertData);
        toast({ title: "Alerta Publicado!", description: "Seu alerta foi adicionado ao mural." });
        fetchAlerts(); 
        setSelectedAlertType(undefined);
      } catch (error) {
        console.error("Error publishing alert: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Publicar Alerta', description: 'Não foi possível salvar o alerta.' });
      }
    } else if (currentPostType === 'video') {
        if (selectedImageForUpload && imagePreviewUrl) {
            const newVideoStory: StoryCircleProps = {
                id: `user-story-${Date.now()}`,
                adminName: newPostText.trim() ? `Vídeo de @Você: ${newPostText.trim()}` : 'Seu Novo Vídeo',
                avatarUrl: 'https://placehold.co/180x320.png', 
                dataAIAvatarHint: newPostText.trim() || 'user uploaded video',
                hasNewStory: true,
                storyType: 'video',
                videoContentUrl: imagePreviewUrl, 
            };
            setUserVideoStories(prevStories => [newVideoStory, ...prevStories]);
            toast({ title: "Vídeo Publicado!", description: "Seu Reel foi adicionado." });
        } else {
            toast({ variant: 'destructive', title: 'Nenhum vídeo selecionado', description: 'Por favor, selecione um arquivo de vídeo para publicar como Reel.'});
            return;
        }
    } else { 
      const postDataToSave: any = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Usuário Anônimo',
        userAvatarUrl: currentUser.photoURL || 'https://placehold.co/40x40.png',
        dataAIAvatarHint: 'user avatar',
        userLocation: 'Sua Localização', 
        timestamp: serverTimestamp(),
        text: newPostText,
        reactions: { ...defaultReactions },
        commentsData: [],
        bio: 'Este é o seu perfil.',
        instagramUsername: '',
      };

      if (selectedImageForUpload && imagePreviewUrl && currentPostType === 'image') {
        // For now, image upload to storage is deferred.
        // We will save the text, and later implement image upload that updates this post or creates a new one with the image.
        postDataToSave.uploadedImageUrl = imagePreviewUrl; // This would be the Storage URL in a real scenario
        postDataToSave.dataAIUploadedImageHint = 'user uploaded image'; // Placeholder hint
        toast({ title: "Post com Imagem (Texto Salvo)", description: "O texto foi salvo. O upload de imagens será implementado em breve." });
      } else if (currentPostType === 'text' && newPostText.length <= 150 && selectedPostBackground?.name !== 'Padrão') {
        postDataToSave.cardStyle = {
          backgroundColor: selectedPostBackground.gradient ? undefined : selectedPostBackground.bg,
          backgroundImage: selectedPostBackground.gradient,
          color: selectedPostBackground.text,
          name: selectedPostBackground.name,
        };
      }
      try {
        await addDoc(collection(firestore, 'posts'), postDataToSave);
        toast({ title: "Publicado!", description: "Sua postagem está na Time Line." });
        fetchPosts();
      } catch (error) {
        console.error("Error publishing post: ", error);
        toast({ variant: 'destructive', title: 'Erro ao Publicar', description: 'Não foi possível salvar sua postagem.' });
      }
    }
  
    setNewPostText('');
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    setSelectedPostBackground(backgroundOptions[0]);
    setCurrentPostType('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenAlertTypeModal = () => {
    setCurrentPostType('alert'); 
    handleRemoveImage(); 
    setSelectedPostBackground(backgroundOptions[0]); 
    setIsAlertTypeModalOpen(true);
  };

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
  const canPublish = (currentPostType === 'alert' && selectedAlertType && newPostText.trim() !== '') || (currentPostType !== 'alert' && (newPostText.trim() !== '' || selectedImageForUpload !== null));
  const showColorPalette = !imagePreviewUrl && currentPostType === 'text' && newPostText.length <= 150 && newPostText.length > 0;


  return (
    <div className="w-full space-y-6">
      <EmergencyButtonModalTrigger
        variant="destructive"
        size="default"
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-semibold rounded-lg shadow-md"
        iconClassName="h-5 w-5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor" className="mr-2 h-5 w-5">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        EMERGÊNCIA
      </EmergencyButtonModalTrigger>

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
              !imagePreviewUrl && currentPostType === 'text' && selectedPostBackground?.name !== 'Padrão'
                ? {
                    backgroundColor: selectedPostBackground.gradient ? undefined : selectedPostBackground.bg,
                    backgroundImage: selectedPostBackground.gradient,
                    color: selectedPostBackground.text,
                  }
                : {}
            }
            maxLength={currentPostType === 'alert' ? 500 : undefined}
          />

          {imagePreviewUrl && (
            <div className="relative mb-3">
              {selectedImageForUpload?.type.startsWith('video/') ? (
                <video src={imagePreviewUrl} controls className="max-w-full h-auto rounded-md border" data-ai-hint="user uploaded video preview" />
              ) : (
                <img src={imagePreviewUrl} alt="Prévia da imagem" className="max-w-full h-auto rounded-md border" data-ai-hint="user uploaded image preview"/>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 h-7 w-7"
                onClick={handleRemoveImage}
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
            {!imagePreviewUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => {
                        handleOpenAlertTypeModal();
                    }}
                    title="Postar Alerta"
                  >
                    <Edit3 className="h-4 w-4" /> 
                    Alertas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => {
                      setCurrentPostType('video');
                      handleRemoveImage(); 
                      setSelectedPostBackground(backgroundOptions[0]); 
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "video/*";
                        fileInputRef.current.click();
                      }
                    }}
                    title="Postar Vídeo"
                  >
                    <Video className="h-4 w-4" />
                    Vídeo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => {
                      setCurrentPostType('image');
                      handleRemoveImage();
                      setSelectedPostBackground(backgroundOptions[0]);
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "image/*";
                        fileInputRef.current.click();
                      }
                    }}
                    title="Postar Foto"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Foto
                  </Button>
                </>
              )}
              {imagePreviewUrl && (
                 <div className="flex-1">
                 </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageInputChange}
            />
            <Button
              onClick={handlePublishPost}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              disabled={!canPublish || !currentUser}
            >
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Reels (antigas Destaque/Admin Stories) */}
      <div className="mb-3 mt-4">
        <div className="px-1">
            <h2 className="text-xl font-bold font-headline flex items-center mb-3 text-foreground">
            <PlayCircle className="h-5 w-5 mr-2 text-primary" />
            Reels
            </h2>
        </div>
        <div className="flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4 no-scrollbar">
            {userVideoStories.map((story) => (
            <StoryCircle key={story.id} {...story} onClick={() => handleStoryClick(story)} />
            ))}
        </div>
      </div>

      {/* Seção de Alertas Recentes */}
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
      ) : (
        <p className="text-muted-foreground text-center py-4">Nenhum alerta recente. Seja o primeiro a reportar algo!</p>
      )}

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

      {/* Modal para Seleção de Tipo de Alerta */}
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
