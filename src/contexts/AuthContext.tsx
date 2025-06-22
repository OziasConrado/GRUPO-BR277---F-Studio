
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, // Renamed to avoid conflict
  updateProfile as firebaseUpdateProfile, // Renamed
  type User as FirebaseUser,
  type AuthError,
} from 'firebase/auth';
import { app, firestore, storage } from '@/lib/firebase/client'; 
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UpdateUserProfileData {
  displayName?: string;
  newPhotoFile?: File;
  // bio?: string; // Future: Add bio and instagramLink updates
  // instagramLink?: string;
}
interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>; // Added
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>; // Added
  signOutUser: () => Promise<void>;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const auth = getAuth(app);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      console.error("AuthContext: Firebase Auth não está inicializado. Verifique a configuração do Firebase.");
      setLoading(false);
      toast({
        title: "Erro de Configuração",
        description: "Não foi possível inicializar o sistema de autenticação. Por favor, contate o suporte.",
        variant: "destructive",
        duration: Infinity, 
      });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, toast]);

  // NEW: Effect to handle the result from Google's redirect
  useEffect(() => {
    if (!auth || !firestore) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          setIsAuthenticating(true);
          const user = result.user;
          const userDocRef = doc(firestore, "Usuarios", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'Usuário Google',
              photoURL: user.photoURL || null,
              createdAt: serverTimestamp(),
              bio: '',
              instagramLink: '',
            });
            toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a)! Seu perfil foi criado.' });
          } else {
            toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
          }
          router.push('/');
          setIsAuthenticating(false);
        }
      })
      .catch((error) => {
        handleAuthError(error, 'Erro no Login com Google');
        setIsAuthenticating(false);
      });
  }, [auth, router, toast]);


  const handleAuthError = (error: AuthError, customTitle?: string) => {
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
            message = 'O pop-up de login foi fechado antes da conclusão.';
            break;
        case 'auth/cancelled-popup-request':
            message = 'Múltiplas tentativas de login. Por favor, tente novamente.';
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
            // More generic message for unhandled codes
            message = `Ocorreu um problema (${error.code}). Por favor, tente novamente ou contate o suporte se o problema persistir.`;
            break;
    }
    toast({
      title: customTitle || 'Erro de Autenticação',
      description: message,
      variant: 'destructive',
    });
  };

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    // This will navigate the user away. Errors are caught by getRedirectResult.
    await signInWithRedirect(auth, provider);
  }, [auth, toast]);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth || !firestore) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação ou banco de dados não disponível.", variant: "destructive" });
        return;
      }
      setIsAuthenticating(true);
      try {
        const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = newUserCredential.user;
        if (user) {
          const userDocRef = doc(firestore, "Usuarios", user.uid);
          try {
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.email?.split('@')[0] || 'Usuário',
              photoURL: user.photoURL || null,
              createdAt: serverTimestamp(),
              bio: '',
              instagramLink: '',
            });
            toast({ title: 'Cadastro bem-sucedido!', description: 'Sua conta e perfil foram criados.' });
            router.push('/');
          } catch (profileError) {
            handleAuthError(profileError as AuthError, 'Erro ao Criar Perfil');
          }
        }
      } catch (error) {
        handleAuthError(error as AuthError);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [auth, router, toast]
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth || !firestore) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação ou banco de dados não disponível.", variant: "destructive" });
        return;
      }
      setIsAuthenticating(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
        router.push('/');
      } catch (error) {
        handleAuthError(error as AuthError);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [auth, router, toast]
  );

  const sendPasswordResetEmail = useCallback(
    async (email: string) => {
      if (!auth) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
        return;
      }
      setIsAuthenticating(true);
      try {
        await firebaseSendPasswordResetEmail(auth, email);
        toast({
          title: 'Link de Redefinição Enviado',
          description: 'Verifique seu e-mail para as instruções de redefinição de senha.',
        });
      } catch (error) {
        handleAuthError(error as AuthError, 'Erro ao Enviar E-mail');
        throw error; // Re-throw para que a página possa saber que falhou
      } finally {
        setIsAuthenticating(false);
      }
    },
    [auth, toast]
  );

  const updateUserProfile = useCallback(
    async (data: UpdateUserProfileData) => {
      if (!auth?.currentUser || !firestore || !storage) {
        toast({ title: "Erro", description: "Usuário não autenticado ou serviço indisponível.", variant: "destructive" });
        return;
      }
      setIsAuthenticating(true);
      const user = auth.currentUser;
      const userDocRef = doc(firestore, "Usuarios", user.uid);
      
      const authProfileUpdates: { displayName?: string; photoURL?: string } = {};
      const firestoreProfileUpdates: any = {};

      if (data.displayName) {
        authProfileUpdates.displayName = data.displayName;
        firestoreProfileUpdates.displayName = data.displayName;
      }

      if (data.newPhotoFile) {
        try {
          const photoRef = ref(storage, `profile_pictures/${user.uid}/${data.newPhotoFile.name}`);
          await uploadBytes(photoRef, data.newPhotoFile);
          const photoURL = await getDownloadURL(photoRef);
          authProfileUpdates.photoURL = photoURL;
          firestoreProfileUpdates.photoURL = photoURL;
        } catch (uploadError) {
          handleAuthError(uploadError as AuthError, 'Erro no Upload da Foto');
          setIsAuthenticating(false);
          return;
        }
      }

      try {
        if (Object.keys(authProfileUpdates).length > 0) {
          await firebaseUpdateProfile(user, authProfileUpdates);
        }
        if (Object.keys(firestoreProfileUpdates).length > 0) {
          await updateDoc(userDocRef, firestoreProfileUpdates);
        }
        setCurrentUser(auth.currentUser); // Atualiza o estado local do currentUser
        toast({ title: 'Perfil Atualizado!', description: 'Suas informações foram salvas com sucesso.' });
      } catch (error) {
        handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil');
      } finally {
        setIsAuthenticating(false);
      }
    },
    [auth, toast]
  );

  const signOutUser = useCallback(async () => {
    if (!auth) {
       toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true); 
    try {
      await signOut(auth);
      toast({ title: 'Logout realizado', description: 'Você saiu da sua conta.' });
      router.push('/login'); 
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsAuthenticating(false);
    }
  }, [auth, router, toast]);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    updateUserProfile,
    signOutUser,
    isAuthenticating,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
