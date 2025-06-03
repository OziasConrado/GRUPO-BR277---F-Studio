
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, ListFilter } from 'lucide-react';
import StreamFilters from '@/components/streaming/stream-filters';
import StreamViewerModal from '@/components/streaming/StreamViewerModal'; // Novo componente
import type { StreamCardProps } from '@/components/streaming/stream-card'; // Interface atualizada

const mockStreamsData: StreamCardProps[] = [
  // Curitiba-PR
  {
    id: 'stream-cwb-1',
    title: 'BR-376, km 594',
    description: 'Contorno Sul | Viaduto Caiuá/CIC',
    thumbnailUrl: 'https://placehold.co/160x90.png',
    dataAIThumbnailHint: 'highway traffic',
    category: 'Curitiba-PR',
    isLive: true,
    viewers: Math.floor(Math.random() * 200) + 50,
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
    viewers: Math.floor(Math.random() * 200) + 50,
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
    viewers: Math.floor(Math.random() * 200) + 50,
    streamUrl: 'https://rtsp.me/embed/QtFANhNy/',
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
    streamUrl: 'https://rtsp.me/embed/BEFd9GF6/',
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
    dataAIThumbnailHint: 'bridge international border',
    category: 'Outros',
    isLive: true,
    streamUrl: 'https://playerv.logicahost.com.br/video-ip-camera/brimostech//false/false/Wkcxc2ExcFhPSGROYVRWellqSmtjRmt5Um05aU0wNHdURzFPZG1KVE5XbGpaejA5KzM=/16:9/WVVoU01HTklUVFpNZVRnOSsz/camatg01.stream/',
  },
];


export default function StreamingPage() {
  const [currentFilter, setCurrentFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamCardProps | null>(null);

  const filteredStreams = useMemo(() => {
    if (currentFilter === 'Todos') {
      return mockStreamsData;
    }
    return mockStreamsData.filter(stream => stream.category === currentFilter);
  }, [currentFilter]);

  const handleWatchStream = (stream: StreamCardProps) => {
    setSelectedStream(stream);
    setIsModalOpen(true);
  };

  const streamCategories = ['Todos', ...new Set(mockStreamsData.map(s => s.category))];


  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-center sm:text-left">Transmissões Ao Vivo</h1>
        <p className="text-muted-foreground text-center sm:text-left text-sm">Acompanhe o trânsito e condições das estradas.</p>
      </div>
      
      <Card className="glassmorphic rounded-xl">
        <CardContent className="p-4">
          <StreamFilters 
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter} 
            streamCategories={streamCategories}
          />

          {filteredStreams.length > 0 ? (
            <div className="mt-4 space-y-4">
              {filteredStreams.map((stream) => (
                <Card key={stream.id} className="bg-card/70 dark:bg-card/70 backdrop-blur-sm border border-white/10 dark:border-slate-700/10 rounded-lg overflow-hidden">
                  <CardContent className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-grow space-y-1">
                      <h3 className="text-md font-semibold font-headline">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{stream.description}</p>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleWatchStream(stream)}
                        className="mt-1 rounded-md text-xs py-1 px-2 h-auto"
                      >
                        <PlayCircle className="mr-1.5 h-4 w-4" /> Assistir
                      </Button>
                    </div>
                    <div className="w-full sm:w-32 md:w-40 aspect-video rounded-md overflow-hidden relative flex-shrink-0 mt-2 sm:mt-0">
                      <Image
                        src={stream.thumbnailUrl}
                        alt={`Thumbnail para ${stream.title}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={stream.dataAIThumbnailHint || "live stream thumbnail"}
                        className="transition-transform duration-300 hover:scale-105"
                      />
                       {stream.isLive && (
                        <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[0.6rem] font-bold animate-pulse">
                          AO VIVO
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-center text-muted-foreground">Nenhuma transmissão encontrada para esta categoria.</p>
          )}
        </CardContent>
      </Card>

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

