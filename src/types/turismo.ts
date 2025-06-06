
export interface TouristPointData {
  id: string;
  name: string;
  locationName: string; // e.g., "Foz do Iguaçu, PR"
  description: string;
  imageUrl: string;
  dataAIImageHint: string;
  category: 'Natureza' | 'Histórico' | 'Cultural' | 'Lazer' | 'Aventura';
  averageRating?: number; // Futuro uso
  reviewCount?: number; // Futuro uso
}

export const touristCategories = [
  "Natureza", "Histórico", "Cultural", "Lazer", "Aventura"
] as const;

export type TouristCategory = typeof touristCategories[number];
