
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, Cctv, Search, Phone, Route } from 'lucide-react';
import StreamFilters from '@/components/streaming/stream-filters';
import StreamViewerModal from '@/components/streaming/StreamViewerModal';
import type { StreamCardProps } from '@/components/streaming/stream-card'; 
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Dados fornecidos pelo usuário
const mockStreamsData: StreamCardProps[] = [
  // Curitiba-PR
  {
    id: 'stream-cwb-1',
    title: 'BR-376, km 594',
    description: 'Contorno Sul | Viaduto Caiuá/CIC',
    thumbnailUrl: 'https://placehold.co/160x90.png', // Placeholder
    dataAIThumbnailHint: 'highway traffic',
    category: 'Curitiba-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/a8b563b95ba9299432dfaf5b8a8f6962aedd36e58d15d22c3b9cffeec6a32001e18ae8897e091f1981234490ee24',
  },
  {
    id: 'stream-cwb-2',
    title: 'BR-116, km 113',
    description: 'Contorno Leste | Bairro Umbará',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'road intersection',
    category: 'Curitiba-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/a3a1e898486a65603b809dde9804a58f77042874f324f77a2a0ddeb76a4c741179d75f5643d74090c7b3c0101fe8',
  },
  {
    id: 'stream-cwb-3',
    title: 'BR-277, km 82',
    description: 'Bairro Jardim das Americas',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'city road',
    category: 'Curitiba-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/440357609a40573a6ffbfb02b3204d9a8cc6ab0953d79fd1f0d5c1eff8e48073aa8288b30e551a81893e6454730b',
  },
  // Campo Largo-PR
  {
    id: 'stream-cl-1',
    title: 'BR-277, km 109',
    description: 'Rodovia do Café | Passaúna/Curitiba',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'highway landscape',
    category: 'Campo Largo-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/67031ee87fd2f06174a39082a9d702a6d1da6798c95059594b866cf3b354d947bdf1947c14bdcf5b1dfa4f7252d8',
  },
  {
    id: 'stream-cl-2',
    title: 'BR-277, km 114',
    description: 'Rodovia do Café, sentido Oeste',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'road view',
    category: 'Campo Largo-PR',
    isLive: false,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/0a15af43557f75d73edc98b636283de1fd8c66adf2e994c01de2df7631b100c6b0f8e11c81434eb62045cae64081',
  },
  {
    id: 'stream-cl-3',
    title: 'BR-277, km 117',
    description: 'Rodovia do Café | Bairro Cercadinho',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'countryside road',
    category: 'Campo Largo-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/963087f7817549a681919bbcbbed9d82524ed38ba3e579b8ec4075ee96a0c95d7c637fc79159b5345abc59ff1c4d',
  },
  {
    id: 'stream-cl-4',
    title: 'BR-277, km 120',
    description: 'Rodovia do café | Bairro Rondinha',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'road traffic flow',
    category: 'Campo Largo-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/33b87f05374eb7dab38e299235ff1d1a5a913a828258fefaf8113790f20d398882b4d23de37ff672906f7a70fe4e',
  },
  {
    id: 'stream-cl-5',
    title: 'BR-277, km 122',
    description: 'Rodovia do Café | Bairro Rondinha',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'highway junction',
    category: 'Campo Largo-PR',
    isLive: false,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/274be9e7132e3e7694fa016054d0841a527c63cba59910ae99d245f65ea556a4ee695b2cdb078c07a3e52ea9206e',
  },
  // Morretes-PR
  {
    id: 'stream-morretes-1',
    title: 'BR-277, km 33',
    description: 'Serra do Mar',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'mountain road view',
    category: 'Morretes-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/d3f7801570225d8089b6e6a423b163ba2a0b73dac0d818ef2d2ab36261fd25ce39d6a7c906a7a63c1d6c3a48422c',
  },
  {
    id: 'stream-morretes-2',
    title: 'BR-277, km 40+500',
    description: 'Serra do Mar',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'scenic mountain road',
    category: 'Morretes-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/6f4754d21c28be320bf30f026d392ba0386fb2c67518aaef07aa54b93b9e7b726eca833bc90805c274cf16132606',
  },
  // Ponta Grossa-PR
  {
    id: 'stream-pg-1',
    title: 'BR-376, km 494',
    description: 'Rodovia do Café | Subida da VOLVO',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'uphill highway',
    category: 'Ponta Grossa-PR',
    isLive: true,
    streamUrl: 'https://cloud.fullcam.me/#/cembed/fbd243231c0d8d76438670ff6cf012b01a90e70cf4a6e497a336a6897aee31371d3c9ce5311196b56ab59f7f17d7',
  },
  // São Paulo/Capital
  {
    id: 'stream-sp-1',
    title: 'Via Dutra',
    description: 'Chegada',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'city arrival highway',
    category: 'São Paulo/Capital',
    isLive: true,
    streamUrl: 'https://rtsp.me/embed/dN42a6Sy/',
  },
  {
    id: 'stream-sp-2',
    title: 'Via Dutra',
    description: 'Saída',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'city departure highway',
    category: 'São Paulo/Capital',
    isLive: false,
    streamUrl: 'https://rtsp.me/embed/BkkN7hk7/',
  },
  // Guaratuba-PR
  {
    id: 'stream-guaratuba-1',
    title: 'Praia Central',
    description: 'Avenida Atlântica | Vista 1',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'beach view avenue',
    category: 'Guaratuba-PR',
    isLive: true,
    streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/portaldacidadegtba//false/false/V2tjeGMyRXhjRmhQU0dST1lWUldlbGxxU210alJtdDVVbTA1YVUwd05IZFVSekZQWkcxS1ZFNVhiR3BhZWpBNStS/16:9/aHR0cHM6Ly8rMQ==/praiacentrali.stream/',
  },
  {
    id: 'stream-guaratuba-2',
    title: 'Praia Central',
    description: 'Avenida Atlântica | Vista 2',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'beach landscape',
    category: 'Guaratuba-PR',
    isLive: true,
    streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/portaldacidadegtba//false/false/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/aHR0cHM6Ly8rMQ==/praiacentral2.stream/',
  },
  {
    id: 'stream-guaratuba-3',
    title: 'Obra Nova Ponte',
    description: 'Câmera 1', 
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'construction site bridge',
    category: 'Guaratuba-PR',
    isLive: true,
    streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/ponteguaratuba//true/true/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/WVVoU01HTklUVFpNZVRnOSsz/pontedeguaratuba.stream/',
  },
  {
    id: 'stream-guaratuba-4',
    title: 'Obra Nova Ponte',
    description: 'Câmera 2',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'bridge construction overview',
    category: 'Guaratuba-PR',
    isLive: true,
    streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/ponteguaratuba//true/false/ZG1sa1pXOHdNaTVzYjJkcFkyRm9iM04wTG1OdmJTNWljZz09K1o=/16:9/aHR0cHM6Ly8rMQ==/consorcioponte2.stream/',
  },
  // Pontal do Paraná
  {
    id: 'stream-pontal-1',
    title: 'Balneário Ipanema',
    description: 'Avenida Dep. Aníbal Khury',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'beach town avenue',
    category: 'Pontal do Paraná',
    isLive: true,
    streamUrl: 'https://www.giseleimoveis.com.br/empresa/live',
  },
  // Outros
  {
    id: 'stream-outros-1',
    title: 'Paraguai',
    description: 'Ponte da Amizade | Sentido Brasil',
    thumbnailUrl: 'https://placehold.co/160x90.png', 
    dataAIThumbnailHint: 'international border bridge',
    category: 'Outros',
    isLive: true,
    streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/brimostech//false/false/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/WVVoU01HTklUVFpNZVRnOSsz/camatg01.stream/',
  },
];


