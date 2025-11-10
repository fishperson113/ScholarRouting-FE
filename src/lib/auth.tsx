import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import { paths } from '@/config/paths';
import { useFirebaseUser, useFirebaseLogout } from './firebase-auth';
import { auth } from './firebase';

// Simplified auth without backend - ready for your custom backend later

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required').min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

// Use Firebase hooks
export const useUser = useFirebaseUser;
export const useLogout = useFirebaseLogout;

// Google Sign In with Backend API
export const useGoogleLoginWithAPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        console.log('Step 1: Starting Google sign-in with Firebase...');
        // Step 1: Sign in with Google using Firebase
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('Step 1 completed: Firebase user:', user.email);
        
        // Step 2: Get the ID token from Firebase
        console.log('Step 2: Getting ID token...');
        const idToken = await user.getIdToken();
        console.log('Step 2 completed: ID token obtained');
        
        // Step 3: Send the token to your backend API
        console.log('Step 3: Sending to backend API...');
        const apiUrl = `${import.meta.env.VITE_APP_API_URL}/auth/verify`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: idToken,
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          }),
        });

        console.log('Backend response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error response:', errorText);
          throw new Error(`Failed to verify with backend: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Step 3 completed: Backend response:', data);
        return { user, backendData: data };
      } catch (error) {
        console.error('Google login error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('Google login success, updating cache...');
      // Update the React Query cache with the Firebase user
      queryClient.setQueryData(['firebase-user'], result.user);
    },
  });
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  if (!user.data) {
    return (
      <Navigate to={paths.home.getHref()} replace />
    );
  }

  return children;
};
