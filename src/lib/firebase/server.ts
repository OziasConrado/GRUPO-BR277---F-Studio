
// --- Início da Implementação do Padrão Singleton para o Lado do Servidor ---

import { initializeApp, getApp, getApps, type App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getStorage, type Storage } from 'firebase-admin/storage';
import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';


// Interface para as credenciais decodificadas
interface FirebaseServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: Storage;

try {
  // Verifica se o app já foi inicializado para evitar erros
  if (admin.apps.length === 0) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT não está definida.");
    }
    const serviceAccount: FirebaseServiceAccount = JSON.parse(serviceAccountString);

    app = initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
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
  console.error("Erro ao inicializar Firebase Admin SDK:", e.message);
  // Em um ambiente de produção, você pode querer lançar o erro
  // ou lidar com ele de forma mais robusta.
  // Para evitar que a aplicação quebre durante o build ou dev,
  // podemos deixar as variáveis indefinidas, mas isso causará erros
  // se elas forem usadas.
}


// Exporta as instâncias prontas para serem usadas em qualquer lugar do app (no lado do servidor).
export { app, auth, firestore, storage };



