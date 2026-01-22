import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginError {
  message: string;
  field?: 'email' | 'password' | 'general';
}

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: 'admin@telangana.gov.in',
    password: 'admin123',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [showDemo, setShowDemo] = useState(true);
  
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();

  // Get the intended destination or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // MOVED: Load remembered email on component mount - BEFORE any conditional returns
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remember_user');
    if (rememberedEmail) {
      setFormData(prev => ({ 
        ...prev, 
        email: rememberedEmail, 
        rememberMe: true 
      }));
    }
  }, []);

  // NOW it's safe to have conditional returns after all hooks are called
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Show loading spinner during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError({ message: 'Email is required', field: 'email' });
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setError({ message: 'Please enter a valid email address', field: 'email' });
      return false;
    }
    
    if (!formData.password) {
      setError({ message: 'Password is required', field: 'password' });
      return false;
    }
    
    if (formData.password.length < 6) {
      setError({ message: 'Password must be at least 6 characters', field: 'password' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Remember me functionality
      if (formData.rememberMe) {
        localStorage.setItem('remember_user', formData.email);
      } else {
        localStorage.removeItem('remember_user');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError({ 
          message: 'Invalid email or password. Please try again.', 
          field: 'general' 
        });
      } else if (err.response?.status === 429) {
        setError({ 
          message: 'Too many login attempts. Please try again later.', 
          field: 'general' 
        });
      } else if (err.response?.status === 403) {
        setError({ 
          message: 'Your account has been suspended. Please contact administrator.', 
          field: 'general' 
        });
      } else if (err.code === 'NETWORK_ERROR') {
        setError({ 
          message: 'Network error. Please check your connection and try again.', 
          field: 'general' 
        });
      } else {
        setError({ 
          message: err.response?.data?.message || 'Login failed. Please try again.', 
          field: 'general' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error && error.field === field) {
      setError(null);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'editor' | 'viewer') => {
    const credentials = {
      admin: { email: 'admin@telangana.gov.in', password: 'admin123' },
      editor: { email: 'editor@telangana.gov.in', password: 'editor123' },
      viewer: { email: 'viewer@telangana.gov.in', password: 'viewer123' },
    };
    
    setFormData(prev => ({
      ...prev,
      ...credentials[role],
    }));
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                className="h-16 w-16 rounded-full shadow-lg"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23e74c3c'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3ETS%3C/text%3E%3C/svg%3E"
                alt="Telangana Logo"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Indiramma Illu
          </h2>
          <p className="text-gray-600 text-sm">
          Housing for All Initiative
          </p>
          <div className="mt-2 flex items-center justify-center">
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </div>
        </div>

 

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="Enter your email"
                error={error?.field === 'email' ? error.message : undefined}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                placeholder="Enter your password"
                error={error?.field === 'password' ? error.message : undefined}
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => updateFormData('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                  disabled={loading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle forgot password
                    alert('Forgot password functionality not implemented in demo');
                  }}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* General Error Message */}
            {error && error.field === 'general' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-800">{error.message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              fullWidth
              size="lg"
              className="relative overflow-hidden"
            >
              <span className="relative z-10">
                {loading ? 'Signing in...' : 'Sign in to Dashboard'}
              </span>
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 Government of Telangana. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
          </div>
        </div>

        {/* System Status */}
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            All systems operational
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;