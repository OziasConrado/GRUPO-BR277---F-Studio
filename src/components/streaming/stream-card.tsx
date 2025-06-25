// Este arquivo não será mais usado como card individual em grid.
// A lógica foi movida para a página de streaming.
// Mantendo o arquivo para preservar a definição do tipo StreamCardProps.

export interface StreamCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  dataAIThumbnailHint?: string;
  category: string;
  isLive: boolean;
  viewers?: number;
  streamUrl: string;
}

export default function StreamCard() {
  return null; // O componente não é mais renderizado
}
