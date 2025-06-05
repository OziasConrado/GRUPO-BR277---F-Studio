
'use client';
import { useEffect, useState } from 'react';
import PostCard, { type PostCardProps, type PostReactions } from '@/components/feed/post-card';
import StoryCircle, { type StoryCircleProps } from '@/components/stories/StoryCircle';
import StoryViewerModal from '@/components/stories/StoryViewerModal';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Star, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; 

const defaultReactions: PostReactions = {
  thumbsUp: 0,
  thumbsDown: 0,
  heart: 0,
  laugh: 0,
  wow: 0,
  sad: 0,
  angry: 0,
};

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


const mockPosts: PostCardProps[] = [
  {
    id: '1',
    userName: 'Carlos Caminhoneiro',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=CC',
    dataAIAvatarHint: 'truck driver',
    timestamp: '2 horas atrás',
    text: 'Estrada tranquila hoje na BR-116! Sol brilhando e sem trânsito. Bom dia a todos! Aproveitando para testar o novo sistema de posts aqui no app. A interface está bem fluida e fácil de usar. Espero que todos tenham uma ótima viagem e que o dia seja produtivo para quem está na lida. Cuidado nas curvas e mantenham a atenção!',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAIImageHint: 'highway sunny day square',
    reactions: { ...defaultReactions, thumbsUp: 152, heart: 25, laugh: 10, thumbsDown: 5, wow: 12 },
    commentsData: [
      {
        id: 'c1-1',
        userName: 'Mariana Logística',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=ML',
        dataAIAvatarHint: 'logistics woman',
        timestamp: '1 hora atrás',
        text: 'Que ótimo, Carlos! Boas viagens!',
        replies: [
          {
            id: 'r1-1-1',
            userName: 'Carlos Caminhoneiro',
            userAvatarUrl: 'https://placehold.co/40x40.png?text=CC',
            dataAIAvatarHint: 'truck driver',
            timestamp: '30 minutos atrás',
            text: 'Obrigado, Mariana!',
            reactions: { thumbsUp: 0, thumbsDown: 0 }
          }
        ],
        reactions: { thumbsUp: 0, thumbsDown: 0 }
      },
      {
        id: 'c1-2',
        userName: 'Pedro Estradeiro',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=PE',
        dataAIAvatarHint: 'male traveler',
        timestamp: '45 minutos atrás',
        text: 'Também passei por lá, realmente um dia bom pra rodar.',
        reactions: { thumbsUp: 0, thumbsDown: 0 }
      }
    ],
  },
  {
    id: '2',
    userName: 'Ana Viajante',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=AV',
    dataAIAvatarHint: 'woman traveler',
    timestamp: '5 horas atrás',
    text: 'Alerta de neblina densa na Serra do Mar. Redobrem a atenção, pessoal! A visibilidade está bastante comprometida e a pista pode estar escorregadia. Recomendo acender os faróis de neblina e reduzir a velocidade consideravelmente.',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAIImageHint: 'foggy mountain road square',
    reactions: { ...defaultReactions, thumbsUp: 98, heart: 15, sad: 20, thumbsDown: 2 },
    commentsData: [
      {
        id: 'c2-1',
        userName: 'Segurança Rodoviária',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=SR',
        dataAIAvatarHint: 'safety logo',
        timestamp: '4 horas atrás',
        text: 'Obrigado pelo alerta, Ana! Informação crucial.',
        reactions: { thumbsUp: 0, thumbsDown: 0 }
      }
    ],
  },
  {
    id: '3',
    userName: 'Rota Segura Admin',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=RS',
    dataAIAvatarHint: 'app logo',
    timestamp: '1 dia atrás',
    text: 'Nova funcionalidade no app: Checklist de Viagem aprimorado! Confira na seção de Ferramentas. Agora com mais itens e a possibilidade de salvar seus checklists para viagens futuras. Feedback é sempre bem-vindo!',
    imageUrl: 'https://placehold.co/600x600.png',
    dataAIImageHint: 'app interface checklist square',
    reactions: { ...defaultReactions, thumbsUp: 210, heart: 50, wow: 30 },
    commentsData: [],
  },
];

export default function FeedPage() {
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryCircleProps | null>(null);

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

      <h2 className="text-2xl font-bold mb-4 font-headline text-left">Feed277</h2>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
            <CardTitle className="text-sm font-medium font-headline">Publicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-xl font-bold">+{mockPosts.length}</div>
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
        {mockPosts.map((post) => (
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

    