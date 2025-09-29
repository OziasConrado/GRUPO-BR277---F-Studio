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
} from 'firebase/auth';
import { auth, firestore, storage } from '@/lib/firebase/client';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    location?: string;
    bio?: string;
    instagramUsername?: string;
    lastLogin?: any;
}

interface UpdateUserProfileData {
  displayName?: string;
  newPhotoFile?: File;
  bio?: string;
  instagramUsername?: string;
  location?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isProfileComplete: boolean;
  isAuthenticating: boolean;
  loading: boolean;
  authAction: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authAction, setAuthAction] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthError = useCallback((error: AuthError, customTitle?: string) => {
    console.error("Firebase Auth Error:", error.code, error.message);
    let message = "Ocorreu um erro. Tente novamente.";
    switch (error.code) {
        case 'auth/wrong-password':
            message = 'Senha incorreta. Verifique sua senha e tente novamente.';
            break;
        case 'auth/user-not-found':
            message = 'Usuário não encontrado. Verifique o e-mail digitado ou crie uma nova conta.';
            break;
        case 'auth/email-already-in-use':
            message = 'Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.';
            break;
        case 'auth/weak-password':
            message = 'Senha muito fraca. A senha deve ter pelo menos 6 caracteres.';
            break;
        case 'auth/invalid-email':
            message = 'O formato do e-mail é inválido.';
            break;
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            message = 'A janela de login foi fechada. Por favor, tente novamente.';
            break;
        case 'auth/requires-recent-login':
            message = 'Esta operação é sensível e requer autenticação recente. Faça login novamente antes de tentar novamente.';
            break;
        case 'auth/too-many-requests':
            message = 'Muitas tentativas. Por favor, tente novamente mais tarde.';
            break;
        case 'auth/network-request-failed':
            message = 'Erro de rede. Verifique sua conexão com a internet e tente novamente.';
            break;
        default:
            message = `Ocorreu um problema (${error.code}). Por favor, tente novamente.`;
            break;
    }
    toast({
      title: customTitle || 'Erro de Autenticação',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(firestore, 'Usuarios', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
          };
          await setDoc(userDocRef, newUserProfile, { merge: true });
          setUserProfile(newUserProfile);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthAction('google');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
      router.push('/');
    } catch (error) {
      handleAuthError(error as AuthError, 'Erro no Login com Google');
    } finally {
      setAuthAction(null);
    }
  }, [router, handleAuthError, toast]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setAuthAction('signup');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Cadastro bem-sucedido!', description: 'Sua conta foi criada.' });
      router.push('/');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [router, handleAuthError, toast]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthAction('email');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
      router.push('/');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [router, handleAuthError, toast]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setAuthAction('reset');
    try {
      await firebaseSendPasswordResetEmail(auth, email);
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
  }, [handleAuthError, toast]);

  const updateUserProfile = useCallback(async (data: UpdateUserProfileData) => {
    if (!currentUser) return;
    setAuthAction('update');
    setLoading(true);
    try {
        let photoURL = currentUser.photoURL;
        if (data.newPhotoFile) {
            const storagePath = `profile_pictures/${currentUser.uid}/${Date.now()}_${data.newPhotoFile.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadResult = await uploadBytes(storageRef, data.newPhotoFile);
            photoURL = await getDownloadURL(uploadResult.ref);
        }

        const authUpdates: { displayName?: string, photoURL?: string } = {};
        if (data.displayName && data.displayName !== currentUser.displayName) {
            authUpdates.displayName = data.displayName;
        }
        if (photoURL && photoURL !== currentUser.photoURL) {
            authUpdates.photoURL = photoURL;
        }
        if (Object.keys(authUpdates).length > 0) {
            await firebaseUpdateProfile(currentUser, authUpdates);
        }
        
        const userDocRef = doc(firestore, 'Usuarios', currentUser.uid);
        const firestoreUpdates: any = {
          displayName_lowercase: data.displayName?.toLowerCase(),
          bio: data.bio,
          location: data.location,
          instagramUsername: data.instagramUsername,
          photoURL: photoURL,
          displayName: data.displayName,
        };
        await updateDoc(userDocRef, firestoreUpdates);

        setUserProfile(prev => prev ? { ...prev, ...firestoreUpdates } : firestoreUpdates as UserProfile);
        
        toast({ title: "Sucesso!", description: "Seu perfil foi atualizado." });

    } catch (error) {
        console.error("Error updating profile:", error);
        handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil');
    } finally {
        setAuthAction(null);
        setLoading(false);
    }
  }, [currentUser, handleAuthError, toast]);

  const signOutUser = useCallback(async () => {
    setAuthAction('signout');
    try {
      await signOut(auth);
      router.push('/login');
      toast({ title: 'Logout realizado com sucesso.' });
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [router, handleAuthError, toast]);

  const isProfileComplete = !!(userProfile?.displayName && userProfile?.location);

  const value = {
    currentUser,
    userProfile,
    isProfileComplete,
    isAuthenticating,
    loading: loading || authAction !== null,
    authAction,
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
