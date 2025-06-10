
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
import { app } from '@/lib/firebase/client'; // Your Firebase app instance
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleAuthError = (error: AuthError) => {
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
            message = `Erro: ${error.message}`; // Fallback para mensagem de erro genérica do Firebase
            break;
    }
    toast({
      title: 'Erro de Autenticação',
      description: message,
      variant: 'destructive',
    });
  };

  const signInWithGoogle = useCallback(async () => {
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Login com Google bem-sucedido!', description: 'Bem-vindo(a)!' });
      router.push('/'); // Redirect to home or dashboard
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsAuthenticating(false);
    }
  }, [auth, router, toast]);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      setIsAuthenticating(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Cadastro bem-sucedido!', description: 'Sua conta foi criada.' });
        router.push('/');
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

  const signOutUser = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      await signOut(auth);
      toast({ title: 'Logout realizado', description: 'Você saiu da sua conta.' });
      router.push('/login'); // Redirect to login page after sign out
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
