
'use client';

import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  Star,
  // Phone, // Ícone de telefone SVG inline agora é usado
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
  PlayCircle, // Adicionado para Histórias de Usuário
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

// Novos dados mock para Histórias de Usuários (vídeos)
const mockUserVideoStories: StoryCircleProps[] = [
  {
    id: 'user-story-1',
    adminName: 'Vídeo de @CarlosC', // adminName será usado como userName para o StoryCircle
    avatarUrl: 'https://placehold.co/180x320.png?text=VC', // Thumbnail do vídeo
    dataAIAvatarHint: 'truck highway sunset', // Descrição para o thumbnail
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

export default function FeedPage() {
  // State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryCircleProps | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false); // Removido, o card de criar post está sempre visível.
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

  // handleToggleCreatePost removido, pois o card agora está sempre visível.

  const handleImageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
      setSelectedPostBackground(backgroundOptions[0]); // Reset background if image is added
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
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
      newPost.uploadedImageUrl = imagePreviewUrl; // Use o preview como imagem do post
      newPost.dataAIUploadedImageHint = 'user uploaded content';
    } else if (newPostText.length <= 150 && selectedPostBackground?.name !== 'Padrão') {
      // Aplicar estilo de fundo colorido apenas se NÃO houver imagem
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
    // setIsCreatingPost(false); // Não necessário mais
  };

  // Derived State
  const showColorPalette = !selectedImageForUpload && newPostText.length <= 150 && newPostText.length > 0;


  return (
    <div className="w-full space-y-6">
      {/* Botão de Emergência, SAU e Turismo - Mantidos no topo */}
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

      {/* AdMob Banner Placeholder */}
      <div className="my-4 p-4 rounded-xl bg-muted/30 border border-dashed h-20 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Espaço para Banner AdMob (Ex: 320x50)</p>
      </div>

      {/* Seção de Criação de Post */}
      <Card className="p-4 shadow-sm rounded-xl">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Edit className="h-5 w-5 mr-2 text-primary" />
            Criar Publicação
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Textarea
            placeholder="No que você está pensando, viajante?"
            className="mb-3 h-24 resize-none rounded-lg"
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
              <img src={imagePreviewUrl} alt="Prévia da imagem" className="max-w-full h-auto rounded-md border" />
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
              className="flex items-center text-primary hover:text-primary/90 rounded-full"
              disabled={!!selectedImageForUpload} // Desabilita se já tem imagem
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Foto/Vídeo
            </Button>
            <Button onClick={handlePublishPost} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
              Publicar
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Seção Histórias da Comunidade (Vídeos de Usuários) */}
      <div className="mb-3 mt-8"> {/* Adicionado mt-8 para separar da criação de post */}
        <div className="px-1">
          <h2 className="text-xl font-bold font-headline flex items-center mb-3 text-foreground">
            <PlayCircle className="h-5 w-5 mr-2 text-primary" /> {/* Ícone alterado */}
            Histórias da Comunidade
          </h2>
        </div>
        <div className="flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4 no-scrollbar">
          {mockUserVideoStories.map((story) => (
            <StoryCircle key={story.id} {...story} onClick={() => handleStoryClick(story)} />
          ))}
        </div>
      </div>


      {/* Título Feed */}
      <h2 className="text-2xl font-bold pt-2 font-headline text-left">
        <Star className="h-5 w-5 mr-2 text-primary inline-block" />
        Feed277
      </h2>

      {/* Feed de Posts */}
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