export default function StreamingPage() {
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamCardProps | null>(null);

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

  const handleWatchStream = (stream: StreamCardProps) => {
    setSelectedStream(stream);
    setIsModalOpen(true);
  };

  const streamCategories = ['Todos', ...new Set(mockStreamsData.map(s => s.category))];

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-2 gap-3 mb-6">
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
      
      <div className="w-full mb-6">
        <p className="text-xs text-muted-foreground mb-1">Publicidade</p>
        <a href="https://www.verao.pr.gov.br/calendario-eventos?field_categoria_target_id=42" target="_blank" rel="noopener noreferrer" className="block w-full">
            <img
                src="https://firebasestorage.googleapis.com/v0/b/grupo-br277.appspot.com/o/700x155px-ver%C3%A3o-maior-paran%C3%A1-2026.gif?alt=media&token=402c7e83-c25f-472b-a173-a1cc3eae0348"
                alt="Verão Maior Paraná 2026"
                className="w-full h-auto"
                crossOrigin="anonymous"
            />
        </a>
      </div>

      <div>
        <h1 className="text-3xl font-bold font-headline text-center sm:text-left">Câmeras AO VIVO</h1>
        <p className="text-muted-foreground text-center sm:text-left text-sm">Acompanhe o trânsito 24h, locais e pontos turísticos.</p>
      </div>
      
      <Card className="p-4 rounded-xl">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar câmera por local, rodovia ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-full h-11 bg-background/70"
          />
        </div>
        <StreamFilters 
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter} 
          streamCategories={streamCategories}
        />
      </Card>

      {filteredStreams.length > 0 ? (
        <div className="space-y-3">
          {filteredStreams.map((stream) => (
            <Card 
              key={stream.id} 
              className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border rounded-lg overflow-hidden"
            >
              <CardContent className="p-3 flex flex-row items-center gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
                    <Cctv className="h-8 w-8 text-primary"/>
                </div>
                <div className="flex-grow flex flex-col justify-center self-stretch">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold font-headline line-clamp-1">{stream.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{stream.description}</p>
                </div>
                <div className="flex-shrink-0 self-center"> 
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
          ))}
        </div>
      ) : (
        <p className="mt-6 text-center text-muted-foreground">Nenhuma câmera encontrada para sua busca.</p>
      )}

      {selectedStream && (
        <StreamViewerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStream(null);
          }}
          stream={selectedStream}
        />
      )}
    </div>
  );
}
