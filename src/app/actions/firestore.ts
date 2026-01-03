'use server';

import { firestore } from '@/lib/firebase/server';
import type { UserProfile } from '@/contexts/AuthContext';
import { revalidatePath } from 'next/cache';

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
  console.log('--- Iniciando Action: fetchBannersServer ---');
  if (!firestore) {
    console.error("--- Erro na Action: fetchBannersServer --- Firestore Admin SDK não inicializado.");
    return { success: false, error: "Serviço de banco de dados indisponível.", data: [] };
  }

  try {
    const bannersCollection = firestore.collection('banners');
    const q = bannersCollection.where('isActive', '==', true).orderBy('order', 'asc');
    const snapshot = await q.get();
    
    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: banners as any[] };
  } catch (error: any) {
    console.error("--- Erro na Action: fetchBannersServer ---", error);
    return { success: false, error: error.message || 'Falha ao buscar banners.', data: [] };
  }
}

/**
 * Server Action para buscar TODOS os banners (ativos e inativos) para o painel de admin.
 */
export async function fetchAllBannersServer() {
    console.log('--- Iniciando Action: fetchAllBannersServer ---');
    if (!firestore) {
        console.error("--- Erro na Action: fetchAllBannersServer --- Firestore Admin SDK não inicializado.");
        return { success: false, error: "Serviço de banco de dados indisponível.", data: [] };
    }

    try {
        const bannersCollection = firestore.collection('banners');
        const q = bannersCollection.orderBy('order', 'asc');
        const snapshot = await q.get();
        const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: banners as any[] };
    } catch (error: any) {
        console.error("--- Erro na Action: fetchAllBannersServer ---", error);
        return { success: false, error: error.message || 'Falha ao buscar todos os banners.', data: [] };
    }
}


/**
 * Server Action para salvar (criar ou atualizar) um banner.
 */
export async function saveBannerServer(bannerData: any, bannerId: string | null) {
  console.log('--- Iniciando Action: saveBannerServer ---', { bannerId, bannerData });
  if (!firestore) {
    console.error("--- Erro na Action: saveBannerServer --- Firestore Admin SDK não inicializado.");
    return { success: false, error: "Serviço de banco de dados indisponível." };
  }

  try {
    if (bannerId) {
      // Atualizar banner existente
      const bannerRef = firestore.collection('banners').doc(bannerId);
      await bannerRef.update({ ...bannerData, updatedAt: new Date() });
    } else {
      // Criar novo banner
      await firestore.collection('banners').add({ ...bannerData, createdAt: new Date() });
    }
    
    // Revalida o cache do Next.js para as páginas afetadas
    revalidatePath('/admin/banners');
    revalidatePath('/streaming');
    revalidatePath('/feed');

    return { success: true };
  } catch (error: any) {
    console.error("--- Erro na Action: saveBannerServer ---", error);
    return { success: false, error: error.message || 'Não foi possível salvar o banner.' };
  }
}

/**
 * Server Action para deletar um banner.
 */
export async function deleteBannerServer(bannerId: string) {
    console.log('--- Iniciando Action: deleteBannerServer ---', { bannerId });
    if (!firestore) {
        console.error("--- Erro na Action: deleteBannerServer --- Firestore Admin SDK não inicializado.");
        return { success: false, error: "Serviço de banco de dados indisponível." };
    }

    try {
        await firestore.collection('banners').doc(bannerId).delete();
        revalidatePath('/admin/banners');
        revalidatePath('/streaming');
        revalidatePath('/feed');
        return { success: true };
    } catch (error: any) {
        console.error("--- Erro na Action: deleteBannerServer ---", error);
        return { success: false, error: error.message || 'Não foi possível deletar o banner.' };
    }
}