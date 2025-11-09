import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { auth, db } from './firebase';
import { LoginInput, RegisterInput } from './auth';

// Firebase Auth Hooks
const googleProvider = new GoogleAuthProvider();

export const useFirebaseUser = () => {
  return useQuery({
    queryKey: ['firebase-user'],
    queryFn: () => new Promise<FirebaseUser | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    }),
    staleTime: Infinity,
  });
};

export const useFirebaseLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      return userCredential.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['firebase-user'], user);
    },
  });
};

export const useFirebaseRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      // Store additional user info in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        createdAt: new Date().toISOString(),
      });
      
      return userCredential.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['firebase-user'], user);
    },
  });
};

export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists, if not create it
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Extract name from displayName
        const nameParts = user.displayName?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await setDoc(userDocRef, {
          firstName,
          lastName,
          email: user.email,
          photoURL: user.photoURL,
          provider: 'google',
          createdAt: new Date().toISOString(),
        });
      }
      
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['firebase-user'], user);
    },
  });
};

export const useFirebaseLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await signOut(auth);
    },
    onSuccess: () => {
      queryClient.setQueryData(['firebase-user'], null);
      queryClient.clear();
    },
  });
};
