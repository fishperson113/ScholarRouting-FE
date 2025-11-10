import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';

type AuthDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
};

export const AuthDialog = ({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthDialogProps) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const navigate = useNavigate();

  // Reset mode when dialog opens with new defaultMode
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const handleSuccess = (loginMethod?: 'google' | 'email') => {
    console.log('Auth success with method:', loginMethod);
    
    // Always close the dialog first
    onClose();
    
    if (loginMethod === 'email') {
      // For email login, navigate to scholarships
      console.log('Email login success - navigating to scholarships');
      navigate(paths.app.scholarships.getHref());
    }
    // For Google login, we don't navigate - the parent component will handle the UI updates
};

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'login' ? 'Log in to your account' : 'Create your account'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {mode === 'login' ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={switchMode}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={switchMode}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};