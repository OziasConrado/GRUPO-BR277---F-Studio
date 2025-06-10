
'use client';

import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Star,
  Phone,
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
  Edit, // Added Edit back as it's used in the new "Criar Publicação" card
  Beach, // Kept Beach as it's used for the Turismo button
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

const mockAdminStories: StoryCircleProps[] = [
  {
    id: 'story-admin-1',
    adminName: 'Admin Oficial',
    avatarUrl: 'https://placehold.co/180x320.png?text=AO',
    dataAIAvatarHint: 'app logo admin',
    hasNewStory: true,
    storyType: 'image',
  },
  {
    id: 'story-admin-2',
    adminName: 'Alerta Rota',
    avatarUrl: 'https://placehold.co/180x320.png?text=AR',
    dataAIAvatarHint: 'alert icon',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'story-admin-3',
    adminName: 'Manutenção',
    avatarUrl: 'https://placehold.co/180x320.png?text=MS',
    dataAIAvatarHint: 'maintenance tools',
    hasNewStory: false,
    storyType: 'image',
  },
  {
    id: 'story-admin-4',
    adminName: 'Novidades App',
    avatarUrl: 'https://placehold.co/180x320.png?text=NV',
    dataAIAvatarHint: 'megaphone icon',
    hasNewStory: true,
    storyType: 'video',
  },
  {
    id: 'story-admin-5',
    adminName: 'Dicas Seg',
    avatarUrl: 'https://placehold.co/180x320.png?text=DS',
    dataAIAvatarHint: 'shield icon',
    hasNewStory: false,
    storyType: 'image',
  },
  {
    id: 'story-admin-6',
    adminName: 'Promoções',
    avatarUrl: 'https://placehold.co/180x320.png?text=PR',
    dataAIAvatarHint: 'discount tag',
    hasNewStory: true,
    storyType: 'image',
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

const iconGridFeatures = [
  { title: 'Guia Comercial', Icon: Store, href: '/guia-comercial' },
  { title: 'Turismo', Icon: Landmark, href: '/turismo' },
  { title: 'Streaming', Icon: Video, href: '/streaming' },
  { title: 'Alertas', Icon: ShieldAlert, href: '/alertas' },
  { title: 'Notícias', Icon: Newspaper, href: '#' }, // TODO: Criar página de notícias
  { title: 'Mapa', Icon: MapIcon, href: '/ferramentas/mapa' },
  { title: 'Checklist', Icon: ListChecks, href: '/ferramentas/checklist' },
  { title: 'Contato SAU', Icon: Headset, href: '/sau' },
];

export default function FeedPage() {
  // State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryCircleProps | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false); // Still present, though UI is always visible
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState<PostCardProps[]>(initialMockPosts);
  const [selectedImageForUpload, setSelectedImageForUpload] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedPostBackground, setSelectedPostBackground] = useState(backgroundOptions[0]);

  // Hooks
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleToggleCreatePost = () => { // Still present, though UI is always visible
    setIsCreatingPost(!isCreatingPost);
    if (isCreatingPost) { // This block will run when UI is "closed" by this logic
      setNewPostText('');
      setSelectedImageForUpload(null);
      setImagePreviewUrl(null);
      setSelectedPostBackground(backgroundOptions[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Imagem muito grande',
          description: 'Por favor, selecione uma imagem menor que 5MB.',
        });
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

  const handlePublishPost = () => {
    if (newPostText.trim() === '' && !selectedImageForUpload) {
      toast({
        variant: 'destructive',
        title: 'Publicação vazia',
        description: 'Escreva algo ou adicione uma imagem para publicar.',
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
      newPost.dataAIUploadedImageHint = 'user uploaded content';
    } else if (newPostText.length <= 150 && selectedPostBackground?.name !== 'Padrão') {
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
    setIsCreatingPost(false); // This will effectively do nothing to the UI visibility based on current JSX
  };

  // Derived State
  const showColorPalette = !selectedImageForUpload && newPostText.length <= 150 && newPostText.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* Seção Destaque */}
      <div className="mb-3">
        <div className="px-1">
          <h2 className="text-xl font-bold font-headline flex items-center mb-3 text-foreground">
            <Star className="h-5 w-5 mr-2 text-primary" />
            Destaque
          </h2>
        </div>
        <div className="flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4 no-scrollbar">
          {mockAdminStories.map((story) => (
            <StoryCircle key={story.id} {...story} onClick={() => handleStoryClick(story)} />
          ))}
        </div>
      </div>

      {/* Botão de Emergência */}
      <EmergencyButtonModalTrigger
        variant="destructive"
        size="default"
        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-semibold rounded-lg shadow-md"
        iconClassName="h-5 w-5"
      >
        <Phone className="mr-2 h-5 w-5" />
        EMERGÊNCIA
      </EmergencyButtonModalTrigger>

      {/* Botões SAU e Turismo */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="py-3 text-base rounded-lg">
          <Link href="/sau">
            <Headset className="mr-2 h-5 w-5" />
            Contato SAU
          </Link>
        </Button>
        <Button asChild variant="outline" className="py-3 text-base rounded-lg">
          <Link href="/turismo">
            <Beach className="mr-2 h-5 w-5" />
            Turismo
          </Link>
        </Button>
      </div>

      {/* Seção de Criação de Post */}
      <Card className="p-4 shadow-sm">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Edit className="h-5 w-5 mr-2 text-primary" />
            Criar Publicação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Textarea
            placeholder="No que você está pensando, viajante?"
            className="mb-3 h-24 resize-none"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            style={
              !selectedImageForUpload && selectedPostBackground?.name !== 'Padrão'
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
              <img src={imagePreviewUrl} alt="Prévia da imagem" className="max-w-full h-auto rounded-md" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleRemoveImage}
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          {showColorPalette && (
            <div className="flex space-x-2 mb-3 overflow-x-auto no-scrollbar">
              {backgroundOptions.map((option) => (
                <div
                  key={option.name}
                  className={cn(
                    'w-8 h-8 rounded-full cursor-pointer border-2 border-transparent flex-shrink-0',
                    selectedPostBackground.name === option.name && 'border-primary',
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
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageInputChange}
            />
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center text-primary hover:text-primary/90"
              disabled={!!selectedImageForUpload}
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Foto/Vídeo
            </Button>
            <Button onClick={handlePublishPost} className="bg-primary hover:bg-primary/90 text-white">
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Ícones de Funcionalidades */}
      <div className="grid grid-cols-4 gap-4">
        {iconGridFeatures.map((feature) => (
          <Link href={feature.href} key={feature.title} className="flex flex-col items-center justify-center p-2">
            <div className="p-3 bg-card rounded-full shadow-md mb-2">
              <feature.Icon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-center text-xs font-medium text-foreground">{feature.title}</span>
          </Link>
        ))}
      </div>
      
      {/* AdMob Banner Placeholder */}
      <div className="my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-20 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50)</p>
      </div>


      {/* Feed de Posts */}
       <h2 className="text-2xl font-bold mb-2 font-headline text-left">
        <Star className="h-5 w-5 mr-2 text-primary inline-block" />
        Feed277
      </h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {/* Modal de Visualização de Stories */}
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
