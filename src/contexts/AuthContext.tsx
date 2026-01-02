'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  type User as FirebaseUser,
  type AuthError,
  getAuth,
  type Auth,
} from 'firebase/auth';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { firebaseConfig } from '@/lib/firebase/config'; // Import from the new config file

// Interfaces
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    displayName_lowercase?: string;
    photoURL: string | null;
    location?: string;
    bio?: string;
    instagramUsername?: string;
    lastLogin?: any;
    isAdmin?: boolean; // Add isAdmin property
}

interface UpdateUserProfileData {
  displayName?: string;
  newPhotoFile?: File;
  bio?: string;
  instagramUsername?: string;
  location?: string;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean; // Add isAdmin to context type
  isProfileComplete: boolean;
  isAuthenticating: boolean;
  loading: boolean;
  authAction: string | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  uploadFile: (file: File, path: string) => Promise<string>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>;
  signOutUser: () => Promise<void>;
}

// --- Context Definition ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AuthProvider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authAction, setAuthAction] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthError = useCallback((error: AuthError, customTitle?: string) => {
    console.error("Firebase Auth Error:", error.code, error.message);
    let message = "Ocorreu um erro. Tente novamente.";
     switch (error.code) {
        case 'auth/wrong-password': message = 'Senha incorreta. Verifique sua senha e tente novamente.'; break;
        case 'auth/user-not-found': message = 'Usuário não encontrado. Verifique o e-mail digitado ou crie uma nova conta.'; break;
        case 'auth/email-already-in-use': message = 'Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.'; break;
        case 'auth/weak-password': message = 'Senha muito fraca. A senha deve ter pelo menos 6 caracteres.'; break;
        case 'auth/invalid-email': message = 'O formato do e-mail é inválido.'; break;
        case 'auth/popup-closed-by-user': message = 'A janela de login foi fechada. Por favor, tente novamente.'; break;
        case 'auth/cancelled-popup-request': message = 'A janela de login foi cancelada. Por favor, tente novamente.'; break;
        case 'auth/requires-recent-login': message = 'Esta operação é sensível e requer autenticação recente. Faça login novamente.'; break;
        case 'auth/too-many-requests': message = 'Muitas tentativas. Por favor, tente novamente mais tarde.'; break;
        case 'auth/network-request-failed': message = 'Erro de rede. Verifique sua conexão com a internet.'; break;
        case 'storage/retry-limit-exceeded': message = 'O tempo para o envio do arquivo esgotou. Verifique sua conexão e as permissões de armazenamento do Firebase.'; break;
        case 'storage/unauthorized': message = 'Você não tem permissão para enviar este arquivo. Verifique as regras de segurança do Firebase Storage.'; break;
        default: message = `Ocorreu um problema (${error.code}). Por favor, tente novamente.`; break;
    }
    toast({
      title: customTitle || 'Erro de Autenticação',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  useEffect(() => {
    // Lazy initialization of Firebase
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("Firebase config is missing from environment variables.");
      setIsAuthenticating(false);
      return;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    setFirebaseServices({ app, auth, firestore, storage });
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);
            setIsAdmin(!!profileData.isAdmin); // Set admin status from Firestore document
        } else {
           const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
           const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            displayName_lowercase: displayName.toLowerCase(),
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
            isAdmin: false, // Default new users to not be admin
          };
          await setDoc(userDocRef, newUserProfile, { merge: true });
          setUserProfile(newUserProfile);
          setIsAdmin(false);
        }
        setCurrentUser(user);

      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, []);

  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    if (!firebaseServices?.storage) {
      throw new Error("Firebase Storage is not initialized.");
    }
    const storageRef = ref(firebaseServices.storage, path);
    const uploadTask = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  }, [firebaseServices]);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseServices) return;
    setAuthAction('google');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(firebaseServices.auth, provider);
      toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
      router.push('/');
    } catch (error) {
      handleAuthError(error as AuthError, 'Erro no Login com Google');
    } finally {
      setAuthAction(null);
    }
  }, [firebaseServices, router, handleAuthError, toast]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!firebaseServices) return;
    setAuthAction('signup');
    try {
      await createUserWithEmailAndPassword(firebaseServices.auth, email, password);
      toast({ title: 'Cadastro bem-sucedido!', description: 'Sua conta foi criada.' });
      router.push('/');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [firebaseServices, router, handleAuthError, toast]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!firebaseServices) return;
    setAuthAction('email');
    try {
      await signInWithEmailAndPassword(firebaseServices.auth, email, password);
      toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
      router.push('/');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [firebaseServices, router, handleAuthError, toast]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    if (!firebaseServices) return;
    setAuthAction('reset');
    try {
      await firebaseSendPasswordResetEmail(firebaseServices.auth, email);
      toast({
        title: 'Link de Redefinição Enviado',
        description: 'Verifique seu e-mail para as instruções.',
      });
    } catch (error) {
      handleAuthError(error as AuthError, 'Erro ao Enviar E-mail');
      throw error;
    } finally {
      setAuthAction(null);
    }
  }, [firebaseServices, handleAuthError, toast]);

  const updateUserProfile = useCallback(async (data: UpdateUserProfileData) => {
    if (!currentUser || !firebaseServices) return;
    setAuthAction('update');
    try {
      let photoURL = currentUser.photoURL;
      if (data.newPhotoFile) {
        const storagePath = `profile_pictures/${currentUser.uid}/${Date.now()}_${data.newPhotoFile.name}`;
        photoURL = await uploadFile(data.newPhotoFile, storagePath);
      }

      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (data.displayName && data.displayName !== currentUser.displayName) {
        authUpdates.displayName = data.displayName;
      }
      if (photoURL && photoURL !== currentUser.photoURL) {
        authUpdates.photoURL = photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await firebaseUpdateProfile(currentUser, authUpdates);
        await currentUser.reload(); // Recarrega os dados do usuário do Firebase Auth
        setCurrentUser({ ...currentUser }); // Força uma nova renderização com os dados atualizados
      }
      
      const userDocRef = doc(firebaseServices.firestore, 'users', currentUser.uid);
      const firestoreUpdates: Partial<UserProfile> = {
        displayName: data.displayName,
        displayName_lowercase: data.displayName?.toLowerCase(),
        bio: data.bio,
        location: data.location,
        instagramUsername: data.instagramUsername,
        photoURL: photoURL,
      };

      await updateDoc(userDocRef, firestoreUpdates);

      setUserProfile(prev => prev ? { ...prev, ...firestoreUpdates } : firestoreUpdates as UserProfile);
      toast({ title: "Sucesso!", description: "Seu perfil foi atualizado." });

    } catch (error) {
      handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil');
    } finally {
      setAuthAction(null);
    }
  }, [currentUser, firebaseServices, handleAuthError, toast, uploadFile]);

  const signOutUser = useCallback(async () => {
    if (!firebaseServices) return;
    setAuthAction('signout');
    try {
      await signOut(firebaseServices.auth);
      router.push('/login');
      toast({ title: 'Logout realizado com sucesso.' });
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [firebaseServices, router, handleAuthError, toast]);

  const isProfileComplete = !!(userProfile?.displayName && userProfile?.location);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin,
    isProfileComplete,
    isAuthenticating,
    loading: isAuthenticating || authAction !== null,
    authAction,
    firestore: firebaseServices?.firestore || null,
    storage: firebaseServices?.storage || null,
    uploadFile,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    updateUserProfile,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
