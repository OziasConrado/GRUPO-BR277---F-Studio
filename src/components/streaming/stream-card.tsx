// Este arquivo não será mais usado como card individual em grid.
// Será substituído por um layout de lista.
// Mantendo o arquivo caso seja necessário para outros propósitos,
// mas a lógica principal será movida para um novo componente ou diretamente na página.

export interface StreamCardProps {
  id: string;
  title: string;
  description: string; // Adicionado
  thumbnailUrl: string;
  dataAIThumbnailHint?: string;
  category: string; // Representará a região
  isLive: boolean; // Pode ser inferido ou mantido se houver API
  viewers?: number;
  streamUrl: string; // Adicionado
}

// O componente StreamCard como estava antes não será mais usado diretamente na página de streaming.
// A lógica de exibição será incorporada em um novo formato de item de lista.
// Se precisar de um componente de card genérico para streams em outro lugar, podemos reativá-lo.
export default function StreamCard({ title, thumbnailUrl, category, isLive, viewers }: Pick<StreamCardProps, 'title' | 'thumbnailUrl' | 'category' | 'isLive' | 'viewers'>) {
  return null; // Conteúdo removido pois o layout mudou
}
