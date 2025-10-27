

export const businessCategories = [
  "Restaurante", "Borracharia", "Hotel/Pousada", "Posto de Combustível",
  "Oficina Mecânica", "Loja de Peças", "Conveniência", "Mercado", "Outros"
] as const;

export type BusinessCategory = typeof businessCategories[number];

export const planTypes = ["GRATUITO", "INTERMEDIARIO", "PREMIUM"] as const;
export type PlanType = typeof planTypes[number];

export const paymentStatuses = ["PENDENTE", "ATIVO", "EXPIRADO", "CANCELADO"] as const;
export type PaymentStatus = typeof paymentStatuses[number];


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
  promoImages?: { url: string; hint: string; }[]; // For detailed view
  // Plan-related fields
  plano: PlanType;
  statusPagamento: PaymentStatus;
  dataInicio?: any; // Firestore Timestamp
  dataExpiracao?: any; // Firestore Timestamp
}
