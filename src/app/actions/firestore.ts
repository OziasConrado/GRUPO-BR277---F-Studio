
'use server';

import { revalidatePath } from 'next/cache';
import { firestore as firestoreAdmin } from '@/lib/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';

const projectId = 'grupobr277-v2-d85f5';
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
      if (!valueObject) {
        mappedDoc[key] = null;
        continue;
      }
      
      const valueType = Object.keys(valueObject)[0];
      
      if (valueType === 'timestampValue') {
          mappedDoc[key] = new Date(valueObject.timestampValue).toISOString();
      } else if (valueType === 'mapValue') {
          const innerFields = valueObject.mapValue.fields || {};
          const mappedFields = mapFirestoreRestResponse([ { name: doc.name, fields: innerFields } ])[0] || {};
          delete mappedFields.id;
          mappedDoc[key] = mappedFields;
      } else if (valueType === 'arrayValue') {
          mappedDoc[key] = (valueObject.arrayValue.values || []).map((v: any) => {
              if (!v) return null;
              const innerValueType = Object.keys(v)[0];
              if (innerValueType === 'mapValue') {
                const innerFields = v.mapValue.fields || {};
                const mappedFields = mapFirestoreRestResponse([ { name: doc.name, fields: innerFields } ])[0] || {};
                delete mappedFields.id;
                return mappedFields;
              }
              return v[innerValueType];
          });
      } else if (valueType !== 'nullValue') {
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
 * Server Action para salvar (criar ou atualizar) um banner usando a API REST do Firestore.
 */
export async function saveBannerServer(
  bannerData: { name: string; targetUrl: string; order: number; isActive: boolean; imageUrl: string; },
  bannerId: string | null
): Promise<{ success: boolean; error?: string; }> {
  if (!apiKey) {
    return { success: false, error: 'Configuração do servidor incompleta (API Key).' };
  }

  const isCreating = !bannerId;
  const url = isCreating
    ? `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/banners?key=${apiKey}`
    : `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/banners/${bannerId}?key=${apiKey}&updateMask.fieldPaths=name&updateMask.fieldPaths=targetUrl&updateMask.fieldPaths=order&updateMask.fieldPaths=isActive&updateMask.fieldPaths=imageUrl&updateMask.fieldPaths=updatedAt`;
  
  const now = new Date().toISOString();
  
  const payload = {
    fields: {
      name: { stringValue: bannerData.name },
      targetUrl: { stringValue: bannerData.targetUrl },
      order: { integerValue: bannerData.order },
      isActive: { booleanValue: bannerData.isActive },
      imageUrl: { stringValue: bannerData.imageUrl },
      updatedAt: { timestampValue: now },
      ...(isCreating && { createdAt: { timestampValue: now } }),
    }
  };

  try {
    const response = await fetch(url, {
      method: isCreating ? 'POST' : 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(`--- Erro na API REST do Firestore (${isCreating ? 'POST' : 'PATCH'} saveBanner) ---`, JSON.stringify(errorBody, null, 2));
      throw new Error(`Falha ao salvar banner: ${response.statusText}`);
    }

    revalidatePath('/admin/banners');
    revalidatePath('/streaming');
    return { success: true };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: saveBannerServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao salvar banner via REST.' };
  }
}

/**
 * Server Action para deletar um banner usando a API REST do Firestore.
 */
export async function deleteBannerServer(bannerId: string): Promise<{ success: boolean; error?: string; }> {
  if (!apiKey) {
    return { success: false, error: 'Configuração do servidor incompleta (API Key).' };
  }
  if (!bannerId) {
    return { success: false, error: 'ID do banner é obrigatório para exclusão.' };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/banners/${bannerId}?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
        if (response.status === 404) {
             console.warn(`Banner com ID ${bannerId} não encontrado para deletar (pode já ter sido removido).`);
             revalidatePath('/admin/banners');
             revalidatePath('/streaming');
             return { success: true };
        }
        const errorBody = await response.json();
        console.error("--- Erro na API REST do Firestore (deleteBanner) ---", JSON.stringify(errorBody, null, 2));
        throw new Error(`Falha ao deletar banner: ${response.statusText}`);
    }
    
    revalidatePath('/admin/banners');
    revalidatePath('/streaming');
    return { success: true };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: deleteBannerServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao deletar banner via REST.' };
  }
}

/**
 * Server Action para buscar um perfil de usuário pelo UID (Admin SDK).
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
            for (const key in data) {
                if (data[key] instanceof Timestamp) {
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
 */
export async function toggleFavoriteServer(userId: string, cameraId: string, currentFavorites: string[]): Promise<{ success: boolean; error?: string; }> {
    if (!userId || !cameraId) {
        return { success: false, error: 'User ID e Camera ID são obrigatórios.' };
    }
    if (!apiKey) {
       return { success: false, error: 'Configuração do servidor incompleta (API Key).' };
    }

    const isFavorite = currentFavorites.includes(cameraId);
    
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

/**
 * Server Action para criar um novo alerta via API REST.
 */
export async function createAlertServer(
  alertData: { type: string; location?: string | null; description: string; userId: string; userName: string; userAvatarUrl: string | null; userLocation: string | undefined, instagramUsername: string | undefined, bio: string | undefined }
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) {
    return { success: false, error: 'Configuração do servidor incompleta (API Key).' };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/alerts?key=${apiKey}`;
  
  const payload = {
    fields: {
      type: { stringValue: alertData.type },
      description: { stringValue: alertData.description },
      userId: { stringValue: alertData.userId },
      userName: { stringValue: alertData.userName },
      timestamp: { timestampValue: new Date().toISOString() },
      // Optional fields
      location: alertData.location ? { stringValue: alertData.location } : { nullValue: null },
      userAvatarUrl: alertData.userAvatarUrl ? { stringValue: alertData.userAvatarUrl } : { nullValue: null },
      userLocation: alertData.userLocation ? { stringValue: alertData.userLocation } : { nullValue: null },
      instagramUsername: alertData.instagramUsername ? { stringValue: alertData.instagramUsername } : { nullValue: null },
      bio: alertData.bio ? { stringValue: alertData.bio } : { nullValue: null },
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("--- Erro na API REST do Firestore (createAlert) ---", JSON.stringify(errorBody, null, 2));
      throw new Error(`Falha ao criar alerta: ${errorBody.error?.message || response.statusText}`);
    }

    revalidatePath('/streaming');
    revalidatePath('/alertas');
    return { success: true };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: createAlertServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao criar alerta via REST.' };
  }
}

/**
 * Server Action para buscar os últimos alertas via API REST (últimos 5 dias).
 */
export async function fetchAlertsServer(limit: number = 6): Promise<{ success: boolean; data: any[]; error?: string; }> {
  if (!apiKey) {
    return { success: false, error: 'Configuração do servidor incompleta (API Key).', data: [] };
  }

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
  const fiveDaysAgoISO = fiveDaysAgo.toISOString();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
  
  const queryPayload = {
    structuredQuery: {
      from: [{ collectionId: 'alerts' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'timestamp' },
          op: 'GREATER_THAN_OR_EQUAL',
          value: { timestampValue: fiveDaysAgoISO }
        }
      },
      orderBy: [{ field: { fieldPath: 'timestamp' }, direction: 'DESCENDING' }],
      limit: limit
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("--- Erro na API REST do Firestore (fetchAlerts) ---", JSON.stringify(errorBody, null, 2));
      throw new Error(`Falha ao buscar alertas: ${errorBody.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const documents = data.map((item: any) => item.document).filter(Boolean);
    const mappedData = mapFirestoreRestResponse(documents);
    return { success: true, data: mappedData };

  } catch (error: any) {
    console.error("--- Erro CRÍTICO na Action REST: fetchAlertsServer ---", error.stack || error);
    return { success: false, error: error.message || 'Falha ao buscar alertas via REST.', data: [] };
  }
}


/**
 * Server Action para deletar um alerta via API REST.
 */
export async function deleteAlertServer(alertId: string): Promise<{ success: boolean; error?: string; }> {
    if (!apiKey) {
        return { success: false, error: 'Configuração do servidor incompleta (API Key).' };
    }
    if (!alertId) {
        return { success: false, error: 'ID do alerta é obrigatório.' };
    }

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/alerts/${alertId}?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("--- Erro na API REST do Firestore (deleteAlertServer) ---", JSON.stringify(errorBody, null, 2));
            throw new Error(`Falha ao deletar alerta: ${errorBody.error?.message || response.statusText}`);
        }

        revalidatePath('/streaming');
        revalidatePath('/alertas');
        return { success: true };

    } catch (error: any) {
        console.error("--- Erro CRÍTICO na Action REST: deleteAlertServer ---", error.stack || error);
        return { success: false, error: error.message || 'Falha ao deletar alerta via REST.' };
    }
}
