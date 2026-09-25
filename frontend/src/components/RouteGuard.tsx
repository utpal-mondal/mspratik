import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import usePermission from '../hook/usePermission';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAny?: boolean; // If true, user needs at least one permission. If false, needs all
}

const RouteGuard = ({ children, requiredPermissions = [], requireAny = true }: RouteGuardProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { canAccess } = usePermission();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (requiredPermissions.length === 0) {
      return; // No permissions required, allow access
    }

    // Special handling for is_cadmin check
    if (requiredPermissions.includes('is_cadmin')) {
      if (user.is_cadmin !== '1') {
        router.push('/dashboard');
        return;
      }
      return; // User is cadmin, allow access
    }

    const hasAccess = requireAny
      ? requiredPermissions.some(permission => canAccess(permission))
      : requiredPermissions.every(permission => canAccess(permission));

    if (!hasAccess) {
      router.push('/dashboard'); // Redirect to dashboard if no access
    }
  }, [user, requiredPermissions, requireAny, canAccess, router]);

  // Check if user has access before rendering
  if (!user) {
    return null;
  }

  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Special handling for is_cadmin check
  if (requiredPermissions.includes('is_cadmin')) {
    if (user.is_cadmin !== '1') {
      return null; // Will redirect in useEffect
    }
    return <>{children}</>;
  }

  const hasAccess = requireAny
    ? requiredPermissions.some(permission => canAccess(permission))
    : requiredPermissions.every(permission => canAccess(permission));

  if (!hasAccess) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default RouteGuard;
