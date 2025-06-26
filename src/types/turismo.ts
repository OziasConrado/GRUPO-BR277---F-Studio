export const touristCategories = [
  "Natureza", "Histórico", "Cultural", "Lazer", "Aventura"
] as const;

export type TouristCategory = typeof touristCategories[number];

export interface TouristPointData {
  id: string;
  name: string;
  locationName: string; // e.g., "Foz do Iguaçu, PR"
  description: string;
  imageUrl: string;
  dataAIImageHint: string;
  category: TouristCategory;
  averageRating?: number; // Futuro uso
  reviewCount?: number; // Futuro uso
  indicatedByUserId?: string;
  indicatedByUserName?: string;
  status?: 'pending' | 'approved';
}

export interface IndicatedTouristPointData extends TouristPointData {
  indicatedByUserId: string;
  indicatedByUserName: string;
  status: 'pending' | 'approved';
}
