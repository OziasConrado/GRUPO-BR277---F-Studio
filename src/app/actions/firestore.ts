
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
    console.error("--- Erro Crítico na Action: fetchUserProfileServer --- Firestore Admin SDK não inicializado.");
    return null;
  }

  try {
    console.log(`--- Iniciando Action: fetchUserProfileServer para UID: ${uid} ---`);
    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const profile = userDoc.data() as UserProfile;
      userProfileCache.set(uid, profile);
      console.log(`--- Sucesso na Action: fetchUserProfileServer para UID: ${uid} ---`);
      return profile;
    } else {
      userProfileCache.set(uid, null);
      console.warn(`--- Perfil não encontrado para UID: ${uid} ---`);
      return null;
    }
  } catch (error: any) {
    console.error(`--- Erro na Action: fetchUserProfileServer (UID: ${uid}) ---`, error.stack || error);
    // Não lança o erro para o cliente, apenas loga no servidor.
    // O cliente tratará o retorno nulo.
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
      console.log('--- Action: fetchBannersServer - Nenhum banner ativo encontrado. ---');
      return { success: true, data: [] };
    }

    const banners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`--- Sucesso na Action: fetchBannersServer - ${banners.length} banners encontrados. ---`);
    return { success: true, data: banners as any[] };
  } catch (error: any) {
    console.error("--- Erro na Action: fetchBannersServer ---", error.stack || error);
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
        console.log(`--- Sucesso na Action: fetchAllBannersServer - ${banners.length} banners encontrados. ---`);
        return { success: true, data: banners as any[] };
    } catch (error: any) {
        console.error("--- Erro na Action: fetchAllBannersServer ---", error.stack || error);
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
       console.log(`--- Sucesso na Action: saveBannerServer - Banner ${bannerId} atualizado. ---`);
    } else {
      // Criar novo banner
      const newBanner = await firestore.collection('banners').add({ ...bannerData, createdAt: new Date() });
       console.log(`--- Sucesso na Action: saveBannerServer - Novo banner criado com ID: ${newBanner.id}. ---`);
    }
    
    // Revalida o cache do Next.js para as páginas afetadas
    revalidatePath('/admin/banners');
    revalidatePath('/streaming');
    revalidatePath('/feed');

    return { success: true };
  } catch (error: any) {
    console.error("--- Erro na Action: saveBannerServer ---", error.stack || error);
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
        console.log(`--- Sucesso na Action: deleteBannerServer - Banner ${bannerId} deletado. ---`);
        revalidatePath('/admin/banners');
        revalidatePath('/streaming');
        revalidatePath('/feed');
        return { success: true };
    } catch (error: any) {
        console.error("--- Erro na Action: deleteBannerServer ---", error.stack || error);
        return { success: false, error: error.message || 'Não foi possível deletar o banner.' };
    }
}
