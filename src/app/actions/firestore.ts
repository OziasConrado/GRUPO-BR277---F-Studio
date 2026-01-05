
'use server';

import { revalidatePath } from 'next/cache';
import { firestore as firestoreAdmin } from '@/lib/firebase/server';

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
      
      // Convert Timestamps to ISO strings
      if (valueType === 'timestampValue') {
          mappedDoc[key] = new Date(valueObject.timestampValue).toISOString();
      } else if (valueType === 'mapValue') {
          // This is a simplified recursive call. For deeper nesting, a more robust solution would be needed.
          mappedDoc[key] = mapFirestoreRestResponse([ { fields: valueObject.mapValue.fields } ])[0];
      } else if (valueType === 'arrayValue') {
          mappedDoc[key] = (valueObject.arrayValue.values || []).map((v: any) => {
              const innerValueType = Object.keys(v)[0];
              if (innerValueType === 'mapValue') {
                return mapFirestoreRestResponse([ { fields: v.mapValue.fields } ])[0];
              }
              return v[innerValueType];
          });
      } else if (valueType !== 'nullValue') {
        // Handle other primitive types
        mappedDoc[key] = valueObject[valueType];
      } else {
        mappedDoc[key] = null;
      }
    }
    return mappedDoc;
  });
}


/**
 * Server Action para buscar banners ativos usando a API REST do Firestore.
 * @returns Um objeto com sucesso/erro e os dados dos banners.
 */
export async function fetchAllBannersServer(): Promise<{ success: boolean; data: any[]; error?: string; }> {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/banners?key=${apiKey}&orderBy=order`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("--- Erro na API REST do Firestore (fetchAllBanners) ---", JSON.stringify(errorBody, null, 2));
      throw new Error(`Falha ao buscar banners: ${response.statusText}`);
    }

    const data = await response.json();
    const mappedData = mapFirestoreRestResponse(data.documents);
    return { success: true, data: mappedData };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: fetchAllBannersServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao buscar banners via REST.', data: [] };
  }
}

/**
 * Server Action para buscar um perfil de usuário pelo UID (Admin SDK).
 * @param uid - O UID do usuário a ser buscado.
 * @returns Um objeto com sucesso/erro e os dados do perfil.
 */
export async function fetchUserProfileServer(uid: string): Promise<{ success: boolean; data?: any; error?: string; }> {
  if (!firestoreAdmin) {
    return { success: false, error: "Serviço de banco de dados indisponível no servidor." };
  }
  try {
    const userDocRef = firestoreAdmin.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
        const data = docSnap.data();
        if (data) {
            // Serialize Timestamp fields
            for (const key in data) {
                if (data[key] instanceof Object && 'toDate' in data[key]) {
                    data[key] = data[key].toDate().toISOString();
                }
            }
        }
      return { success: true, data: { id: docSnap.id, ...data } };
    } else {
      return { success: false, error: 'Perfil de usuário não encontrado.' };
    }
  } catch (error: any) {
    console.error(`Erro ao buscar perfil para UID ${uid}:`, error);
    return { success: false, error: 'Falha ao buscar dados do perfil do usuário.' };
  }
}


/**
 * Server Action para alternar um favorito de câmera para um usuário via API REST.
 * @param userId - O UID do usuário.
 * @param cameraId - O ID da câmera a ser adicionada/removida.
 * @param currentFavorites - A lista atual de favoritos do usuário.
 * @returns Um objeto com sucesso/erro.
 */
export async function toggleFavoriteServer(userId: string, cameraId: string, currentFavorites: string[]): Promise<{ success: boolean; error?: string; }> {
    if (!userId || !cameraId) {
        return { success: false, error: 'User ID e Camera ID são obrigatórios.' };
    }
    if (!apiKey) {
       return { success: false, error: 'Configuração do servidor incompleta (API Key).' };
    }

    const isFavorite = currentFavorites.includes(cameraId);

    // Regra: Limite de 4 favoritos ao tentar adicionar um novo.
    if (!isFavorite && currentFavorites.length >= 4) {
      return { success: false, error: 'Limite atingido: você pode favoritar no máximo 4 câmeras.' };
    }

    const updatedFavorites = isFavorite
        ? currentFavorites.filter(id => id !== cameraId)
        : [...currentFavorites, cameraId];

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=favorites&key=${apiKey}`;

    const payload = {
        fields: {
            favorites: {
                arrayValue: {
                    values: updatedFavorites.map(id => ({ stringValue: id }))
                }
            }
        }
    };
    
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("--- Erro no PATCH da API REST do Firestore (toggleFavorite) ---", JSON.stringify(errorBody, null, 2));
            throw new Error(`Falha ao atualizar favoritos: ${response.statusText}`);
        }
        
        revalidatePath('/streaming');
        return { success: true };

    } catch (error: any) {
        console.error("--- Erro CRÍTICO na Action REST: toggleFavoriteServer ---", error.stack || error);
        return { success: false, error: error.message || 'Falha ao atualizar favoritos via REST.' };
    }
}
