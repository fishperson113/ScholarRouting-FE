import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { loginInputSchema } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { AuthDivider } from './auth-divider';
import { GoogleSignInButton } from './google-signin-button';

type LoginFormProps = {
  onSuccess?: (method?: 'google' | 'email') => void;
  redirectTo?: string | null;
};

export const LoginForm = ({ onSuccess, redirectTo }: LoginFormProps = {}) => {
  const { login, loginWithGoogle, isLoading } = useAuth({ redirectTo, onSuccess });

  return (
    <div>
      <Form onSubmit={login} schema={loginInputSchema}>
        {({ register, formState }) => (
          <>
            <Input
              type="email"
              label="Email Address"
              error={formState.errors['email']}
              registration={register('email')}
            />
            <Input
              type="password"
              label="Password"
              error={formState.errors['password']}
              registration={register('password')}
            />
            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Log in
              </Button>
            </div>
          </>
        )}
      </Form>

      <AuthDivider />
      <GoogleSignInButton 
        onClick={loginWithGoogle} 
        isLoading={isLoading}
        text="Sign in with Google"
      />
    </div>
  );
};
