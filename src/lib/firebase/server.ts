
// --- Início da Implementação do Padrão Singleton para o Lado do Servidor ---

import { initializeApp, getApp, getApps, type App as FirebaseApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';

// Variáveis para armazenar as instâncias dos serviços
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: Storage | undefined;

// Verifica se a variável de ambiente existe
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountString) {
  try {
    // Evita reinicialização do app
    if (admin.apps.length === 0) {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

      app = initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "grupo-br277.appspot.com",
      });
    } else {
      app = getApp();
    }

    // Inicializa os serviços usando a instância única do app
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);

  } catch (e: any) {
    console.error("Erro CRÍTICO ao inicializar Firebase Admin SDK (mesmo com a variável de ambiente presente):", e.message);
  }
} else {
  // Se a variável de ambiente não existe, avisamos no console durante o build.
  // Isso evita que o build quebre, mas os serviços do Firebase Admin não estarão disponíveis.
  console.warn("Aviso: FIREBASE_SERVICE_ACCOUNT ausente. O Firebase Admin SDK não será inicializado. Isso é esperado durante o build local, mas será um erro em produção.");
}

// Exporta as instâncias (que podem ser undefined se a inicialização falhar ou for ignorada)
export { app, auth, firestore, storage };
