import * as React from 'react';
import { User as FirebaseUser } from 'firebase/auth';

import { useUser } from './auth';
import { env } from '@/config/env';
import { paths } from '@/config/paths';

export enum ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

type RoleTypes = keyof typeof ROLES;

// Check if user email matches the hardcoded admin email
const getUserRole = (user: FirebaseUser | null): RoleTypes => {
  if (!user) return 'USER';
  
  // Check if user's email matches the admin email
  if (user.email === env.ADMIN_EMAIL) {
    return 'ADMIN';
  }
  
  return 'USER';
};

// Check if user is an admin
export const isAdmin = (user: FirebaseUser | null): boolean => {
  return getUserRole(user) === 'ADMIN';
};

// Get redirect path based on user role
export const getRedirectPath = (user: FirebaseUser | null): string => {
  const role = getUserRole(user);
  
  if (role === 'ADMIN') {
    return paths.app.crm.getHref();
  }
  
  return paths.app.scholarships.getHref();
};

export const useAuthorization = () => {
  const user = useUser();

  if (!user.data) {
    throw Error('User does not exist!');
  }

  const checkAccess = React.useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (allowedRoles && allowedRoles.length > 0 && user.data) {
        const userRole = getUserRole(user.data);
        return allowedRoles?.includes(userRole);
      }

      return true;
    },
    [user.data],
  );

  return { checkAccess, role: getUserRole(user.data) };
};

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedRoles: RoleTypes[];
      policyCheck?: never;
    }
  | {
      allowedRoles?: never;
      policyCheck: boolean;
    }
);

export const Authorization = ({
  policyCheck,
  allowedRoles,
  forbiddenFallback = null,
  children,
}: AuthorizationProps) => {
  const { checkAccess } = useAuthorization();

  let canAccess = false;

  if (allowedRoles) {
    canAccess = checkAccess({ allowedRoles });
  }

  if (typeof policyCheck !== 'undefined') {
    canAccess = policyCheck;
  }

  return <>{canAccess ? children : forbiddenFallback}</>;
};
