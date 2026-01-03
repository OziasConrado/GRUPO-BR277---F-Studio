'use server';

import { firestore } from '@/lib/firebase/server';
import type { UserProfile } from '@/contexts/AuthContext';

// Cache para o perfil do usuário para evitar buscas repetidas na mesma requisição
const userProfileCache = new Map<string, UserProfile | null>();

/**
 * Server Action para buscar o perfil de um usuário no Firestore.
 * Utiliza o SDK Admin do Firebase no lado do servidor.
 * @param uid - O ID do usuário a ser buscado.
 * @returns Os dados do perfil do usuário ou null se não encontrado.
 */
export async function fetchUserProfileServer(uid: string): Promise<UserProfile | null> {
  if (userProfileCache.has(uid)) {
    return userProfileCache.get(uid) ?? null;
  }
  
  if (!firestore) {
    console.error("fetchUserProfileServer: Firestore Admin SDK não inicializado.");
    return null;
  }

  try {
    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const profile = userDoc.data() as UserProfile;
      userProfileCache.set(uid, profile);
      return profile;
    } else {
      userProfileCache.set(uid, null);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar perfil do usuário (UID: ${uid}) via Server Action:`, error);
    return null;
  }
}

/**
 * Server Action para buscar os banners ativos no Firestore.
 * @returns Uma lista de banners.
 */
export async function fetchBannersServer() {
  if (!firestore) {
    console.error("fetchBannersServer: Firestore Admin SDK não inicializado.");
    return [];
  }

  try {
    const bannersCollection = firestore.collection('banners');
    const q = bannersCollection.where('isActive', '==', true).orderBy('order', 'asc');
    const snapshot = await q.get();
    
    if (snapshot.empty) {
      return [];
    }

    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return banners as any[]; // Tipagem pode ser melhorada com uma interface Banner
  } catch (error) {
    console.error("Erro ao buscar banners via Server Action:", error);
    return [];
  }
}
