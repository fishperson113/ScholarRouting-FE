import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { 
  useFirebaseLogin, 
  useFirebaseRegister,
  useGoogleSignIn 
} from '@/lib/firebase-auth';
import { LoginInput, RegisterInput } from '@/lib/auth';

type UseAuthOptions = {
  redirectTo?: string | null;
  onSuccess?: (method?: 'google' | 'email') => void;
};

export const useAuth = (options?: UseAuthOptions) => {
  const navigate = useNavigate();
  const firebaseLogin = useFirebaseLogin();
  const firebaseRegister = useFirebaseRegister();
  const googleSignIn = useGoogleSignIn();

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
    await firebaseLogin.mutateAsync(data);
    handleSuccess('email');
  };

  const register = async (data: RegisterInput) => {
    await firebaseRegister.mutateAsync(data);
    handleSuccess('email');
  };

  const loginWithGoogle = async () => {
    await googleSignIn.mutateAsync();
    handleSuccess('google');
  };

  return {
    login,
    register,
    loginWithGoogle,
    isLoading: firebaseLogin.isPending || firebaseRegister.isPending || googleSignIn.isPending,
  };
};
