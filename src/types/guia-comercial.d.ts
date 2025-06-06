
export interface BusinessData {
  id: string;
  name: string;
  category: BusinessCategory;
  address: string;
  phone?: string;
  whatsapp?: string; // Should be just the number, e.g., 5541999999999
  description: string;
  imageUrl: string;
  dataAIImageHint: string;
  servicesOffered?: string[];
  operatingHours?: string;
  isPremium?: boolean; // True for paid (no in-card ads), false for free
  // userWhoRegisteredId?: string; // For future use
}

export const businessCategories = [
  "Restaurante", "Borracharia", "Hotel/Pousada", "Posto de Combustível",
  "Oficina Mecânica", "Loja de Peças", "Conveniência", "Mercado", "Outros"
] as const;

export type BusinessCategory = typeof businessCategories[number];
