import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../shared';
import { isAdmin } from '../../utils/rolePermissions';

/**
 * Private route wrapper component
 * Protects routes requiring authentication and optionally specific roles
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {string[]} [props.roles] - Optional array of allowed roles
 * @param {string} [props.requiredRole] - Optional single required role (e.g., 'admin')
 */
export default function PrivateRoute({ children, roles, requiredRole }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0 && !roles.includes(role)) {
    // User doesn't have required role - redirect to farm overview
    return <Navigate to="/farm-overview" replace />;
  }

  // Check single requiredRole (e.g., 'admin')
  if (requiredRole === 'admin' && !isAdmin(role)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">You don't have permission to access this page.</p>
          <a href="/farm-overview" className="text-blue-400 hover:text-blue-300">← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return children;
}
