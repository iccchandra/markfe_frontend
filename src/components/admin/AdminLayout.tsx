// ============================================
// components/AdminLayout.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="mb-2">
            <img src={process.env.PUBLIC_URL + "/markfed-logo.png"} alt="TG MARKFED" className="w-16 h-16 object-contain mx-auto mb-3" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Loading MARKFED...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // All portal roles are authorized
  const authorizedRoles = ['super_admin', 'md', 'ao_cao', 'dm', 'admin', 'manager', 'district_manager', 'accountant'];
  // Logs out the user and redirects to login page
  const logout = (): void => {
    if (typeof window !== 'undefined') {
      // Clear localStorage/sessionStorage if used for auth
      localStorage.clear();
      sessionStorage.clear();
      // Optionally, call an auth context logout if available
      if (typeof window.location !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };
  if (user && !authorizedRoles.includes(user.role)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the MARKFED admin panel.
            Please contact your system administrator.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30"
            >
              Go Back
            </button>
            <button
              onClick={() => logout()}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>

        {/* Footer (Optional) */}
        <footer className="bg-white border-t border-gray-200 py-2 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-1">
            <div>© 2026 MARKFED Telangana</div>
            <div className="hidden sm:flex items-center gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Alternative Grid Layout (if flex doesn't work)
export const MarkfedGridLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="mb-2">
            <img src={process.env.PUBLIC_URL + "/markfed-logo.png"} alt="TG MARKFED" className="w-16 h-16 object-contain mx-auto mb-3" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Loading MARKFED...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen grid lg:grid-cols-[256px_1fr] bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar isOpen={true} onClose={() => {}} />
      </div>
      
      {/* Sidebar - Mobile */}
      <div className="lg:hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-2 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-1">
            <div>© 2026 MARKFED Telangana</div>
            <div className="hidden sm:flex items-center gap-4">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;