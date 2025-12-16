import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { auth, db } from '@/lib/firebase';
import { getRedirectPath, isAdmin } from '@/lib/authorization';
import { useAuth } from '@/hooks/use-auth';

type AuthDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
};

export const AuthDialog = ({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthDialogProps) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Reset mode when dialog opens with new defaultMode
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const handleSuccess = async (loginMethod?: 'google' | 'email') => {
    // Close the auth dialog
    onClose();
    
    // Invalidate user query to force refetch
    await queryClient.invalidateQueries({ queryKey: ['firebase-user'] });
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    // Navigate to appropriate page based on user type
    const redirectPath = getRedirectPath(currentUser);
    navigate(redirectPath, { replace: true });
    onSuccess?.();
  };

  const { continueAsGuest, isLoading } = useAuth({ onSuccess: handleSuccess });

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <>
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

          {/* Continue as Guest Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={continueAsGuest}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating guest session...' : 'Continue as Guest'}
            </button>
            <p className="mt-2 text-xs text-center text-gray-500">
              You can browse and use the chatbot without an account. Sign in later to save your preferences.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};