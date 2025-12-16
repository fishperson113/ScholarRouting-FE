import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCustomToken,
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

// Guest session type
interface GuestSession {
  guest_token: string;
  uid: string;
  expires_at: string;
  is_anonymous: boolean;
  display_name: string;
}

// Create a guest user object from session
const createGuestUser = (session: GuestSession): FirebaseUser => {
  return {
    uid: session.uid,
    displayName: session.display_name,
    email: null,
    emailVerified: false,
    isAnonymous: true,
    metadata: {},
    providerData: [],
    refreshToken: session.guest_token,
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => session.guest_token,
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    photoURL: null,
    providerId: 'guest',
  } as FirebaseUser;
};

export const useAnonymousSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Step 1: Create guest session via backend
      const response = await fetch(`${API_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create guest session');
      }
      
      const session: GuestSession = await response.json();
      
      // Step 2: Store in localStorage with expiration
      localStorage.setItem('guest_session', JSON.stringify(session));
      
      // Step 3: Create a guest user object
      const guestUser = createGuestUser(session);
      
      return guestUser;
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(['firebase-user'], user);
      await queryClient.invalidateQueries({ queryKey: ['firebase-user'] });
    },
  });
};

// Extended Firebase User type with custom properties
export type ExtendedFirebaseUser = FirebaseUser & {
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'USER';
  bio?: string;
  id?: string;
};

export const useFirebaseUser = () => {
  return useQuery({
    queryKey: ['firebase-user'],
    queryFn: () => new Promise<ExtendedFirebaseUser | null>((resolve) => {
      // Check for guest session first
      const guestSessionStr = localStorage.getItem('guest_session');
      if (guestSessionStr) {
        try {
          const session: GuestSession = JSON.parse(guestSessionStr);
          const expiresAt = new Date(session.expires_at);
          
          // Check if session is still valid
          if (expiresAt > new Date()) {
            const guestUser = createGuestUser(session);
            resolve(guestUser as ExtendedFirebaseUser);
            return;
          } else {
            // Session expired, remove it
            localStorage.removeItem('guest_session');
          }
        } catch (error) {
          console.error('Failed to parse guest session:', error);
          localStorage.removeItem('guest_session');
        }
      }
      
      // Wait for Firebase to restore the session
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // Don't unsubscribe immediately - let it complete auth state restoration
        resolve(user as ExtendedFirebaseUser | null);
        unsubscribe();
      });
    }),
    staleTime: Infinity,
    // Prevent refetching while user is logged in
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
      // Clear guest session if exists
      localStorage.removeItem('guest_session');
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
