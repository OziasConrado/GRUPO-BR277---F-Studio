
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
  sendEmailVerification,
  type User as FirebaseUser,
  type AuthError,
  type Auth,
  getIdTokenResult,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
    isAdmin?: boolean; 
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
  isAdmin: boolean;
  isProfileComplete: boolean;
  loading: boolean;
  authAction: string | null;
  firestore: Firestore; // Now non-nullable
  storage: FirebaseStorage; // Now non-nullable
  uploadFile: (file: File, path: string) => Promise<string>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>;
  signOutUser: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

// --- Context Definition ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AuthProvider Component ---
interface AuthProviderProps {
  children: ReactNode;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

export function AuthProvider({ children, auth, firestore, storage }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authAction, setAuthAction] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const handleAuthError = useCallback((error: AuthError, customTitle?: string) => {
    console.error("Firebase Auth Error:", error.code, error.message);
    // Ignore "unavailable" error as it's a known issue in some dev environments
    if (error.code === 'unavailable' || error.code === 'firestore/unavailable') {
        return;
    }
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          await user.reload(); 
          const freshUser = auth.currentUser;

          if (!freshUser) {
             setCurrentUser(null);
             setUserProfile(null);
             setIsAdmin(false);
             setLoading(false);
             return;
          }

          const userDocRef = doc(firestore, 'users', freshUser.uid);
          
          const idTokenResult = await getIdTokenResult(freshUser, true);
          const userIsAdmin = idTokenResult.claims.admin === true;
          
          const userDoc = await getDoc(userDocRef);
          let profileData: UserProfile;
          if (userDoc.exists()) {
              profileData = userDoc.data() as UserProfile;
              if (freshUser.displayName !== profileData.displayName || freshUser.photoURL !== profileData.photoURL) {
                await updateDoc(userDocRef, {
                  displayName: freshUser.displayName,
                  displayName_lowercase: freshUser.displayName?.toLowerCase(),
                  photoURL: freshUser.photoURL,
                });
                profileData.displayName = freshUser.displayName;
                profileData.photoURL = freshUser.photoURL;
              }
          } else {
             const displayName = freshUser.displayName || freshUser.email?.split('@')[0] || 'Usuário';
             profileData = {
              uid: freshUser.uid,
              email: freshUser.email,
              displayName: displayName,
              displayName_lowercase: displayName.toLowerCase(),
              photoURL: freshUser.photoURL,
              lastLogin: serverTimestamp(),
            };
            await setDoc(userDocRef, profileData, { merge: true });
          }
          
          setCurrentUser(freshUser);
          setUserProfile(profileData);
          setIsAdmin(userIsAdmin);
        } catch (error: any) {
          handleAuthError(error, "Erro ao carregar perfil");
        } finally {
            setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, handleAuthError]);

  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  }, [storage]);

  const signInWithGoogle = useCallback(async () => {
    setAuthAction('google');
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { handleAuthError(error as AuthError, 'Erro no Login com Google'); } 
    finally { setAuthAction(null); }
  }, [auth, handleAuthError]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setAuthAction('signup');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      toast({ title: 'Cadastro bem-sucedido!', description: 'Enviamos um link de verificação para o seu e-mail.' });
    } catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [auth, handleAuthError, toast]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthAction('email');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [auth, handleAuthError]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setAuthAction('reset');
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      toast({ title: 'Link de Redefinição Enviado', description: 'Verifique seu e-mail para as instruções.' });
    } catch (error) { handleAuthError(error as AuthError, 'Erro ao Enviar E-mail'); throw error; } 
    finally { setAuthAction(null); }
  }, [auth, handleAuthError, toast]);

  const resendVerificationEmail = useCallback(async () => {
    if (!currentUser) { toast({ variant: 'destructive', title: 'Erro', description: 'Nenhum usuário logado para reenviar o e-mail.' }); return; }
    setAuthAction('resend-verification');
    try {
      await sendEmailVerification(currentUser);
      toast({ title: 'E-mail Reenviado', description: 'Verifique sua caixa de entrada e spam.' });
    } catch (error) { handleAuthError(error as AuthError, 'Erro ao Reenviar'); } 
    finally { setAuthAction(null); }
  }, [currentUser, handleAuthError, toast]);

  const reloadUser = useCallback(async () => {
    if (!currentUser) return;
    setAuthAction('reload');
    try {
      await currentUser.reload();
      setCurrentUser({ ...currentUser });
    } catch (error) { handleAuthError(error as AuthError, 'Erro ao Recarregar Usuário'); } 
    finally { setAuthAction(null); }
  }, [currentUser, handleAuthError]);

  const updateUserProfile = useCallback(async (data: UpdateUserProfileData) => {
    if (!currentUser) return;
    setAuthAction('update');
    try {
      let photoURL = currentUser.photoURL;
      if (data.newPhotoFile) {
        const storagePath = `profile_pictures/${currentUser.uid}/${Date.now()}_${data.newPhotoFile.name}`;
        photoURL = await uploadFile(data.newPhotoFile, storagePath);
      }
      const authUpdates: { displayName?: string; photoURL?: string } = {};
      if (data.displayName && data.displayName !== currentUser.displayName) authUpdates.displayName = data.displayName;
      if (photoURL && photoURL !== currentUser.photoURL) authUpdates.photoURL = photoURL;
      if (Object.keys(authUpdates).length > 0) await firebaseUpdateProfile(currentUser, authUpdates);
      
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const firestoreUpdates: Partial<UserProfile> = {
        displayName: data.displayName,
        displayName_lowercase: data.displayName?.toLowerCase(),
        bio: data.bio,
        location: data.location,
        instagramUsername: data.instagramUsername,
        photoURL: photoURL,
      };
      await updateDoc(userDocRef, firestoreUpdates);
      
      await currentUser.reload();
      const freshUser = auth.currentUser;
      if (freshUser) setCurrentUser({ ...freshUser });

      setUserProfile(prev => prev ? { ...prev, ...firestoreUpdates } : firestoreUpdates as UserProfile);
      toast({ title: "Sucesso!", description: "Seu perfil foi atualizado." });
    } catch (error) { handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil'); } 
    finally { setAuthAction(null); }
  }, [currentUser, auth, firestore, handleAuthError, toast, uploadFile]);

  const signOutUser = useCallback(async () => {
    setAuthAction('signout');
    try {
      await signOut(auth);
      router.push('/login');
      toast({ title: 'Logout realizado com sucesso.' });
    } catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [auth, router, handleAuthError, toast]);

  const isProfileComplete = !!(userProfile?.displayName && userProfile?.location);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin,
    isProfileComplete,
    loading,
    authAction,
    firestore,
    storage,
    uploadFile,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    resendVerificationEmail,
    updateUserProfile,
    signOutUser,
    reloadUser,
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
