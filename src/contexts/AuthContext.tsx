
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
  type AuthError,
} from 'firebase/auth';
import { app, firestore } from '@/lib/firebase/client'; // Import Firebase app and firestore
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
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
      // Exibir um toast para o usuário sobre o problema de configuração
      toast({
        title: "Erro de Configuração",
        description: "Não foi possível inicializar o sistema de autenticação. Por favor, contate o suporte.",
        variant: "destructive",
        duration: Infinity, // Manter o toast visível
      });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, toast]);


  const handleAuthError = (error: AuthError, customTitle?: string) => {
    console.error("Firebase Auth Error:", error);
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
        default:
            message = `Erro: ${error.message}`; 
            break;
    }
    toast({
      title: customTitle || 'Erro de Autenticação',
      description: message,
      variant: 'destructive',
    });
  };

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !firestore) {
      toast({ title: "Erro de Inicialização", description: "Serviço de autenticação ou banco de dados não disponível.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const userDocRef = doc(firestore, "Usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          try {
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
          } catch (profileError) {
             handleAuthError(profileError as AuthError, 'Erro ao Criar Perfil');
             // Opcional: não redirecionar ou tentar reverter o login do Auth
             // Por agora, apenas logamos o erro e o usuário prossegue autenticado.
          }
        } else {
          toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a) de volta!' });
          // Poderíamos adicionar lógica para atualizar 'lastLogin' aqui
          // await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
        }
        router.push('/');
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsAuthenticating(false);
    }
  }, [auth, router, toast]);

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
            // Opcional: não redirecionar ou tentar reverter a criação do usuário no Auth.
            // Por agora, o usuário está autenticado mas o perfil pode ter falhado.
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
        // Aqui, poderíamos verificar e criar o perfil se não existir, ou atualizar 'lastLogin'
        // const user = auth.currentUser;
        // if (user) {
        //   const userDocRef = doc(firestore, "Usuarios", user.uid);
        //   const userDocSnap = await getDoc(userDocRef);
        //   if (!userDocSnap.exists()) { /* ... criar perfil ... */ }
        //   else { /* ... atualizar lastLogin ... */ }
        // }
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

  const signOutUser = useCallback(async () => {
    if (!auth) {
       toast({ title: "Erro de Inicialização", description: "Serviço de autenticação não disponível.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true); // Pode não ser necessário para signOut, mas mantém consistência
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
    signOutUser,
    isAuthenticating,
  };

  // Renderiza children somente se o auth estiver carregado e não houver erro de inicialização do Firebase.
  // A verificação `if (!auth)` no useEffect já trata o caso de erro fatal na inicialização do Firebase.
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
