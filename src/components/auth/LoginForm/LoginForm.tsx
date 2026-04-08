import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { Warehouse, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('admin@markfed.telangana.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          {/* Logo and Header */}
          <div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 transform hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-3xl">M</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Warehouse className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MARKFED Telangana
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 font-medium">
              Integrated Management System
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
          
          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@markfed.telangana.gov.in"
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="pl-10"
                />
                <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign in to Dashboard'}
            </Button>
          </form>

          {/* Quick Login Hint */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 text-center font-medium mb-2">
                👤 Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded px-3 py-2 border border-gray-200">
                  <span className="text-gray-500">Email:</span>
                  <p className="font-mono text-gray-700 truncate">admin@markfed...</p>
                </div>
                <div className="bg-white rounded px-3 py-2 border border-gray-200">
                  <span className="text-gray-500">Password:</span>
                  <p className="font-mono text-gray-700">admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            © 2026 MARKFED Telangana. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
          </div>
        </div>

        {/* Module Access Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">System Modules</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Transportation</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Gunny Bags</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">Storage</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Release Orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;