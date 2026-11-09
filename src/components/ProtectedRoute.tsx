import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  /** If omitted, any signed-in user may access the route. */
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles && (!userProfile || !allowedRoles.includes(userProfile.role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
