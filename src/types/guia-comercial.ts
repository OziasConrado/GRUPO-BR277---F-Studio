

export const businessCategories = [
  "Restaurante", "Borracharia", "Hotel/Pousada", "Posto de Combustível",
  "Oficina Mecânica", "Loja de Peças", "Conveniência", "Mercado", "Outros"
] as const;

export type BusinessCategory = typeof businessCategories[number];

export interface BusinessData {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  phone?: string;
  whatsapp?: string;
  description: string;
  imageUrl: string;
  dataAIImageHint: string;
  servicesOffered?: string[];
  operatingHours?: string;
  isPremium?: boolean;
  latitude?: number;
  longitude?: number;
  instagramUsername?: string;
  averageRating?: number;
  reviewCount?: number;
  distance?: number; // Calculated client-side
}
