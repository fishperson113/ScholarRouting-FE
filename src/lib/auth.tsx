import { Navigate, useLocation } from 'react-router';
import { z } from 'zod';

import { paths } from '@/config/paths';
import { useFirebaseUser, useFirebaseLogout } from './firebase-auth';

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

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const location = useLocation();

  if (!user.data) {
    return (
      <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
    );
  }

  return children;
};
