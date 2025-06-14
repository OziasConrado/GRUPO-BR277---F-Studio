
'use client';

import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  List,
  Store,
  Landmark,
  Headset,
  ShieldAlert, 
  Newspaper,
  MapIcon,
  Video,
  ListChecks,
  Image as ImageIcon,
  XCircle,
  Edit,
  PlayCircle,
  AlertTriangle, // Added for new Alertas button
  Construction, // For mock data
  TrafficConeIcon, // For mock data
  CloudFog, // For mock data
  Flame as FlameIcon, // For mock data
  ArrowRightCircle // For "Ver Mais Alertas" card
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
import HomeAlertCard from '@/components/alerts/home-alert-card'; // Import new component

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

// Mock data for User Video Stories
const mockUserVideoStories: StoryCircleProps[] = [
  {
    id: 'user-story-1',
    adminName: 'Vídeo de @CarlosC',
    avatarUrl: 'https://placehold.co/180x320.png?text=VC',
    dataAIAvatarHint: 'truck highway sunset',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'user-story-2',
    adminName: 'Paisagem da @AnaV',
    avatarUrl: 'https://placehold.co/180x320.png?text=PV',
    dataAIAvatarHint: 'mountain road aerial',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'user-story-3',
    adminName: 'Dica do @PedroE',
    avatarUrl: 'https://placehold.co/180x320.png?text=DP',
    dataAIAvatarHint: 'driver giving tips',
    hasNewStory: false,
    storyType: 'video',
  },
  {
    id: 'user-story-4',
    adminName: 'Alerta da @MariLog',
    avatarUrl: 'https://placehold.co/180x320.png?text=AM',
    dataAIAvatarHint: 'road traffic alert',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'user-story-5',
    adminName: 'Manobra do @JoaoS',
    avatarUrl: 'https://placehold.co/180x320.png?text=MJ',
    dataAIAvatarHint: 'truck maneuvering',
    hasNewStory: false,
    storyType: 'video',
  },
  {
    id: 'user-story-6',
    adminName: 'Fim de Tarde com @Ozias',
    avatarUrl: 'https://placehold.co/180x320.png?text=FT',
    dataAIAvatarHint: 'sunset over fields',
    hasNewStory: true,
    storyType: 'video',
  },
];


const initialMockPosts: PostCardProps[] = [
  {
    id: '1',
    userName: 'Carlos Caminhoneiro',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=CC',
    dataAIAvatarHint: 'truck driver',
    userLocation: 'Curitiba, PR',
    timestamp: '2 horas atrás',
    text: 'Estrada tranquila hoje na BR-116! Sol brilhando e sem trânsito. Bom dia a todos! @Ana Viajante, como está por aí? Aproveitando para testar o novo sistema de posts aqui no app. A interface está bem fluida e fácil de usar. Espero que todos tenham uma ótima viagem e que o dia seja produtivo para quem está na lida. @Ozias Conrado, tudo certo? Cuidado nas curvas e mantenham a atenção! Mais um pouco de texto para testar a funcionalidade de ver mais e ver menos, garantindo que tenhamos mais de 130 caracteres para que o botão apareça corretamente.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'highway sunny day',
    reactions: { ...defaultReactions, thumbsUp: 152, thumbsDown: 5 },
    commentsData: [
      {
        id: 'c1-1',
        userName: 'Mariana Logística',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=ML',
        dataAIAvatarHint: 'logistics woman',
        timestamp: '1 hora atrás',
        text: 'Que ótimo, @Carlos Caminhoneiro! Boas viagens!',
        reactions: { thumbsUp: 10, thumbsDown: 1, userReaction: null },
        replies: [
          {
            id: 'r1-1-1',
            userName: 'Carlos Caminhoneiro',
            userAvatarUrl: 'https://placehold.co/40x40.png?text=CC',
            dataAIAvatarHint: 'truck driver',
            timestamp: '30 minutos atrás',
            text: 'Obrigado, @Mariana Logística!',
            reactions: { thumbsUp: 2, thumbsDown: 0, userReaction: null },
          },
        ],
      },
      {
        id: 'c1-2',
        userName: 'Pedro Estradeiro',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=PE',
        dataAIAvatarHint: 'male traveler',
        timestamp: '45 minutos atrás',
        text: 'Também passei por lá, realmente um dia bom pra rodar.',
        reactions: { thumbsUp: 5, thumbsDown: 0, userReaction: null },
      },
    ],
    bio: 'Caminhoneiro experiente, rodando pelas estradas do Brasil há mais de 20 anos. Compartilhando dicas e paisagens.',
    instagramUsername: 'carlos_trucker',
    allKnownUserNames: MOCK_POST_USER_NAMES,
  },
  {
    id: '2',
    userName: 'Ana Viajante',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=AV',
    dataAIAvatarHint: 'woman traveler',
    userLocation: 'São Paulo, SP',
    timestamp: '5 horas atrás',
    text: 'Alerta de neblina densa na Serra do Mar. Redobrem a atenção, pessoal! A visibilidade está bastante comprometida e a pista pode estar escorregadia. Recomendo acender os faróis de neblina e reduzir a velocidade consideravelmente. @Segurança Rodoviária, por favor, verifiquem a área.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'foggy mountain road',
    reactions: { ...defaultReactions, thumbsUp: 98, thumbsDown: 2 },
    commentsData: [
      {
        id: 'c2-1',
        userName: 'Segurança Rodoviária',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=SR',
        dataAIAvatarHint: 'safety logo',
        timestamp: '4 horas atrás',
        text: 'Obrigado pelo alerta, @Ana Viajante! Informação crucial. Equipe já notificada.',
        reactions: { thumbsUp: 15, thumbsDown: 0, userReaction: null },
      },
    ],
    bio: 'Aventureira e fotógrafa amadora. Adoro explorar novos lugares e compartilhar minhas experiências de viagem.',
    instagramUsername: 'ana_explora',
    allKnownUserNames: MOCK_POST_USER_NAMES,
  },
  {
    id: '3',
    userName: 'Rota Segura Admin',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=RS',
    dataAIAvatarHint: 'app logo',
    userLocation: 'Brasil',
    timestamp: '1 dia atrás',
    text: 'Nova funcionalidade no app: Checklist de Viagem aprimorado! Confira na seção de Ferramentas. Agora com mais itens e a possibilidade de salvar seus checklists para viagens futuras. Feedback é sempre bem-vindo!',
    reactions: { ...defaultReactions, thumbsUp: 210, thumbsDown: 3 },
    commentsData: [],
    bio: 'Perfil oficial do app Rota Segura. Novidades, dicas e suporte para você, caminhoneiro e viajante!',
    instagramUsername: 'rotasegura_app',
    allKnownUserNames: MOCK_POST_USER_NAMES,
  },
];

