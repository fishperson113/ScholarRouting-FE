import { FirebaseError } from 'firebase/app';

interface AuthError {
  title: string;
  message: string;
}

// Map Firebase auth error codes to user-friendly messages
export const parseFirebaseAuthError = (error: unknown): AuthError => {
  if (error instanceof FirebaseError) {
    const errorMessages: Record<string, AuthError> = {
      'auth/email-already-in-use': {
        title: 'Email Already Registered',
        message: 'An account with this email already exists. Please log in instead.',
      },
      'auth/invalid-email': {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
      },
      'auth/operation-not-allowed': {
        title: 'Operation Not Allowed',
        message: 'This sign-in method is not enabled. Please contact support.',
      },
      'auth/weak-password': {
        title: 'Weak Password',
        message: 'Password should be at least 6 characters long.',
      },
      'auth/user-disabled': {
        title: 'Account Disabled',
        message: 'This account has been disabled. Please contact support.',
      },
      'auth/user-not-found': {
        title: 'User Not Found',
        message: 'No account found with this email. Please sign up first.',
      },
      'auth/wrong-password': {
        title: 'Incorrect Password',
        message: 'The password you entered is incorrect. Please try again.',
      },
      'auth/invalid-credential': {
        title: 'Invalid Credentials',
        message: 'The email or password is incorrect. Please try again.',
      },
      'auth/too-many-requests': {
        title: 'Too Many Attempts',
        message: 'Too many failed login attempts. Please try again later.',
      },
      'auth/network-request-failed': {
        title: 'Network Error',
        message: 'Unable to connect. Please check your internet connection.',
      },
      'auth/popup-closed-by-user': {
        title: 'Sign-In Cancelled',
        message: 'The sign-in popup was closed before completing.',
      },
      'auth/cancelled-popup-request': {
        title: 'Sign-In Cancelled',
        message: 'Only one popup request is allowed at a time.',
      },
      'auth/popup-blocked': {
        title: 'Popup Blocked',
        message: 'The sign-in popup was blocked by your browser. Please allow popups.',
      },
      'auth/account-exists-with-different-credential': {
        title: 'Account Exists',
        message: 'An account already exists with this email using a different sign-in method.',
      },
    };

    const errorInfo = errorMessages[error.code];
    if (errorInfo) {
      return errorInfo;
    }

    // Return error code and message if not in our mapping
    return {
      title: 'Authentication Error',
      message: error.message || 'An error occurred during authentication.',
    };
  }

  // Generic error fallback
  return {
    title: 'Error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  };
};
