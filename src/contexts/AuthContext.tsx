
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
import { auth, app, firestore, storage } from '@/lib/firebase/client'; 
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { ref, getDownloadURL, uploadBytes, uploadBytesResumable } from "firebase/storage";
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
  authAction: string | null;
  isAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !firestore) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
        return;
    }
    setAuthAction('google');
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const userDocRef = doc(firestore, "Usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário Google';
            const newProfileData = {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                displayName_lowercase: displayName.toLowerCase(),
                photoURL: user.photoURL || null,
                createdAt: serverTimestamp(),
                bio: '',
                instagramUsername: '',
                location: '',
            };
            await setDoc(userDocRef, newProfileData);
            toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a)! Seu perfil foi criado.' });
        } else {
            toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
        }
        router.push('/');

    } catch (error) {
        handleAuthError(error as AuthError, 'Erro no Login com Google');
    } finally {
        setAuthAction(null);
    }
  }, [router, toast, handleAuthError]);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth || !firestore) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação ou banco de dados não disponível.", variant: "destructive" });
        return;
      }
      setAuthAction('signup');
      try {
        const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = newUserCredential.user;
        if (user) {
          const userDocRef = doc(firestore, "Usuarios", user.uid);
          try {
            const displayName = user.email?.split('@')[0] || 'Usuário';
            const newProfileData = {
              uid: user.uid,
              email: user.email,
              displayName: displayName,
              displayName_lowercase: displayName.toLowerCase(),
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
        setAuthAction(null);
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
    },
    [router, toast, handleAuthError]
  );

  const sendPasswordResetEmail = useCallback(
    async (email: string) => {
      if (!auth) {
        toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
        return;
      }
      setAuthAction('reset');
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
        setAuthAction(null);
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

    setAuthAction('update');
    toast({ title: "Atualizando perfil...", description: "Por favor, aguarde." });

    try {
        let newPhotoURL: string | null = null;
        if (data.newPhotoFile) {
            const file = data.newPhotoFile;
            const photoRef = ref(storage, `profile_pictures/${userForUpdate.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(photoRef, file);
            newPhotoURL = await getDownloadURL(snapshot.ref);
        }

        const authProfileUpdates: { displayName?: string; photoURL?: string } = {};
        if (data.displayName && data.displayName !== userForUpdate.displayName) {
            authProfileUpdates.displayName = data.displayName;
        }
        if (newPhotoURL) {
            authProfileUpdates.photoURL = newPhotoURL;
        }

        const firestoreProfileUpdates: any = {};
        if (data.displayName && data.displayName !== userForUpdate.displayName) {
            firestoreProfileUpdates.displayName = data.displayName;
            firestoreProfileUpdates.displayName_lowercase = data.displayName.toLowerCase();
        }
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
            setAuthAction(null);
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
        
        await userForUpdate.reload();
        const updatedDocSnap = await getDoc(userDocRef);

        setCurrentUser(auth.currentUser);
        if (updatedDocSnap.exists()) {
            setUserProfile(updatedDocSnap.data() as UserProfile);
        }
        
        toast({ title: 'Perfil Atualizado!', description: 'Suas informações foram salvas com sucesso.' });
        
    } catch (error) {
        console.error("Error updating profile:", error);
        handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil');
    } finally {
        setAuthAction(null);
    }
  }, [userProfile, toast, handleAuthError]);


  const signOutUser = useCallback(async () => {
    if (!auth) {
       toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
      return;
    }
    setAuthAction('signout'); 
    try {
      await signOut(auth);
      setUserProfile(null);
      toast({ title: 'Logout realizado', description: 'Você saiu da sua conta.' });
      router.push('/login'); 
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setAuthAction(null);
    }
  }, [router, toast, handleAuthError]);

  const isProfileComplete = !!(currentUser && currentUser.displayName && userProfile?.location);
  const isAuthenticating = authAction !== null;

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
    authAction,
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
