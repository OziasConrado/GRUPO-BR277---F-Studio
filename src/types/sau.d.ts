
export interface SAUReview {
  id: string;
  sauId: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
}

export interface SAULocation {
  id: string;
  concessionaire: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  services: string[];
  operatingHours: string;
  // These will be dynamically calculated or managed in state
  averageRating?: number;
  reviewCount?: number;
  distance?: number; // in km
}
