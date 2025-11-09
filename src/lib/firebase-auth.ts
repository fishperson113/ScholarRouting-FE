import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { auth } from './firebase';
import { LoginInput, RegisterInput } from './auth';

// Firebase Auth Hooks

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
      
      // TODO: Store additional user info (firstName, lastName) in Firestore
      // await setDoc(doc(db, 'users', userCredential.user.uid), {
      //   firstName: data.firstName,
      //   lastName: data.lastName,
      //   email: data.email,
      // });
      
      return userCredential.user;
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
