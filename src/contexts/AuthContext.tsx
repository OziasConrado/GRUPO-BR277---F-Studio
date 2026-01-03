
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
  getIdTokenResult,
} from 'firebase/auth';
import { doc, setDoc, getDocFromServer, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase/client';
import { useFirestore } from './FirestoreContext';

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
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>;
  signOutUser: () => Promise<void>;
  reloadUser: () => Promise<void>;
  uploadFile: (file: File, path: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isFirestoreReady } = useFirestore();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authAction, setAuthAction] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthError = useCallback((error: AuthError, customTitle?: string) => {
    console.error("Firebase Auth Error:", error.code, error.message);
    if (error.code === 'unavailable' || error.code === 'firestore/unavailable') {
        return; 
    }
    let message = "Ocorreu um erro. Tente novamente.";
     switch (error.code) {
        case 'auth/wrong-password': message = 'Senha incorreta.'; break;
        case 'auth/user-not-found': message = 'Usuário não encontrado.'; break;
        case 'auth/email-already-in-use': message = 'Este e-mail já está em uso.'; break;
        case 'auth/weak-password': message = 'Senha muito fraca. Mínimo 6 caracteres.'; break;
        case 'auth/invalid-email': message = 'O formato do e-mail é inválido.'; break;
        case 'auth/popup-closed-by-user': message = 'A janela de login foi fechada.'; break;
        case 'auth/too-many-requests': message = 'Muitas tentativas. Tente novamente mais tarde.'; break;
        case 'auth/network-request-failed': message = 'Erro de rede. Verifique sua conexão.'; break;
        default: message = `Ocorreu um problema (${error.code}).`; break;
    }
    toast({ title: customTitle || 'Erro de Autenticação', description: message, variant: 'destructive' });
  }, [toast]);
  
  useEffect(() => {
    if (!isFirestoreReady) {
      setLoading(true);
      return;
    }

    const fetchUserProfile = async (user: FirebaseUser, retryCount = 0) => {
      try {
        const idTokenResult = await getIdTokenResult(user, true);
        const userIsAdmin = idTokenResult.claims.admin === true;
        setIsAdmin(userIsAdmin);
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDocFromServer(userDocRef);

        let profileData: UserProfile;
        if (userDoc.exists()) {
          profileData = userDoc.data() as UserProfile;
          if (user.displayName !== profileData.displayName || user.photoURL !== profileData.photoURL) {
            await updateDoc(userDocRef, {
              displayName: user.displayName,
              displayName_lowercase: user.displayName?.toLowerCase(),
              photoURL: user.photoURL,
            });
            profileData.displayName = user.displayName;
            profileData.photoURL = user.photoURL;
          }
        } else {
          const displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
          profileData = {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            displayName_lowercase: displayName.toLowerCase(),
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
          };
          await setDoc(userDocRef, profileData, { merge: true });
        }
        setUserProfile(profileData);
      } catch (error: any) {
        if (error.code === 'unavailable' || error.code === 'firestore/unavailable') {
          if (retryCount < 3) { // Tenta até 3 vezes
            console.log(`Firestore offline. Tentando buscar perfil novamente em 5 segundos... (Tentativa ${retryCount + 1})`);
            setTimeout(() => fetchUserProfile(user, retryCount + 1), 5000);
          } else {
             console.warn('Could not fetch user profile because client is offline after multiple retries.');
          }
        } else {
          handleAuthError(error, "Erro ao carregar perfil");
          await signOut(auth);
          setCurrentUser(null);
          setUserProfile(null);
          setIsAdmin(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isFirestoreReady, handleAuthError]);

  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthAction('google');
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); } 
    catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [handleAuthError]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setAuthAction('signup');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      toast({ title: 'Cadastro realizado!', description: 'Enviamos um link de verificação para o seu e-mail.' });
    } catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [handleAuthError, toast]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthAction('email');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [handleAuthError]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setAuthAction('reset');
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      toast({ title: 'E-mail Enviado', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
    } catch (error) { handleAuthError(error as AuthError); throw error; } 
    finally { setAuthAction(null); }
  }, [handleAuthError, toast]);

  const resendVerificationEmail = useCallback(async () => {
    if (!currentUser) return;
    setAuthAction('resend-verification');
    try {
      await sendEmailVerification(currentUser);
      toast({ title: 'E-mail Reenviado', description: 'Verifique sua caixa de entrada e spam.' });
    } catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [currentUser, handleAuthError, toast]);

  const reloadUser = useCallback(async () => {
    if (!currentUser) return;
    setAuthAction('reload');
    try {
      await currentUser.reload();
      setCurrentUser({ ...currentUser }); 
    } catch (error) { handleAuthError(error as AuthError); } 
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
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      const firestoreUpdates: Partial<UserProfile> = {};
      if (data.displayName) firestoreUpdates.displayName = data.displayName;
      if (data.displayName) firestoreUpdates.displayName_lowercase = data.displayName.toLowerCase();
      if (data.bio !== undefined) firestoreUpdates.bio = data.bio;
      if (data.location) firestoreUpdates.location = data.location;
      if (data.instagramUsername !== undefined) firestoreUpdates.instagramUsername = data.instagramUsername;
      if (photoURL) firestoreUpdates.photoURL = photoURL;

      await updateDoc(userDocRef, firestoreUpdates);
      
      await currentUser.reload();
      const freshUser = auth.currentUser;
      if (freshUser) setCurrentUser({ ...freshUser });

      setUserProfile(prev => prev ? { ...prev, ...firestoreUpdates } : firestoreUpdates as UserProfile);
      toast({ title: "Sucesso!", description: "Seu perfil foi atualizado." });
    } catch (error) { handleAuthError(error as AuthError, 'Erro ao Atualizar Perfil'); } 
    finally { setAuthAction(null); }
  }, [currentUser, handleAuthError, toast, uploadFile]);

  const signOutUser = useCallback(async () => {
    setAuthAction('signout');
    try {
      await signOut(auth);
      router.push('/login');
      toast({ title: 'Você saiu da sua conta.' });
    } catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [router, handleAuthError, toast]);

  const isProfileComplete = !!(userProfile?.displayName && userProfile?.location);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    isAdmin,
    isProfileComplete,
    loading,
    authAction,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    resendVerificationEmail,
    updateUserProfile,
    signOutUser,
    reloadUser,
    uploadFile,
  };

  return <AuthContext.Provider value={value}>{!loading ? children : null}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
