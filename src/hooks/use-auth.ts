import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { 
  useFirebaseLogin, 
  useFirebaseRegister,
  useGoogleSignIn,
  useAnonymousSignIn
} from '@/lib/firebase-auth';
import { LoginInput, RegisterInput } from '@/lib/auth';
import { useToast } from './use-toast';
import { parseFirebaseAuthError } from '@/utils/firebase-errors';

type UseAuthOptions = {
  redirectTo?: string | null;
  onSuccess?: (method?: 'google' | 'email') => void;
};

export const useAuth = (options?: UseAuthOptions) => {
  const navigate = useNavigate();
  const firebaseLogin = useFirebaseLogin();
  const firebaseRegister = useFirebaseRegister();
  const googleSignIn = useGoogleSignIn();
  const anonymousSignIn = useAnonymousSignIn();
  const { success, error } = useToast();

  const { redirectTo, onSuccess } = options || {};

  const handleSuccess = (method?: 'google' | 'email') => {
    if (onSuccess) {
      onSuccess(method);
    } else {
      const destination = redirectTo || paths.app.scholarships.getHref();
      navigate(destination, { replace: true });
    }
  };

  const login = async (data: LoginInput) => {
    try {
      await firebaseLogin.mutateAsync(data);
      success({
        title: 'Welcome back!',
        message: 'You have successfully logged in.',
      });
      handleSuccess('email');
    } catch (err) {
      const { title, message } = parseFirebaseAuthError(err);
      error({ title, message });
      throw err;
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      await firebaseRegister.mutateAsync(data);
      success({
        title: 'Registration Successful!',
        message: 'Your account has been created successfully.',
      });
      handleSuccess('email');
    } catch (err) {
      const { title, message } = parseFirebaseAuthError(err);
      error({ title, message });
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await googleSignIn.mutateAsync();
      success({
        title: 'Welcome!',
        message: 'You have successfully signed in with Google.',
      });
      handleSuccess('google');
    } catch (err) {
      const { title, message } = parseFirebaseAuthError(err);
      error({ title, message });
      throw err;
    }
  };

  const continueAsGuest = async () => {
    try {
      await anonymousSignIn.mutateAsync();
      success({
        title: 'Welcome, Guest!',
        message: 'You can browse and use features without an account.',
      });
      handleSuccess();
    } catch (err) {
      const { title, message } = parseFirebaseAuthError(err);
      error({ title, message });
      throw err;
    }
  };

  return {
    login,
    register,
    loginWithGoogle,
    continueAsGuest,
    isLoading: firebaseLogin.isPending || firebaseRegister.isPending || googleSignIn.isPending || anonymousSignIn.isPending,
  };
};
