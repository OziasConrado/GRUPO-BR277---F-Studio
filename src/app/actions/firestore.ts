
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
         mappedDoc[key] = valueObject.mapValue.fields;
      } else if (valueType === 'arrayValue') {
          // Simplificado: extrai os valores do array. Assume tipos primitivos.
          mappedDoc[key] = valueObject.arrayValue.values?.map((v: any) => Object.values(v)[0]) || [];
      } else if (valueType === 'nullValue') {
          mappedDoc[key] = null;
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
        revalidate: 300, 
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
    
    return { success: true, data: activeBanners };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: fetchBannersServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao buscar banners via REST.', data: [] };
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
