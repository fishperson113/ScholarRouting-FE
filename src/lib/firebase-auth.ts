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

import { auth } from './firebase';
import { LoginInput, RegisterInput } from './auth';
import { env } from '@/config/env';

// Firebase Auth Hooks
const googleProvider = new GoogleAuthProvider();

const API_URL = env.API_URL;

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
    onSuccess: async (user) => {
      queryClient.setQueryData(['firebase-user'], user);
      await queryClient.invalidateQueries({ queryKey: ['firebase-user'] });
    },
  });
};

export const useFirebaseRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      // Register with backend API - backend will handle Firebase user creation
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          display_name: `${data.firstName} ${data.lastName}`,
          first_name: data.firstName,
          last_name: data.lastName,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to register');
      }

      // After backend creates Firebase user, sign in to get the user object
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      return userCredential.user;
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(['firebase-user'], user);
      await queryClient.invalidateQueries({ queryKey: ['firebase-user'] });
    },
  });
};

export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Step 1: Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Step 2: Get ID token
      const idToken = await user.getIdToken();
      
      // Step 3: Verify with backend
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify with backend');
      }
      
      return user;
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(['firebase-user'], user);
      await queryClient.invalidateQueries({ queryKey: ['firebase-user'] });
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
      
      // Show success toast
      import('@/components/ui/notifications').then(({ useNotifications }) => {
        const { addNotification } = useNotifications.getState();
        addNotification({
          type: 'success',
          title: 'Logged Out',
          message: 'You have been successfully logged out.',
        });
      });
    },
  });
};
