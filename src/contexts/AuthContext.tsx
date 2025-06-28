
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  type User as FirebaseUser,
  type AuthError,
} from 'firebase/auth';
import { auth, app, firestore, storage } from '@/lib/firebase/client'; 
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    bio?: string;
    instagramUsername?: string;
    location?: string;
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
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>;
  signOutUser: () => Promise<void>;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
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
        case 'auth/unauthorized-domain':
            message = 'Este domínio não está autorizado para operações de login. Verifique a configuração do Firebase.';
            break;
        case 'auth/operation-not-allowed':
            message = 'O método de login por e-mail e senha não está ativado para este aplicativo. Por favor, contate o suporte.';
            break;
        default:
            message = `Ocorreu um problema (${error.code}). Por favor, tente novamente ou contate o suporte se o problema persistir.`;
            break;
    }
    toast({
      title: customTitle || 'Erro de Autenticação',
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  useEffect(() => {
    if (!auth) {
      console.error("AuthContext: Firebase Auth não está inicializado.");
      setLoading(false);
      toast({
        title: "Erro de Configuração",
        description: "Não foi possível inicializar a autenticação.",
        variant: "destructive",
        duration: Infinity, 
      });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        if (firestore) {
            const userDocRef = doc(firestore, "Usuarios", user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            } else {
                setUserProfile(null);
            }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!auth || !firestore) return;
    if (isAuthenticating || loading) return;

    const processRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                setIsAuthenticating(true);
                const user = result.user;
                const userDocRef = doc(firestore, "Usuarios", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    const newProfileData = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || user.email?.split('@')[0] || 'Usuário Google',
                        photoURL: user.photoURL || null,
                        createdAt: serverTimestamp(),
                        bio: '',
                        instagramUsername: '',
                        location: '',
                    };
                    await setDoc(userDocRef, newProfileData);
                    setUserProfile({
                      bio: newProfileData.bio,
                      instagramUsername: newProfileData.instagramUsername,
                      location: newProfileData.location,
                    });
                    toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a)! Seu perfil foi criado.' });
                } else {
                    setUserProfile(userDocSnap.data() as UserProfile);
                    toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
                }
                router.push('/');
            }
        } catch(error) {
            handleAuthError(error as AuthError, 'Erro no Login com Google');
        } finally {
            setIsAuthenticating(false);
        }
    }
    processRedirect();
  }, [loading, isAuthenticating, router, toast, handleAuthError]);


  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider).catch(err => {
      handleAuthError(err, 'Erro ao Redirecionar para Google');
      setIsAuthenticating(false);
    });
  }, [toast, handleAuthError]);

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
            const newProfileData = {
              uid: user.uid,
              email: user.email,
              displayName: user.email?.split('@')[0] || 'Usuário',
              photoURL: user.photoURL || null,
              createdAt: serverTimestamp(),
              bio: '',
              instagramUsername: '',
              location: '',
            };
            await setDoc(userDocRef, newProfileData);
            setUserProfile({
              bio: newProfileData.bio,
              instagramUsername: newProfileData.instagramUsername,
              location: newProfileData.location,
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
    [router, toast, handleAuthError]
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
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
    [router, toast, handleAuthError]
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
        throw error;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [toast, handleAuthError]
  );

  const updateUserProfile = useCallback(async (data: UpdateUserProfileData) => {
    const userForUpdate = auth.currentUser;
    if (!userForUpdate || !firestore || !storage) {
        toast({ title: "Erro", description: "Usuário não autenticado ou serviço indisponível.", variant: "destructive" });
        return;
    }

    setIsAuthenticating(true);

    try {
        let newPhotoURL: string | null = null;
        if (data.newPhotoFile) {
            const photoRef = ref(storage, `profile_pictures/${userForUpdate.uid}/${Date.now()}_${data.newPhotoFile.name}`);
            await uploadBytes(photoRef, data.newPhotoFile);
            newPhotoURL = await getDownloadURL(photoRef);
        }

        const authProfileUpdates: { displayName?: string; photoURL?: string } = {};
        if (data.displayName && data.displayName !== userForUpdate.displayName) {
            authProfileUpdates.displayName = data.displayName;
        }
        if (newPhotoURL) {
            authProfileUpdates.photoURL = newPhotoURL;
        }

        const firestoreProfileUpdates: any = {};
        if (data.displayName && data.displayName !== userForUpdate.displayName) firestoreProfileUpdates.displayName = data.displayName;
        if (newPhotoURL) firestoreProfileUpdates.photoURL = newPhotoURL;
        if (data.bio !== undefined && data.bio !== userProfile?.bio) firestoreProfileUpdates.bio = data.bio;
        if (data.location !== undefined && data.location !== userProfile?.location) firestoreProfileUpdates.location = data.location;
        if (data.instagramUsername !== undefined && data.instagramUsername !== userProfile?.instagramUsername) {
            firestoreProfileUpdates.instagramUsername = data.instagramUsername.replace('@','');
        }

        const hasAuthUpdates = Object.keys(authProfileUpdates).length > 0;
        const hasFirestoreUpdates = Object.keys(firestoreProfileUpdates).length > 0;

        if (!hasAuthUpdates && !hasFirestoreUpdates) {
            toast({ title: 'Nenhuma Alteração', description: 'Nenhuma informação foi alterada.' });
            setIsAuthenticating(false);
            return;
        }

        if (hasAuthUpdates) {
            await firebaseUpdateProfile(userForUpdate, authProfileUpdates);
        }

        const userDocRef = doc(firestore, "Usuarios", userForUpdate.uid);
        if (hasFirestoreUpdates) {
            firestoreProfileUpdates.updatedAt = serverTimestamp();
            await setDoc(userDocRef, firestoreProfileUpdates, { merge: true });
        }
        
        // Re-fetch all data from source of truth to guarantee consistency
        await userForUpdate.reload();
        const updatedDocSnap = await getDoc(userDocRef);

        // Update local state with the freshly fetched data
        setCurrentUser(auth.currentUser);
        if (updatedDocSnap.exists()) {
            setUserProfile(updatedDocSnap.data() as UserProfile);
        }
        
        toast({ title: 'Perfil Atualizado!', description: 'Suas informações foram salvas com sucesso.' });
        
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({ variant: "destructive", title: 'Erro ao Atualizar Perfil', description: 'Não foi possível salvar. Verifique o console para detalhes.'});
        handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil');
    } finally {
        setIsAuthenticating(false);
    }
  }, [userProfile, handleAuthError, router, toast]);


  const signOutUser = useCallback(async () => {
    if (!auth) {
       toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true); 
    try {
      await signOut(auth);
      setUserProfile(null);
      toast({ title: 'Logout realizado', description: 'Você saiu da sua conta.' });
      router.push('/login'); 
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsAuthenticating(false);
    }
  }, [router, toast, handleAuthError]);

  const isProfileComplete = !!(currentUser?.displayName && userProfile?.location);

  const value = {
    currentUser,
    userProfile,
    isProfileComplete,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    updateUserProfile,
    signOutUser,
    isAuthenticating,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
