
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Cctv, Search, Phone, Route, Star, Loader2, Shield, PlusCircle, AlertCircle } from 'lucide-react';
import StreamFilters from '@/components/streaming/stream-filters';
import StreamViewerModal from '@/components/streaming/StreamViewerModal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Banners from '@/components/banners/Banners';
import { useAuth } from '@/contexts/AuthContext';
import { toggleFavoriteServer, fetchAlertsServer } from '@/app/actions/firestore';
import { useToast } from '@/hooks/use-toast';
import type { HomeAlertCardData } from '@/components/alerts/home-alert-card';
import HomeAlertCard from '@/components/alerts/home-alert-card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ReportAlertSheet from '@/components/alerts/report-alert-sheet';

export interface StreamCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  dataAIThumbnailHint?: string;
  category: string;
  isLive: boolean;
  streamUrl: string;
}

const mockStreamsData: StreamCardProps[] = [
  { id: 'stream-cwb-1', title: 'BR-376, km 594', description: 'Contorno Sul | Viaduto Caiuá/CIC', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'highway traffic', category: 'Curitiba-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/a8b563b95ba9299432dfaf5b8a8f6962aedd36e58d15d22c3b9cffeec6a32001e18ae8897e091f1981234490ee24' },
  { id: 'stream-cwb-2', title: 'BR-116, km 113', description: 'Contorno Leste | Bairro Umbará', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'road intersection', category: 'Curitiba-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/a3a1e898486a65603b809dde9804a58f77042874f324f77a2a0ddeb76a4c741179d75f5643d74090c7b3c0101fe8' },
  { id: 'stream-cwb-3', title: 'BR-277, km 82', description: 'Bairro Jardim das Americas', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'city road', category: 'Curitiba-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/440357609a40573a6ffbfb02b3204d9a8cc6ab0953d79fd1f0d5c1eff8e48073aa8288b30e551a81893e6454730b' },
  { id: 'stream-cl-1', title: 'BR-277, km 109', description: 'Rodovia do Café | Passaúna/Curitiba', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'highway landscape', category: 'Campo Largo-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/67031ee87fd2f06174a39082a9d702a6d1da6798c95059594b866cf3b354d947bdf1947c14bdcf5b1dfa4f7252d8' },
  { id: 'stream-cl-2', title: 'BR-277, km 114', description: 'Rodovia do Café, sentido Oeste', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'road view', category: 'Campo Largo-PR', isLive: false, streamUrl: 'https://cloud.fullcam.me/#/cembed/0a15af43557f75d73edc98b636283de1fd8c66adf2e994c01de2df7631b100c6b0f8e11c81434eb62045cae64081' },
  { id: 'stream-cl-3', title: 'BR-277, km 117', description: 'Rodovia do Café | Bairro Cercadinho', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'countryside road', category: 'Campo Largo-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/963087f7817549a681919bbcbbed9d82524ed38ba3e579b8ec4075ee96a0c95d7c637fc79159b5345abc59ff1c4d' },
  { id: 'stream-cl-4', title: 'BR-277, km 120', description: 'Rodovia do café | Bairro Rondinha', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'road traffic flow', category: 'Campo Largo-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/33b87f05374eb7dab38e299235ff1d1a5a913a828258fefaf8113790f20d398882b4d23de37ff672906f7a70fe4e' },
  { id: 'stream-cl-5', title: 'BR-277, km 122', description: 'Rodovia do Café | Bairro Rondinha', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'highway junction', category: 'Campo Largo-PR', isLive: false, streamUrl: 'https://cloud.fullcam.me/#/cembed/274be9e7132e3e7694fa016054d0841a527c63cba59910ae99d245f65ea556a4ee695b2cdb078c07a3e52ea9206e' },
  { id: 'stream-morretes-1', title: 'BR-277, km 33', description: 'Serra do Mar', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'mountain road view', category: 'Morretes-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/d3f7801570225d8089b6e6a423b163ba2a0b73dac0d818ef2d2ab36261fd25ce39d6a7c906a7a63c1d6c3a48422c' },
  { id: 'stream-morretes-2', title: 'BR-277, km 40+500', description: 'Serra do Mar', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'scenic mountain road', category: 'Morretes-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/6f4754d21c28be320bf30f026d392ba0386fb2c67518aaef07aa54b93b9e7b726eca833bc90805c274cf16132606' },
  { id: 'stream-pg-1', title: 'BR-376, km 494', description: 'Rodovia do Café | Subida da VOLVO', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'uphill highway', category: 'Ponta Grossa-PR', isLive: true, streamUrl: 'https://cloud.fullcam.me/#/cembed/fbd243231c0d8d76438670ff6cf012b01a90e70cf4a6e497a336a6897aee31371d3c9ce5311196b56ab59f7f17d7' },
  { id: 'stream-sp-1', title: 'Via Dutra', description: 'Chegada', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'city arrival highway', category: 'São Paulo/Capital', isLive: true, streamUrl: 'https://rtsp.me/embed/dN42a6Sy/' },
  { id: 'stream-sp-2', title: 'Via Dutra', description: 'Saída', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'city departure highway', category: 'São Paulo/Capital', isLive: false, streamUrl: 'https://rtsp.me/embed/BkkN7hk7/' },
  { id: 'stream-guaratuba-1', title: 'Praia Central', description: 'Avenida Atlântica | Vista 1', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'beach view avenue', category: 'Guaratuba-PR', isLive: true, streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/portaldacidadegtba//false/false/V2tjeGMyRXhjRmhQU0dST1lWUldlbGxxU210alJtdDVVbTA1YVUwd05IZFVSekZQWkcxS1ZFNVhiR3BhZWpBNStS/16:9/aHR0cHM6Ly8rMQ==/praiacentrali.stream/' },
  { id: 'stream-guaratuba-2', title: 'Praia Central', description: 'Avenida Atlântica | Vista 2', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'beach landscape', category: 'Guaratuba-PR', isLive: true, streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/portaldacidadegtba//false/false/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/aHR0cHM6Ly8rMQ==/praiacentral2.stream/' },
  { id: 'stream-guaratuba-3', title: 'Obra Nova Ponte', description: 'Câmera 1', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'construction site bridge', category: 'Guaratuba-PR', isLive: true, streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/ponteguaratuba//true/true/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/WVVoU01HTklUVFpNZVRnOSsz/pontedeguaratuba.stream/' },
  { id: 'stream-guaratuba-4', title: 'Obra Nova Ponte', description: 'Câmera 2', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'bridge construction overview', category: 'Guaratuba-PR', isLive: true, streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/ponteguaratuba//true/false/ZG1sa1pXOHdNaTVzYjJkcFkyRm9iM04wTG1OdmJTNWljZz09K1o=/16:9/aHR0cHM6Ly8rMQ==/consorcioponte2.stream/' },
  { id: 'stream-pontal-1', title: 'Balneário Ipanema', description: 'Avenida Dep. Aníbal Khury', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'beach town avenue', category: 'Pontal do Paraná', isLive: true, streamUrl: 'https://www.giseleimoveis.com.br/empresa/live' },
  { id: 'stream-outros-1', title: 'Paraguai', description: 'Ponte da Amizade | Sentido Brasil', thumbnailUrl: 'https://placehold.co/160x90.png', dataAIThumbnailHint: 'international border bridge', category: 'Outros', isLive: true, streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/brimostech//false/false/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/WVVoU01HTklUVFpNZVRnOSsz/camatg01.stream/' },
];

export default function StreamingPage() {
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamCardProps | null>(null);
  const { currentUser, userProfile, setUserProfile, isProfileComplete } = useAuth();
  const { toast } = useToast();
  const [isFavoriting, setIsFavoriting] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<HomeAlertCardData[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);

  const favorites = useMemo(() => userProfile?.favorites || [], [userProfile]);

  const fetchAndSetAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    const result = await fetchAlertsServer(6);
    if (result.success) {
      setAlerts(result.data as HomeAlertCardData[]);
    } else {
      toast({ variant: 'destructive', title: 'Erro ao buscar alertas', description: result.error });
    }
    setLoadingAlerts(false);
  }, [toast]);

  useEffect(() => {
    fetchAndSetAlerts();
  }, [fetchAndSetAlerts]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent, cameraId: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Login Necessário', description: 'Você precisa estar logado para favoritar câmeras.' });
      return;
    }
    setIsFavoriting(cameraId);

    const currentFavorites = userProfile?.favorites || [];
    const isFavorite = currentFavorites.includes(cameraId);
    
    if (!isFavorite && currentFavorites.length >= 4) {
      toast({ variant: 'destructive', title: 'Limite Atingido', description: 'Você pode favoritar no máximo 4 câmeras.' });
      setIsFavoriting(null);
      return;
    }

    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== cameraId)
      : [...currentFavorites, cameraId];
    setUserProfile(prev => prev ? { ...prev, favorites: newFavorites } : null);

    const result = await toggleFavoriteServer(currentUser.uid, cameraId, currentFavorites);
    
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error || 'Não foi possível atualizar seus favoritos.' });
      setUserProfile(prev => prev ? { ...prev, favorites: currentFavorites } : null);
    }
    setIsFavoriting(null);

  }, [currentUser, userProfile, toast, setUserProfile]);

  const filteredStreams = useMemo(() => {
    const lowercasedSearch = searchTerm.toLowerCase();
    return mockStreamsData
      .filter(stream =>
        currentFilter === 'Todos' || stream.category === currentFilter
      )
      .filter(stream =>
        stream.title.toLowerCase().includes(lowercasedSearch) ||
        stream.description.toLowerCase().includes(lowercasedSearch)
      );
  }, [currentFilter, searchTerm]);
  
  const favoriteStreams = useMemo(() => {
    return mockStreamsData.filter(stream => favorites.includes(stream.id));
  }, [favorites]);

  const handleWatchStream = (stream: StreamCardProps) => {
    setSelectedStream(stream);
    setIsModalOpen(true);
  };

  const streamCategories = ['Todos', ...new Set(mockStreamsData.map(s => s.category))];

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="destructive" className="h-auto py-3 text-base rounded-lg">
              <Link href="/emergencia">
                  <Phone className="mr-2 h-5 w-5" />
                  EMERGÊNCIA
              </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-3 text-base rounded-lg">
              <Link href="/sau">
                  <Route className="mr-2 h-5 w-5" />
                  Concessões SAU
              </Link>
          </Button>
      </div>

       <Banners />

      <section>
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/> Alertas da Comunidade</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full h-auto py-1 px-3 text-xs" onClick={() => setIsReportSheetOpen(true)}>
                <PlusCircle className="mr-1 h-3 w-3"/> Novo alerta
              </Button>
              {alerts.length > 0 && (
                <Link href="/alertas" className="text-sm text-primary font-semibold hover:underline">
                  Ver Todos &rarr;
                </Link>
              )}
            </div>
        </div>
        
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent className="-ml-2">
            {loadingAlerts ? (
              <CarouselItem className="pl-2 basis-full">
                <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CarouselItem>
            ) : alerts.length > 0 ? (
              alerts.map((alert) => (
                <CarouselItem key={alert.id} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <HomeAlertCard alert={alert}/>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="pl-2 basis-full">
                  <div className="h-32 flex flex-col items-center justify-center bg-muted/20 rounded-lg border border-dashed">
                      <p className="text-muted-foreground text-sm font-medium">Nenhuma ocorrência reportada no momento.</p>
                      <p className="text-muted-foreground text-xs mt-1">Seja o primeiro a alertar a comunidade!</p>
                  </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {alerts.length > 3 && (
            <>
              <CarouselPrevious className="left-2 hidden sm:flex" />
              <CarouselNext className="right-2 hidden sm:flex" />
            </>
          )}
        </Carousel>
      </section>

      <div>
        <div className="flex items-center gap-2">
          <Cctv className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold font-headline">Câmeras AO VIVO</h1>
        </div>
        <p className="text-muted-foreground text-sm">Acompanhe o trânsito 24h, locais e pontos turísticos.</p>
      </div>
      
      <Card className="p-2 sm:p-4 rounded-xl">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por local, rodovia ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-full h-10 text-sm bg-background/70"
          />
        </div>
        <StreamFilters 
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter} 
          streamCategories={streamCategories}
        />
      </Card>
      
      {favoriteStreams.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-headline mb-3 flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-400 fill-amber-400" /> Favoritos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {favoriteStreams.map(stream => (
               <Card 
                key={`fav-${stream.id}`}
                onClick={() => handleWatchStream(stream)}
                className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border rounded-lg overflow-hidden cursor-pointer group relative"
               >
                <button
                    onClick={(e) => handleToggleFavorite(e, stream.id)}
                    className="absolute top-1 right-1 z-10 p-1.5 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors"
                    aria-label="Remover dos favoritos"
                >
                    {isFavoriting === stream.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                </button>
                 <CardContent className="p-2 flex flex-col items-center text-center">
                   <div className="w-full aspect-video flex-shrink-0 bg-muted rounded-md flex items-center justify-center mb-2">
                       <Cctv className="h-8 w-8 text-primary"/>
                   </div>
                   <div className="flex-grow flex flex-col justify-center self-stretch">
                       <h3 className="text-sm font-semibold line-clamp-1">{stream.title}</h3>
                       <p className="text-xs text-muted-foreground leading-tight line-clamp-1">{stream.description}</p>
                   </div>
                 </CardContent>
               </Card>
            ))}
          </div>
        </section>
      )}

      {filteredStreams.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xl font-bold font-headline mt-6">Todas as Câmeras</h2>
          {filteredStreams.map((stream) => {
            const isFavorite = favorites.includes(stream.id);
            return (
              <Card 
                key={stream.id} 
                className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border rounded-lg overflow-hidden group relative"
              >
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
                    <Cctv className="h-8 w-8 text-primary"/>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold font-headline line-clamp-1">{stream.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{stream.description}</p>
                  </div>
                   <div className="flex flex-col items-end justify-center ml-auto pl-2">
                      <button
                        onClick={(e) => handleToggleFavorite(e, stream.id)}
                        className="h-9 w-9 flex items-center justify-center bg-black/10 rounded-full text-white hover:bg-black/30 transition-colors mb-2"
                        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                      >
                        {isFavoriting === stream.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Star className={cn("h-5 w-5", isFavorite ? "text-amber-400 fill-amber-400" : "text-white/80")}/>}
                      </button>
                     <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleWatchStream(stream)}
                        className="rounded-full text-xs py-1 px-3 h-auto"
                     >
                        <PlayCircle className="mr-1 h-4 w-4" /> Assistir
                     </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="mt-6 text-center text-muted-foreground">Nenhuma câmera encontrada para sua busca.</p>
      )}

      <StreamViewerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStream(null);
        }}
        stream={selectedStream}
      />
      <ReportAlertSheet 
        isOpen={isReportSheetOpen}
        onOpenChange={setIsReportSheetOpen}
        onAlertCreated={fetchAndSetAlerts}
      />
    </div>
  );
}