const backgroundOptions = [
  { name: 'Padrão', bg: 'hsl(var(--card))', text: 'hsl(var(--card-foreground))' },
  { name: 'Azul', bg: '#002776', text: '#FFFFFF' },
  { name: 'Verde', bg: '#009c3b', text: '#FFFFFF' },
  { name: 'Amarelo', bg: '#ffdf00', text: '#002776' },
  { name: 'Gradiente', gradient: 'linear-gradient(to right, #002776, #009c3b, #ffdf00)', text: '#FFFFFF' },
];

// Mock data for Home Alerts
const mockAlertsFeed: Array<{ id: string; type: string; description: string; location: string; }> = [
  { id: 'alert-1', type: 'Acidente', description: 'Colisão grave na BR-277, Km 35. Trânsito totalmente parado sentido litoral. Use desvios.', location: 'BR-277, Km 35 (Litoral)'},
  { id: 'alert-2', type: 'Obras', description: 'Pista interditada para obras de recapeamento entre os Kms 110-115. Siga pela marginal.', location: 'BR-116, Km 112'},
  { id: 'alert-3', type: 'Congestionamento', description: 'Fluxo intenso de veículos na região central. Evite o centro se possível.', location: 'Centro de Curitiba'},
  { id: 'alert-4', type: 'Neblina', description: 'Visibilidade reduzida na serra. Acenda os faróis e dirija com cautela redobrada.', location: 'Serra do Mar - BR-277'},
  { id: 'alert-5', type: 'Queimada', description: 'Fumaça densa sobre a pista devido a queimada próxima. Risco de baixa visibilidade.', location: 'PR-407, Km 5'},
];


