
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  location?: string;
  bio?: string;
  instagramUsername?: string;
  lastLogin?: any;
  favorites?: string[];
}
