import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/ui/icons/google-icon';

type GoogleSignInButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  text?: string;
};

export const GoogleSignInButton = ({ 
  onClick, 
  isLoading, 
  text = 'Sign in with Google' 
}: GoogleSignInButtonProps) => (
  <Button
    type="button"
    variant="outline"
    className="w-full"
    onClick={onClick}
    isLoading={isLoading}
    disabled={isLoading}
    icon={<GoogleIcon />}
  >
    {text}
  </Button>
);
