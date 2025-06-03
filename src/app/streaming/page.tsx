'use client';

import { useState, useMemo } from 'react';
import StreamCard, { type StreamCardProps } from '@/components/streaming/stream-card';
import StreamFilters from '@/components/streaming/stream-filters';

const mockStreams: StreamCardProps[] = Array.from({ length: 20 }, (_, i) => {
  const categories = ['Trânsito', 'Eventos', 'Suporte', 'Paisagens', 'Notícias'];
  const category = categories[i % categories.length];
  const isLive = Math.random() > 0.3;
  return {
    id: `stream-${i + 1}`,
    title: `Transmissão Ao Vivo #${i + 1}: ${category}`,
    thumbnailUrl: `https://placehold.co/400x225.png`,
    dataAIThumbnailHint: `live stream ${category.toLowerCase()}`,
    category,
    isLive,
    viewers: isLive ? Math.floor(Math.random() * 1000) + 50 : undefined,
  };
});

export default function StreamingPage() {
  const [currentFilter, setCurrentFilter] = useState('Todos');

  const filteredStreams = useMemo(() => {
    if (currentFilter === 'Todos') {
      return mockStreams;
    }
    return mockStreams.filter(stream => stream.category === currentFilter);
  }, [currentFilter]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6 font-headline text-center sm:text-left">Transmissões</h1>
      <StreamFilters onFilterChange={setCurrentFilter} />
      {filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard key={stream.id} {...stream} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">Nenhuma transmissão encontrada para esta categoria.</p>
      )}
    </div>
  );
}
