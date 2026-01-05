
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
import { doc, setDoc, updateDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase/client';

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
    favorites?: string[]; // Array of camera IDs
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
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateUserProfile: (data: UpdateUserProfileData) => Promise<void>;
  signOutUser: () => Promise<void>;
  reloadUser: () => Promise<void>;
  uploadFile: (file: File, path: string) => Promise<string>;
  firestore: typeof db | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authAction, setAuthAction] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthError = useCallback((error: AuthError, customTitle?: string) => {
    console.error("Firebase Auth Error:", error.code, error.message);
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
    if (!auth) {
      console.warn("Auth service not available, skipping onAuthStateChanged listener.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUserProfile(null);
      setIsAdmin(false);

      if (user) {
        setCurrentUser(user);
        try {
          const idTokenResult = await getIdTokenResult(user, true);
          setIsAdmin(idTokenResult.claims.admin === true);
          
          const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUserProfile({ uid: user.uid, ...userDoc.data() } as UserProfile);
          } else {
             console.log(`Could not fetch user profile for ${user.uid} immediately. Will rely on client-side cache or subsequent fetches.`);
             const newUserProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                favorites: [],
             };
             setUserProfile(newUserProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile during auth state change:", error);
           const basicProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                favorites: [],
           };
           setUserProfile(basicProfile);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    if (!storage) throw new Error("Serviço de armazenamento não disponível.");
    const storageRef = ref(storage, path);
    const uploadTask = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadTask.ref);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !db) return;
    setAuthAction('google');
    const provider = new GoogleAuthProvider();
    try { 
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDocFromServer(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                displayName_lowercase: user.displayName?.toLowerCase(),
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                favorites: [],
            }, { merge: true });
        } else {
            await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
        }
    } 
    catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [handleAuthError]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth || !db) return;
    setAuthAction('signup');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.email?.split('@')[0],
        displayName_lowercase: user.email?.split('@')[0].toLowerCase(),
        photoURL: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        favorites: [],
      });
      
      toast({ title: 'Cadastro realizado!', description: 'Enviamos um link de verificação para o seu e-mail.' });
    } catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [handleAuthError, toast]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) return;
    setAuthAction('email');
    try { 
        await signInWithEmailAndPassword(auth, email, password);
    } 
    catch (error) { handleAuthError(error as AuthError); } 
    finally { setAuthAction(null); }
  }, [handleAuthError]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    if (!auth) return;
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
    if (!currentUser || !db) return;
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
      if (data.displayName) {
        firestoreUpdates.displayName = data.displayName;
        firestoreUpdates.displayName_lowercase = data.displayName.toLowerCase();
      }
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
  }, [currentUser, db, handleAuthError, toast, uploadFile]);

  const signOutUser = useCallback(async () => {
    if (!auth) return;
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
    setUserProfile,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    resendVerificationEmail,
    updateUserProfile,
    signOutUser,
    reloadUser,
    uploadFile,
    firestore: db,
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
