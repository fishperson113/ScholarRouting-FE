import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { paths } from '@/config/paths';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { RoleSelectionDialog } from './role-selection-dialog';

type AuthDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
};

export const AuthDialog = ({ isOpen, onClose, defaultMode = 'login', onSuccess }: AuthDialogProps) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
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
    
    // Show role selection dialog
    setShowRoleSelection(true);
  };

  const handleRoleSelect = (role: string) => {
    console.log('User selected role:', role);
    // TODO: Save role to user profile in Firestore
    
    // Navigate to scholarships page
    navigate(paths.app.scholarships.getHref(), { replace: true });
    
    // Call parent's onSuccess if provided
    onSuccess?.();
  };

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
        </DialogContent>
      </Dialog>

      <RoleSelectionDialog
        isOpen={showRoleSelection}
        onClose={() => setShowRoleSelection(false)}
        onRoleSelect={handleRoleSelect}
      />
    </>
  );
};