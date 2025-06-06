
'use client';
import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import PostCard, { type PostCardProps, type PostReactions } from '@/components/feed/post-card';
import StoryCircle, { type StoryCircleProps } from '@/components/stories/StoryCircle';
import StoryViewerModal from '@/components/stories/StoryViewerModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Star, TrendingUp, Info, Edit, Image as ImageIcon, XCircle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const defaultReactions: PostReactions = {
  thumbsUp: 0,
  thumbsDown: 0,
};

const MOCK_POST_USER_NAMES = [
    'Carlos Caminhoneiro', 'Ana Viajante', 'Rota Segura Admin', 'Mariana Logística',
    'Pedro Estradeiro', 'Segurança Rodoviária', 'João Silva', 'Você', 'Ana Souza', 'Carlos Santos', 'Ozias Conrado'
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
  }
];


const initialMockPosts: PostCardProps[] = [
  {
    id: '1',
    userName: 'Carlos Caminhoneiro',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=CC',
    dataAIAvatarHint: 'truck driver',
    userLocation: 'Curitiba, PR',
    timestamp: '2 horas atrás',
    text: 'Estrada tranquila hoje na BR-116! Sol brilhando e sem trânsito. Bom dia a todos! @Ana Viajante, como está por aí? Aproveitando para testar o novo sistema de posts aqui no app. A interface está bem fluida e fácil de usar. Espero que todos tenham uma ótima viagem e que o dia seja produtivo para quem está na lida. @Ozias Conrado, tudo certo? Cuidado nas curvas e mantenham a atenção! Mais um pouco de texto para testar a funcionalidade de ver mais e ver menos, garantindo que tenhamos mais de 170 caracteres para que o botão apareça corretamente.',
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
            reactions: { thumbsUp: 2, thumbsDown: 0, userReaction: null }
          }
        ],
      },
      {
        id: 'c1-2',
        userName: 'Pedro Estradeiro',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=PE',
        dataAIAvatarHint: 'male traveler',
        timestamp: '45 minutos atrás',
        text: 'Também passei por lá, realmente um dia bom pra rodar.',
        reactions: { thumbsUp: 5, thumbsDown: 0, userReaction: null }
      }
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
        reactions: { thumbsUp: 15, thumbsDown: 0, userReaction: null }
      }
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
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryCircleProps | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState<PostCardProps[]>(initialMockPosts);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageForUpload, setSelectedImageForUpload] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedPostBackground, setSelectedPostBackground] = useState(backgroundOptions[0]);


  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleStoryClick = (story: StoryCircleProps) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const handleToggleCreatePost = () => {
    setIsCreatingPost(!isCreatingPost);
    if (isCreatingPost) { // If was true and now is false (Cancel clicked)
        setNewPostText('');
        setSelectedImageForUpload(null);
        setImagePreviewUrl(null);
        setSelectedPostBackground(backgroundOptions[0]);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
    }
  };

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
      setSelectedPostBackground(backgroundOptions[0]); // Reset background if image is chosen
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    } else if (newPostText.length <= 150 && selectedPostBackground && selectedPostBackground.name !== 'Padrão') {
      newPost.cardStyle = {
        backgroundColor: selectedPostBackground.gradient ? undefined : selectedPostBackground.bg,
        backgroundImage: selectedPostBackground.gradient,
        color: selectedPostBackground.text,
        name: selectedPostBackground.name, 
      };
    }


    setPosts(prevPosts => [newPost, ...prevPosts]);
    setNewPostText('');
    setSelectedImageForUpload(null);
    setImagePreviewUrl(null);
    setSelectedPostBackground(backgroundOptions[0]);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setIsCreatingPost(false);
  };

  const showColorPalette = !selectedImageForUpload && newPostText.length <= 150 && newPostText.length > 0;


  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="px-1">
          <h2 className="text-xl font-bold font-headline flex items-center mb-1 text-foreground">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Destaques dos Administradores
          </h2>
          <p className="text-xs text-muted-foreground ml-7">Avisos importantes e novidades da equipe Rota Segura.</p>
        </div>

        <div className="mt-4 flex overflow-x-auto space-x-2 pb-3 -mx-4 px-4 no-scrollbar">
          {mockAdminStories.map((story) => (
            <StoryCircle
              key={story.id}
              {...story}
              onClick={() => handleStoryClick(story)}
            />
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2 font-headline text-left">Feed277</h2>
      
      <div className="mb-4">
        <Button
            onClick={handleToggleCreatePost}
            className={cn(
                "w-full sm:w-auto",
                "bg-transparent border border-primary text-primary",
                "hover:bg-primary/10 hover:text-primary"
            )}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isCreatingPost ? 'Cancelar Publicação' : 'Nova Publicação'}
        </Button>
      </div>

      {isCreatingPost && (
        <Card className="mb-6 rounded-xl shadow-md">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="No que você está pensando?"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full rounded-lg min-h-[80px] text-base bg-background/70"
              rows={3}
            />

            {imagePreviewUrl && (
              <div className="relative group w-32 h-32 rounded-md overflow-hidden border">
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveImage}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}

            {showColorPalette && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1.5">Escolha um fundo (para posts curtos):</p>
                <div className="flex flex-wrap gap-2">
                  {backgroundOptions.map(opt => (
                    <Button
                      key={opt.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPostBackground(opt)}
                      className={`h-8 w-8 p-0 rounded-full border-2 ${selectedPostBackground.name === opt.name ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{ background: opt.gradient || opt.bg }}
                      aria-label={`Selecionar fundo ${opt.name}`}
                    >
                       {selectedPostBackground.name === opt.name && opt.name === 'Padrão' && <Check className="h-4 w-4 text-primary"/>}
                       {selectedPostBackground.name === opt.name && opt.name !== 'Padrão' && <Check className="h-4 w-4" style={{color: opt.text === '#FFFFFF' ? '#000000' : opt.text }}/>}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageInputChange}
                className="hidden"
              />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Adicionar imagem" className="text-primary">
                <ImageIcon className="h-7 w-7" />
              </Button>
              <Button onClick={handlePublishPost} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Publicar
              </Button>
            </div>
            
            <div className="mt-4 h-[50px] bg-muted/30 rounded-lg flex items-center justify-center text-sm text-muted-foreground">
              Espaço para Banner AdMob (Ex: 320x50)
            </div>
          </CardContent>
        </Card>
      )}


      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-sm font-medium font-headline">Publicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold">+{posts.length}</div>
            <p className="text-xs text-muted-foreground">
              Dos usuários
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-sm font-medium font-headline">Destaques</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold">Top #1</div>
            <p className="text-xs text-muted-foreground">
              Mais engajado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
      <StoryViewerModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        story={selectedStory}
      />
    </div>
  );
}

    
