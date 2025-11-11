import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { registerInputSchema } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { AuthDivider } from './auth-divider';
import { GoogleSignInButton } from './google-signin-button';

type RegisterFormProps = {
  onSuccess?: (method?: 'google' | 'email') => void;
  redirectTo?: string | null;
};

export const RegisterForm = ({ onSuccess, redirectTo }: RegisterFormProps = {}) => {
  const { register: registerUser, loginWithGoogle, isLoading } = useAuth({ redirectTo, onSuccess });

  return (
    <div>
      <Form onSubmit={registerUser} schema={registerInputSchema}>
        {({ register, formState }) => (
          <>
            <Input
              type="text"
              label="First Name"
              error={formState.errors['firstName']}
              registration={register('firstName')}
            />
            <Input
              type="text"
              label="Last Name"
              error={formState.errors['lastName']}
              registration={register('lastName')}
            />
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
                Register
              </Button>
            </div>
          </>
        )}
      </Form>

      <AuthDivider />
      <GoogleSignInButton 
        onClick={loginWithGoogle} 
        isLoading={isLoading}
        text="Sign up with Google"
      />
    </div>
  );
};
