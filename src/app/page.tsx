
import PostCard, { type PostCardProps } from '@/components/feed/post-card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockPosts: PostCardProps[] = [
  {
    id: '1',
    userName: 'Carlos Caminhoneiro',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=CC',
    dataAIAvatarHint: 'truck driver',
    timestamp: '2 horas atrás',
    text: 'Estrada tranquila hoje na BR-116! Sol brilhando e sem trânsito. Bom dia a todos!',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAIImageHint: 'highway sunny day',
    reactions: { thumbsUp: 152, heart: 25, laugh: 10 },
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
            text: 'Obrigado, Mariana!' 
          }
        ]
      },
      {
        id: 'c1-2',
        userName: 'Pedro Estradeiro',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=PE',
        dataAIAvatarHint: 'male traveler',
        timestamp: '45 minutos atrás',
        text: 'Também passei por lá, realmente um dia bom pra rodar.',
      }
    ],
  },
  {
    id: '2',
    userName: 'Ana Viajante',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=AV',
    dataAIAvatarHint: 'woman traveler',
    timestamp: '5 horas atrás',
    text: 'Alerta de neblina densa na Serra do Mar. Redobrem a atenção, pessoal!',
    imageUrl: 'https://placehold.co/600x300.png',
    dataAIImageHint: 'foggy mountain road',
    reactions: { thumbsUp: 98, heart: 15, laugh: 2 },
    commentsData: [
      {
        id: 'c2-1',
        userName: 'Segurança Rodoviária',
        userAvatarUrl: 'https://placehold.co/40x40.png?text=SR',
        dataAIAvatarHint: 'safety logo',
        timestamp: '4 horas atrás',
        text: 'Obrigado pelo alerta, Ana! Informação crucial.',
      }
    ],
  },
  {
    id: '3',
    userName: 'Rota Segura Admin',
    userAvatarUrl: 'https://placehold.co/40x40.png?text=RS',
    dataAIAvatarHint: 'app logo',
    timestamp: '1 dia atrás',
    text: 'Nova funcionalidade no app: Checklist de Viagem aprimorado! Confira na seção de Ferramentas.',
    reactions: { thumbsUp: 210, heart: 50, laugh: 5 },
    commentsData: [],
  },
];

export default function FeedPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 font-headline text-center sm:text-left">Feed de Notícias</h1>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glassmorphic rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Publicações Recentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{mockPosts.length}</div>
            <p className="text-xs text-muted-foreground">
              Novas atualizações da comunidade
            </p>
          </CardContent>
        </Card>
        <Card className="glassmorphic rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Alertas Ativos</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Informações importantes sobre rotas
            </p>
          </CardContent>
        </Card>
        <Card className="glassmorphic rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Destaques da Comunidade</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Top #1</div>
            <p className="text-xs text-muted-foreground">
              Post mais engajado da semana
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="space-y-6">
        {mockPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}

