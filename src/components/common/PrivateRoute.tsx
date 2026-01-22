import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = false 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your health data...</h2>
          <p className="text-gray-600">Please wait while we prepare your AI companion</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 

  // If user is authenticated but trying to access auth pages, redirect to app
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

// Higher-order component version for class components or when you need a HOC
export const withPrivateRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PrivateRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <PrivateRoute {...options}>
      <Component {...props} />
    </PrivateRoute>
  );
};

export default PrivateRoute;