import { Navigate } from 'react-router';
import { useUser } from '@/lib/auth';
import { paths } from '@/config/paths';

// Admin route guard - checks authentication and admin role
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  // Show nothing while loading to prevent flash of redirect
  if (user.isLoading) {
    return null;
  }

  // Check if user is authenticated
  if (!user.data) {
    return <Navigate to={paths.home.getHref()} replace />;
  }

  // Check if user has admin role
  // Adjust this based on your actual user object structure
  const isAdmin = (user.data as any)?.role === 'admin' || 
                  (user.data as any)?.email?.includes('admin');

  if (!isAdmin) {
    return <Navigate to={paths.app.root.getHref()} replace />;
  }

  return <>{children}</>;
};
