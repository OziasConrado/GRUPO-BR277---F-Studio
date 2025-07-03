export const touristCategories = [
  "Natureza", "Histórico", "Cultural", "Lazer", "Aventura"
] as const;

export type TouristCategory = typeof touristCategories[number];

export interface TouristPointReview {
  id: string;
  pointId: string;
  userId: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  timestamp: any;
}

export interface TouristPointData {
  id: string;
  name: string;
  locationName: string; // e.g., "Foz do Iguaçu, PR"
  description: string;
  imageUrl: string;
  dataAIImageHint: string;
  category: TouristCategory;
  averageRating?: number;
  reviewCount?: number;
  indicatedByUserId?: string;
  indicatedByUserName?: string;
  status?: 'pending' | 'approved';
  createdAt?: any;
}

export interface IndicatedTouristPointData extends TouristPointData {
  indicatedByUserId: string;
  indicatedByUserName: string;
  status: 'pending' | 'approved';
}
