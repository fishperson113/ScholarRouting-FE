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
import { RoleSelectionDialog } from './role-selection-dialog';
import { auth, db } from '@/lib/firebase';
import { getRedirectPath, isAdmin } from '@/lib/authorization';

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
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    // Check if user is admin - skip role selection and navigate directly
    if (isAdmin(currentUser)) {
      const redirectPath = getRedirectPath(currentUser);
      navigate(redirectPath, { replace: true });
      onSuccess?.();
      return;
    }
    
    // For regular users, check if they have a role saved
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      if (!userData?.role) {
        // Show role selection for users without a role
        setShowRoleSelection(true);
      } else {
        // Navigate to scholarships for users with existing role
        const redirectPath = getRedirectPath(currentUser);
        navigate(redirectPath, { replace: true });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // On error, show role selection to be safe
      setShowRoleSelection(true);
    }
  };

  const handleRoleSelect = async (role: string) => {
    console.log('User selected role:', role);
    
    // Save role to user profile in Firestore
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { role, roleSelectedAt: new Date().toISOString() },
          { merge: true }
        );
        console.log('Role saved successfully');
      } catch (error) {
        console.error('Error saving role:', error);
      }
    }
    
    // Navigate based on user role
    const redirectPath = getRedirectPath(currentUser);
    navigate(redirectPath, { replace: true });
    
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