export default function FeedPage() {
  // State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryCircleProps | null>(null);
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState<PostCardProps[]>(initialMockPosts);
  const [selectedImageForUpload, setSelectedImageForUpload] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedPostBackground, setSelectedPostBackground] = useState(backgroundOptions[0]);

  // Hooks
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Effects
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
          description: `Por favor, selecione um arquivo menor que 5MB. O tipo de arquivo selecionado foi: ${file.type}`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast({
          variant: 'destructive',
          title: 'Tipo de arquivo inválido',
          description: 'Por favor, selecione uma imagem ou vídeo.',
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setSelectedImageForUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedPostBackground(backgroundOptions[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishPost = () => {
    if (newPostText.trim() === '' && !selectedImageForUpload) {
      toast({
        variant: 'destructive',
        title: 'Publicação vazia',
        description: 'Escreva algo ou adicione uma imagem/vídeo para publicar.',
      });
      return;
    }

    const newPost: PostCardProps = {
      id: `post-${Date.now()}`,
      userName: 'Você',
      userAvatarUrl: 'https://placehold.co/40x40.png?text=EU',
      dataAIAvatarHint: 'current user',
      userLocation: 'Sua Localização',
      timestamp: 'Agora mesmo',
      text: newPostText,
      reactions: { ...defaultReactions },
      commentsData: [],
      allKnownUserNames: MOCK_POST_USER_NAMES,
      bio: 'Este é o seu perfil.',
      instagramUsername: 'seu_insta',
    };

    if (selectedImageForUpload && imagePreviewUrl) {
      newPost.uploadedImageUrl = imagePreviewUrl;
      newPost.dataAIUploadedImageHint = selectedImageForUpload.type.startsWith('video/') ? 'user uploaded video' : 'user uploaded image';
    } else if (newPostText.length <= 150 && selectedPostBackground?.name !== 'Padrão' && selectedPostBackground.name !== 'Alertas') {
      newPost.cardStyle = {
        backgroundColor: selectedPostBackground.gradient ? undefined : selectedPostBackground.bg,
        backgroundImage: selectedPostBackground.gradient,
        color: selectedPostBackground.text,
        name: selectedPostBackground.name,
      };
    }

    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setNewPostText('');
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    setSelectedPostBackground(backgroundOptions[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Derived State
  const canPublish = newPostText.trim() !== '' || selectedImageForUpload !== null;
  const showColorPalette = !imagePreviewUrl && newPostText.length <= 150 && newPostText.length > 0 && selectedPostBackground.name !== 'Alertas';

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
            placeholder="No que você está pensando, viajante?"
            className="mb-3 h-24 resize-none rounded-lg"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            style={
              !imagePreviewUrl && selectedPostBackground?.name !== 'Padrão' && selectedPostBackground.name !== 'Alertas'
                ? {
                    backgroundColor: selectedPostBackground.gradient ? undefined : selectedPostBackground.bg,
                    backgroundImage: selectedPostBackground.gradient,
                    color: selectedPostBackground.text,
                  }
                : {}
            }
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

          {showColorPalette && (
            <div className="flex space-x-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              {backgroundOptions.map((option) => {
                if (option.name === 'Alertas') return null;
                return (
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
                );
              })}
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
                      handleRemoveImage();
                      setSelectedPostBackground(backgroundOptions.find(opt => opt.name === 'Padrão') || backgroundOptions[0]);
                      textareaRef.current?.focus();
                      toast({ title: "Alerta de Texto", description: "Escreva seu alerta. Planos de fundo coloridos não se aplicam a este tipo de post." });
                    }}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Alertas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "video/*";
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Video className="h-4 w-4" />
                    Vídeo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs hover:bg-muted/50 rounded-lg py-2 px-3 gap-1"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "image/*";
                        fileInputRef.current.click();
                      }
                    }}
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
              disabled={!canPublish}
            >
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Alertas Recentes */}
      {mockAlertsFeed.length > 0 && (
        <div className="pt-4 pb-2"> {/* Adjusted vertical spacing */}
          <div className="flex overflow-x-auto space-x-3 pb-2 -mx-1 px-1 no-scrollbar">
            {mockAlertsFeed.slice(0, 3).map((alertData) => (
              <HomeAlertCard key={alertData.id} alert={alertData} />
            ))}
            {mockAlertsFeed.length > 3 && (
              <div className="w-[260px] flex-shrink-0 h-full flex items-stretch">
                <Button asChild variant="outline" className="w-full h-full rounded-xl flex flex-col items-center justify-center text-center p-3 shadow-lg hover:bg-card/95 dark:hover:bg-muted/30 transition-colors duration-150">
                  <Link href="/alertas" className="flex flex-col items-center justify-center h-full">
                    <ArrowRightCircle className="h-10 w-10 mb-2 text-primary" />
                    <span className="text-sm font-semibold">Ver Próximos<br/>Alertas</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <div className="mt-3 px-1"> 
            <Button asChild variant="outline" className="w-full rounded-lg">
              <Link href="/alertas">
                Consultar Mural de Alertas ({mockAlertsFeed.length})
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      <div className="mb-3 mt-4"> {/* Adjusted spacing */}
        <div className="px-1">
          <h2 className="text-xl font-bold font-headline flex items-center mb-3 text-foreground">
            <PlayCircle className="h-5 w-5 mr-2 text-primary" />
            Reels
          </h2>
        </div>
        <div className="flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4 no-scrollbar">
          {mockUserVideoStories.map((story) => (
            <StoryCircle key={story.id} {...story} onClick={() => handleStoryClick(story)} />
          ))}
        </div>
      </div>

      <h2 className="text-xl font-bold pt-2 font-headline text-left">
        <List className="h-5 w-5 mr-2 text-primary inline-block" />
        Time Line
      </h2>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {selectedStory && (
        <StoryViewerModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          story={selectedStory}
        />
      )}
    </div>
  );
}
