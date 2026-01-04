
'use server';

import type { UserProfile } from '@/contexts/AuthContext';
import { revalidatePath } from 'next/cache';

const projectId = 'grupo-br277';
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function mapFirestoreRestResponse(documents: any[]): any[] {
  if (!documents) {
    return [];
  }
  return documents.map(doc => {
    const fields = doc.fields;
    const mappedDoc: { [key: string]: any } = { id: doc.name.split('/').pop() };
    for (const key in fields) {
      const valueObject = fields[key];
      const valueType = Object.keys(valueObject)[0];
      
      if (valueType === 'stringValue') {
        mappedDoc[key] = valueObject.stringValue;
      } else if (valueType === 'integerValue') {
        mappedDoc[key] = parseInt(valueObject.integerValue, 10);
      } else if (valueType === 'doubleValue') {
        mappedDoc[key] = valueObject.doubleValue;
      } else if (valueType === 'booleanValue') {
        mappedDoc[key] = valueObject.booleanValue;
      } else if (valueType === 'timestampValue') {
        mappedDoc[key] = new Date(valueObject.timestampValue).toISOString();
      } else if (valueType === 'mapValue') {
         // This is a simplification. A real implementation would recurse.
         mappedDoc[key] = valueObject.mapValue.fields;
      } else if (valueType === 'arrayValue') {
          // This is a simplification.
          mappedDoc[key] = valueObject.arrayValue.values?.map((v: any) => Object.values(v)[0]) || [];
      } else {
        mappedDoc[key] = valueObject[valueType];
      }
    }
    return mappedDoc;
  });
}

/**
 * Server Action para buscar banners ativos usando a API REST do Firestore.
 * @returns Um objeto com sucesso/erro e os dados dos banners.
 */
export async function fetchBannersServer(): Promise<{ success: boolean; data: any[]; error?: string; }> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/banners?key=${apiKey}&orderBy=order`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 300, // Revalida a cada 5 minutos
      }
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("--- Erro na API REST do Firestore ---", JSON.stringify(errorBody, null, 2));
      throw new Error(`Falha ao buscar banners: ${response.statusText}`);
    }

    const data = await response.json();
    const mappedData = mapFirestoreRestResponse(data.documents);
    const activeBanners = mappedData.filter(b => b.isActive === true);
    
    console.log(`--- Sucesso na Action REST: fetchBannersServer - ${activeBanners.length} banners ativos encontrados. ---`);
    return { success: true, data: activeBanners };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: fetchBannersServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao buscar banners via REST.', data: [] };
  }
}

// Manter as outras actions que ainda não foram refatoradas para REST
import { firestore as firestoreAdmin } from '@/lib/firebase/server';
import { collection, query, orderBy, getDocs, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

const TIMEOUT_DURATION = 5000; // 5 segundos

export async function fetchUserProfileServer(uid: string): Promise<UserProfile | null> {
  if (!firestoreAdmin) {
    console.error("--- Erro Crítico na Action: fetchUserProfileServer --- Firestore Admin não inicializado.");
    return null;
  }

  console.log(`>>> [SERVER ACTION] Iniciando busca de PERFIL no Firestore para UID: ${uid}...`);
  
  const firestorePromise = firestoreAdmin.collection('users').doc(uid).get();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), TIMEOUT_DURATION)
  );

  try {
    const userDoc = await Promise.race([firestorePromise, timeoutPromise]);
    console.log('<<< [SERVER ACTION] Busca de PERFIL concluída!');

    if (userDoc.exists) {
      const profile = userDoc.data() as UserProfile;
      console.log(`--- Sucesso na Action: fetchUserProfileServer para UID: ${uid} ---`);
      return profile;
    } else {
      console.warn(`--- Perfil não encontrado para UID: ${uid} ---`);
      return null;
    }
  } catch (error: any) {
    console.error(`--- Erro na Action: fetchUserProfileServer (UID: ${uid}) ---`, error.message, error.stack || '');
    return null;
  }
}

export async function fetchAllBannersServer() {
    console.log('--- Iniciando Action: fetchAllBannersServer ---');
    if (!firestoreAdmin) {
        console.error("--- Erro na Action: fetchAllBannersServer --- Firestore Admin não inicializado.");
        return { success: false, error: "Serviço de banco de dados indisponível.", data: [] };
    }

    try {
        const bannersCollection = firestoreAdmin.collection('banners');
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

export async function saveBannerServer(bannerData: any, bannerId: string | null) {
  console.log('--- Iniciando Action: Salvar Banner ---', { bannerId, bannerData });
  if (!firestoreAdmin) {
    console.error("--- Erro na Action: saveBannerServer --- Firestore Admin não inicializado.");
    return { success: false, error: "Serviço de banco de dados indisponível." };
  }

  try {
    if (bannerId) {
      const bannerRef = firestoreAdmin.collection('banners').doc(bannerId);
      await bannerRef.update({ ...bannerData, updatedAt: new Date() });
      console.log(`--- Sucesso na Action: saveBannerServer - Banner ${bannerId} atualizado. ---`);
    } else {
      const newBanner = await firestoreAdmin.collection('banners').add({ ...bannerData, createdAt: new Date() });
      console.log(`--- Sucesso na Action: saveBannerServer - Novo banner criado com ID: ${newBanner.id}. ---`);
    }
    
    revalidatePath('/admin/banners');
    revalidatePath('/streaming');
    
    return { success: true };
  } catch (error: any) {
    console.error("--- Erro na Action: saveBannerServer ---", error.stack || error);
    return { success: false, error: error.message || 'Não foi possível salvar o banner.' };
  }
}

export async function deleteBannerServer(bannerId: string) {
    console.log('--- Iniciando Action: deleteBannerServer ---', { bannerId });
    if (!firestoreAdmin) {
        console.error("--- Erro na Action: deleteBannerServer --- Firestore Admin não inicializado.");
        return { success: false, error: "Serviço de banco de dados indisponível." };
    }

    try {
        await firestoreAdmin.collection('banners').doc(bannerId).delete();
        console.log(`--- Sucesso na Action: deleteBannerServer - Banner ${bannerId} deletado. ---`);
        revalidatePath('/admin/banners');
        revalidatePath('/streaming');
        return { success: true };
    } catch (error: any) {
        console.error("--- Erro na Action: deleteBannerServer ---", error.stack || error);
        return { success: false, error: error.message || 'Não foi possível deletar o banner.' };
    }
}
