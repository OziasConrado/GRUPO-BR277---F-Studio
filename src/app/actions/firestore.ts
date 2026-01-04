
'use server';

import { firestore } from '@/lib/firebase/client'; // Usado para operações de escrita
import type { UserProfile } from '@/contexts/AuthContext';
import { revalidatePath } from 'next/cache';
import { getDoc, doc, collection, where, query, orderBy, getDocs, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';


// Cache para o perfil do usuário para evitar buscas repetidas na mesma requisição
const userProfileCache = new Map<string, UserProfile | null>();

const TIMEOUT_DURATION = 5000; // 5 segundos

/**
 * Server Action para buscar o perfil de um usuário no Firestore com timeout.
 * Utiliza o SDK Admin do Firebase no lado do servidor.
 * @param uid - O ID do usuário a ser buscado.
 * @returns Os dados do perfil do usuário ou null se não encontrado ou se ocorrer timeout.
 */
export async function fetchUserProfileServer(uid: string): Promise<UserProfile | null> {
  if (userProfileCache.has(uid)) {
    return userProfileCache.get(uid) ?? null;
  }
  
  if (!firestore) {
    console.error("--- Erro Crítico na Action: fetchUserProfileServer --- Firestore não inicializado.");
    return null;
  }

  console.log(`>>> [SERVER ACTION] Iniciando busca de PERFIL no Firestore para UID: ${uid}...`);
  console.log('>>> [SERVER ACTION] Tentando conectar ao projeto:', firestore.app.options.projectId)
  
  const firestorePromise = getDoc(doc(firestore, 'users', uid));

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore timeout')), TIMEOUT_DURATION)
  );

  try {
    const userDoc = await Promise.race([firestorePromise, timeoutPromise]);

    console.log('<<< [SERVER ACTION] Busca de PERFIL concluída!');

    if (userDoc.exists()) {
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
    console.error(`--- Erro na Action: fetchUserProfileServer (UID: ${uid}) ---`, error.message, error.stack || '');
    // Se ocorrer timeout ou outro erro, retorna null, mas não deixa a Promise pendente.
    return null;
  }
}

/**
 * Mapeia a resposta da API REST do Firestore para um formato de objeto simples.
 */
function mapFirestoreRestResponse(documents: any[]): any[] {
  if (!documents) return [];
  
  return documents.map(doc => {
    const fields = doc.fields;
    const mappedDoc: { [key: string]: any } = {};

    // Extrai o ID do documento a partir do campo 'name'
    const nameParts = doc.name.split('/');
    mappedDoc.id = nameParts[nameParts.length - 1];

    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        const valueObject = fields[key];
        const valueType = Object.keys(valueObject)[0];
        
        // Converte para o tipo de dado correto
        switch (valueType) {
          case 'stringValue':
            mappedDoc[key] = valueObject.stringValue;
            break;
          case 'integerValue':
            mappedDoc[key] = parseInt(valueObject.integerValue, 10);
            break;
          case 'doubleValue':
            mappedDoc[key] = valueObject.doubleValue;
            break;
          case 'booleanValue':
            mappedDoc[key] = valueObject.booleanValue;
            break;
          case 'timestampValue':
            mappedDoc[key] = new Date(valueObject.timestampValue).toISOString();
            break;
          case 'mapValue':
             // Recursivamente mapeia objetos aninhados (não implementado profundamente aqui por simplicidade)
            mappedDoc[key] = valueObject.mapValue.fields; 
            break;
          case 'arrayValue':
            // Mapeia arrays (não implementado profundamente aqui por simplicidade)
            mappedDoc[key] = valueObject.arrayValue.values; 
            break;
          default:
            mappedDoc[key] = valueObject[valueType];
        }
      }
    }
    return mappedDoc;
  });
}

/**
 * Server Action para buscar os banners ativos usando a API REST do Firestore.
 * Isso contorna bloqueios de proxy/firewall ao evitar o SDK do Firebase para leitura.
 * @returns Uma lista de banners.
 */
export async function fetchBannersServer() {
  console.log('--- Iniciando Action: fetchBannersServer via REST API ---');
  
  const projectId = 'grupo-br277';
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const collectionName = 'banners';

  if (!apiKey) {
    console.error("--- Erro na Action: fetchBannersServer --- Chave de API do Firebase não encontrada.");
    return { success: false, error: "Configuração do servidor incompleta.", data: [] };
  }

  // A API REST não suporta filtros complexos como `where('isActive', '==', true)` diretamente em uma única chamada de `get` sem um índice composto.
  // A maneira mais simples é buscar todos e filtrar no servidor. Para coleções grandes, um índice seria necessário.
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;

  try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        cache: 'no-store' // Garante que estamos sempre buscando os dados mais recentes
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Erro de rede: ${response.statusText} - ${JSON.stringify(errorBody)}`);
    }

    const json = await response.json();
    const allBanners = mapFirestoreRestResponse(json.documents);

    // Filtra e ordena no servidor, pois a API REST simples não permite isso facilmente
    const activeBanners = allBanners
      .filter(banner => banner.isActive === true)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log(`--- Sucesso na Action: fetchBannersServer - ${activeBanners.length} banners ativos encontrados. ---`);
    return { success: true, data: activeBanners as any[] };

  } catch (error: any) {
    console.error("--- Erro na Action: fetchBannersServer (REST) ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao buscar banners via API REST.', data: [] };
  }
}


/**
 * Server Action para buscar TODOS os banners (ativos e inativos) para o painel de admin.
 */
export async function fetchAllBannersServer() {
    console.log('--- Iniciando Action: fetchAllBannersServer ---');
    if (!firestore) {
        console.error("--- Erro na Action: fetchAllBannersServer --- Firestore não inicializado.");
        return { success: false, error: "Serviço de banco de dados indisponível.", data: [] };
    }

    try {
        const bannersCollection = collection(firestore, 'banners');
        const q = query(bannersCollection, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
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
    console.error("--- Erro na Action: saveBannerServer --- Firestore não inicializado.");
    return { success: false, error: "Serviço de banco de dados indisponível." };
  }

  try {
    if (bannerId) {
      // Atualizar banner existente
      const bannerRef = doc(firestore, 'banners', bannerId);
      await updateDoc(bannerRef, { ...bannerData, updatedAt: new Date() });
       console.log(`--- Sucesso na Action: saveBannerServer - Banner ${bannerId} atualizado. ---`);
    } else {
      // Criar novo banner
      const newBanner = await addDoc(collection(firestore, 'banners'), { ...bannerData, createdAt: new Date() });
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
        console.error("--- Erro na Action: deleteBannerServer --- Firestore não inicializado.");
        return { success: false, error: "Serviço de banco de dados indisponível." };
    }

    try {
        await deleteDoc(doc(firestore, 'banners', bannerId));
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

    