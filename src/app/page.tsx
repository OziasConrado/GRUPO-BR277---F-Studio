
'use client';

import { useEffect, useState, useRef, type ChangeEvent, useCallback, type FormEvent } from 'react';
import Link from 'next/link';
import {
  List,
  Store,
  Headset,
  Newspaper,
  Video,
  Image as ImageIcon,
  X,
  Edit,
  PlayCircle,
  AlertTriangle,
  ShieldAlert, 
  ArrowRightCircle,
  Loader2,
  Phone,
  ListChecks,
  PlusCircle,
  Trash2,
  Check,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import PostCard, { type PostCardProps, type PollData } from '@/components/feed/post-card';
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
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { firestore, storage } from '@/lib/firebase/client';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToastAction } from '@/components/ui/toast';


async function createMentions(text: string, postId: string, fromUser: { uid: string, displayName: string | null, photoURL: string | null }, type: 'mention_post' | 'mention_comment') {
    if (!firestore) return;
    const mentionRegex = /@([\p{L}\p{N}_\s.-]+)/gu;
    const mentions = text.match(mentionRegex);
    if (!mentions) return;

    const mentionedUsernames = [...new Set(mentions.map(m => m.substring(1).trim()))];
    
    for (const username of mentionedUsernames) {
        if (username === fromUser.displayName) continue; // Don't notify self

        const usersRef = collection(firestore, "Usuarios");
        const q = query(usersRef, where("displayName", "==", username), limit(1));
        
        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const mentionedUserId = userDoc.id;

                const notificationRef = collection(firestore, 'Usuarios', mentionedUserId, 'notifications');
                await addDoc(notificationRef, {
                    type: type,
                    fromUserId: fromUser.uid,
                    fromUserName: fromUser.displayName || "Usuário",
                    fromUserAvatar: fromUser.photoURL || null,
                    postId: postId,
                    textSnippet: text.substring(0, 70) + (text.length > 70 ? '...' : ''), // Snippet of the text
                    timestamp: serverTimestamp(),
                    read: false,
                });
            }
        } catch (error) {
            console.error(`Error creating notification for ${username}:`, error);
        }
    }
}


const backgroundOptions = [
  { name: 'Padrão', bg: 'hsl(var(--card))', text: 'hsl(var(--card-foreground))' },
  { name: 'Azul', bg: '#002776', text: '#FFFFFF' },
  { name: 'Verde', bg: '#009c3b', text: '#FFFFFF' },
  { name: 'Amarelo', bg: '#ffdf00', text: '#FFFFFF' },
  { name: 'Gradiente', gradient: 'linear-gradient(to right, #002776, #009c3b, #ffdf00)', text: '#FFFFFF' },
];

const alertTypesForSelection = ["Acidente", "Obras na Pista", "Congestionamento", "Neblina/Cond. Climática", "Remoção/Veículo Acidentado", "Óleo na Pista", "Queda de Barreira", "Animal na Pista", "Queimada/Fumaça", "Ocorrência Policial", "Manifestação Popular", "Outro"];

const PollCreationModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: { question: string, options: string[] }) => void }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const { toast } = useToast();

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        } else {
            toast({ variant: "destructive", title: "Limite de opções", description: "Você pode adicionar no máximo 5 opções." });
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        }
    };

    const handleSave = () => {
        if (question.trim().length < 5) {
            toast({ variant: "destructive", title: "Pergunta inválida", description: "A pergunta da enquete deve ter pelo menos 5 caracteres." });
            return;
        }
        if (options.some(opt => opt.trim() === '')) {
            toast({ variant: "destructive", title: "Opções vazias", description: "Todas as opções devem ser preenchidas." });
            return;
        }
        onSave({ question: question.trim(), options: options.map(o => o.trim()) });
        // Reset state after saving
        setQuestion('');
        setOptions(['','']);
        onClose();
    };

    const handleClose = () => {
        setQuestion('');
        setOptions(['','']);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md rounded-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-xl">Criar Enquete</DialogTitle>
                    <DialogDescription>
                        Faça uma pergunta para a comunidade. Mínimo 2, máximo 5 opções.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="poll-question">Pergunta da Enquete</Label>
                        <Input 
                            id="poll-question" 
                            value={question} 
                            onChange={(e) => setQuestion(e.target.value)} 
                            placeholder="Ex: Qual o melhor pão com bolinho?"
                            className="mt-1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Opções de Resposta</Label>
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Opção ${index + 1}`}
                                />
                                {options.length > 2 ? (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(index)} className="text-destructive h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                ) : <div className="w-8 h-8"></div>}
                            </div>
                        ))}
                    </div>
                    {options.length < 5 && (
                        <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Opção
                        </Button>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave}>Salvar Enquete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


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
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollData, setPollData] = useState<{ question: string; options: string[] } | null>(null);

  // Hooks
  const { toast } = useToast();
  const { currentUser, userProfile, isProfileComplete } = useAuth();
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
          poll: data.poll || undefined, // Add poll data
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
                avatarUrl: data.thumbnailUrl || data.userAvatarUrl || 'https://placehold.co/180x320.png',
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
    const q = query(collection(firestore, 'alerts'), orderBy('timestamp', 'desc'), limit(6));
    
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
          userLocation: data.userLocation || 'Localização Desconhecida',
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
  const handleInteractionAttempt = (callback: () => void) => {
    if (!isProfileComplete) {
        toast({
            title: "Perfil Incompleto",
            description: "Você precisa completar seu perfil para interagir e publicar.",
            variant: "destructive",
            action: <ToastAction altText="Editar Perfil" onClick={() => router.push('/profile/edit')}>Editar Perfil</ToastAction>,
        });
        return;
    }
    callback();
  };
  
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
      setPollData(null); // Remove poll if media is added
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
    setPollData(null);
  }

  const handlePublish = async () => {
    if (!currentUser || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado ou o serviço está indisponível.' });
      return;
    }

    if (!isProfileComplete) {
      handleInteractionAttempt(() => {}); // This will show the toast to complete profile
      return;
    }

    setIsPublishing(true);

    try {
      let mediaUrl: string | undefined;

      if (selectedMediaForUpload) {
        const mediaType = selectedMediaForUpload.type.startsWith('image/') ? 'images' : 'videos';
        const storagePath = `${mediaType}/${currentUser.uid}/${Date.now()}_${selectedMediaForUpload.name}`;
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
          userLocation: userProfile?.location || 'Localização Desconhecida',
          timestamp: serverTimestamp(),
        });
        toast({ title: "Alerta Publicado!", description: "Seu alerta foi adicionado ao mural." });
      } else if (currentPostType === 'video') {
        await addDoc(collection(firestore, 'reels'), {
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anônimo',
          userAvatarUrl: currentUser.photoURL,
          thumbnailUrl: currentUser.photoURL,
          description: newPostText.trim(),
          videoUrl: mediaUrl,
          timestamp: serverTimestamp(),
        });
        toast({ title: "Reel Publicado!", description: "Seu vídeo está disponível para a comunidade." });
      } else { // 'image', 'text' or 'poll' post
        const postData: any = {
          userId: currentUser.uid,
          userName: currentUser.displayName || 'Anônimo',
          userAvatarUrl: currentUser.photoURL,
          userLocation: userProfile?.location || 'Localização Desconhecida',
          text: newPostText,
          reactions: { thumbsUp: 0, thumbsDown: 0 },
          edited: false,
          deleted: false,
          timestamp: serverTimestamp(),
        };
        if (mediaUrl) postData.uploadedImageUrl = mediaUrl;

        if (pollData) {
          postData.poll = {
            question: pollData.question,
            options: pollData.options.map((opt, index) => ({
              id: `option_${index + 1}`,
              text: opt,
              votes: 0
            }))
          };
        } else if (currentPostType === 'text' && !selectedMediaForUpload && newPostText.length <= 150 && selectedPostBackground.name !== 'Padrão') {
          postData.cardStyle = selectedPostBackground;
        }
        
        const docRef = await addDoc(collection(firestore, 'posts'), postData);
        
        if (currentUser && newPostText.trim()) {
            await createMentions(newPostText.trim(), docRef.id, { uid: currentUser.uid, displayName: currentUser.displayName, photoURL: currentUser.photoURL }, 'mention_post');
        }

        toast({ title: "Publicado!", description: "Sua postagem está na Time Line." });
      }

      resetFormState();
    } catch (error) {
      console.error("Error publishing content:", error);
      toast({ variant: 'destructive', title: 'Erro ao Publicar', description: 'Não foi possível salvar. Verifique o console para detalhes.' });
      setIsPublishing(false);
    }
  };


  const handleOpenAlertTypeModal = () => {
    handleRemoveMedia(); 
    setPollData(null);
    setCurrentPostType('alert'); 
    setSelectedPostBackground(backgroundOptions[0]); 
    setIsAlertTypeModalOpen(true);
  };
  
  const handleOpenMediaSelector = (type: 'image' | 'video') => {
    setPollData(null);
    setCurrentPostType(type);
    if(fileInputRef.current) {
        fileInputRef.current.accept = `${type}/*`;
        fileInputRef.current.click();
    }
  }

  const handleOpenPollModal = () => handleInteractionAttempt(() => {
    handleRemoveMedia();
    setCurrentPostType('text');
    setIsPollModalOpen(true);
  });

  const handleSavePoll = (data: { question: string; options: string[] }) => {
    setPollData(data);
    if (!newPostText.trim()) {
      setNewPostText(data.question);
    }
    setIsPollModalOpen(false);
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
  const canPublish = !isPublishing && currentUser && (
    (currentPostType === 'alert' && selectedAlertType && newPostText.trim() !== '') || 
    (currentPostType !== 'alert' && (newPostText.trim() !== '' || selectedMediaForUpload !== null || pollData !== null))
  );
  const showColorPalette = !mediaPreviewUrl && !pollData && currentPostType === 'text' && newPostText.length <= 150 && newPostText.length > 0;
  
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
      
      <div className="flex gap-3 h-24">
        <Button asChild
          variant="destructive"
          className="w-2/3 h-full bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-lg shadow-md"
        >
          <Link href="/emergencia">
              <Phone className="mr-2 h-6 w-6" />
              EMERGÊNCIA
          </Link>
        </Button>
        <div className="w-1/3 flex flex-col gap-3">
            <Button asChild variant="outline" className="h-full w-full text-xs rounded-lg hover:bg-primary/10 hover:text-primary">
              <Link href="/sau" className="flex-col items-center justify-center">
                <Headset className="h-5 w-5 mb-1" />
                <span>Concessões/SAU</span>
              </Link>
            </Button>
        </div>
      </div>

      <Card className="p-4 shadow-sm rounded-xl bg-white dark:bg-card">
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
              pollData ? "Adicione um texto para acompanhar sua enquete (opcional)..." :
              currentPostType === 'video' ? "Adicione uma legenda para seu vídeo..." :
              currentPostType === 'image' ? "Adicione uma legenda para sua foto..." :
              "No que você está pensando, viajante?"
            }
            className="mb-3 h-24 resize-none rounded-lg"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            style={
              !mediaPreviewUrl && !pollData && currentPostType === 'text' && selectedPostBackground.name !== 'Padrão'
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
            <div className="relative mb-3 w-32 h-32">
              {selectedMediaForUpload?.type.startsWith('video/') ? (
                <video src={mediaPreviewUrl} className="w-full h-full object-cover rounded-md border" data-ai-hint="user uploaded video preview">
                  <source src={mediaPreviewUrl} type={selectedMediaForUpload.type} />
                </video>
              ) : (
                <img src={mediaPreviewUrl} alt="Prévia da imagem" className="w-full h-full object-cover rounded-md border" data-ai-hint="user uploaded image preview"/>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 h-6 w-6"
                onClick={handleRemoveMedia}
                aria-label="Remover mídia"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {pollData && (
              <div className="relative mb-3 p-3 border rounded-lg bg-muted/20">
                  <p className="font-semibold text-sm text-foreground pr-8">Enquete anexada:</p>
                  <p className="text-sm text-muted-foreground truncate">{pollData.question}</p>
                  <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => setPollData(null)}
                  >
                      <X className="h-4 w-4" />
                  </Button>
              </div>
          )}

          {showColorPalette && (
            <div className="flex space-x-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              {backgroundOptions.map((option) => (
                <div
                  key={option.name}
                  onClick={() => setSelectedPostBackground(option)}
                  title={option.name}
                  className="w-8 h-8 rounded-full cursor-pointer flex-shrink-0 shadow-inner flex items-center justify-center border border-muted"
                  style={{
                    backgroundColor: option.gradient ? undefined : option.bg,
                    backgroundImage: option.gradient,
                  }}
                >
                  {selectedPostBackground.name === option.name && (
                    <Check className={cn(
                        "h-5 w-5",
                        option.name === 'Padrão' || option.name === 'Amarelo' ? 'text-foreground' : 'text-white'
                    )} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
              {!mediaPreviewUrl && !pollData ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary rounded-full"
                        onClick={handleOpenAlertTypeModal}
                      >
                        <ShieldAlert className="h-5 w-5" />
                        <span className="sr-only">Postar Alerta</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Postar Alerta</p></TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary rounded-full"
                        onClick={handleOpenPollModal}
                      >
                        <ListChecks className="h-5 w-5" />
                        <span className="sr-only">Criar Enquete</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Criar Enquete</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary rounded-full"
                        onClick={() => handleOpenMediaSelector('video')}
                      >
                        <Video className="h-5 w-5" />
                        <span className="sr-only">Adicionar Vídeo</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Adicionar Vídeo</p></TooltipContent>
                  </Tooltip>
                   <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary rounded-full"
                        onClick={() => handleOpenMediaSelector('image')}
                      >
                        <ImageIcon className="h-5 w-5" />
                        <span className="sr-only">Adicionar Foto</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Adicionar Foto</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="w-1"></div> // Placeholder to keep layout
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
              disabled={isPublishing || !canPublish}
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
          <div className="flex justify-between items-center px-1 mb-3">
            <h2 className="text-xl font-bold font-headline flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2 text-primary" />
              Alertas
            </h2>
            <Link href="/alertas" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Ver todos
                <ArrowRightCircle className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4 no-scrollbar snap-x snap-mandatory">
            {displayedAlertsFeed.map((alertData) => (
              <div key={alertData.id} className="snap-start flex-shrink-0">
                <Link href="/alertas" className="block">
                  <HomeAlertCard alert={alertData} />
                </Link>
              </div>
            ))}
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
      
      <PollCreationModal 
        isOpen={isPollModalOpen}
        onClose={() => setIsPollModalOpen(false)}
        onSave={handleSavePoll}
      />

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
