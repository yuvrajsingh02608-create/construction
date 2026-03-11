import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { isAuthenticated, currentUser } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (requiredRole && currentUser?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
