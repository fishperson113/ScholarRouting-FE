import * as React from 'react';
import { User as FirebaseUser } from 'firebase/auth';

import { useUser } from './auth';

export enum ROLES {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

type RoleTypes = keyof typeof ROLES;

// For now, all Firebase users are regular users
// You can extend this later with custom claims or backend roles
const getUserRole = (user: FirebaseUser | null): RoleTypes => {
  // TODO: Get role from custom claims or your backend
  // const customClaims = await user.getIdTokenResult();
  // return customClaims.claims.role as RoleTypes;
  return 'USER';
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
