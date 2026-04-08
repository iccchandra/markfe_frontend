// ============================================
// pages/Login/Login.tsx — Real Login Form with Role-Based Redirect
// ============================================
import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Warehouse, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth, getPostLoginPath } from '../../contexts/AuthContext';

export const MarkfedLogin: React.FC = () => {
  const { isAuthenticated, loading: authLoading, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname;

  // Already authenticated — redirect
  if (isAuthenticated && user) {
    const target = from || getPostLoginPath(user.role);
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login({ email: email.trim(), password });
      const target = from || getPostLoginPath(loggedInUser.role);
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">TG MARKFED</h1>
          <p className="text-sm text-gray-600">Telangana Cooperative Marketing Federation Ltd.</p>
          <p className="text-gray-500 text-xs mt-1">Maize MSP Data Entry Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials to access the portal</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@markfed.telangana.gov.in"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                disabled={submitting}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Role Info */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 text-center border border-gray-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">AO/CAO</p>
            <p className="text-[10px] text-gray-400">Loan & Drawdowns</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 text-center border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">District Manager</p>
            <p className="text-[10px] text-gray-400">Utilization & Farmers</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 text-center border border-gray-200">
            <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">MD</p>
            <p className="text-[10px] text-gray-400">Dashboard & Reports</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-3 text-center border border-gray-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mb-1" />
            <p className="text-xs text-gray-600 font-medium">Super Admin</p>
            <p className="text-[10px] text-gray-400">Full Access</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          G.O No. 558 | Vanakalam 2025-26 | Maize MSP @ Rs.2400/Qtl
        </p>
      </div>
    </div>
  );
};

export default MarkfedLogin;
