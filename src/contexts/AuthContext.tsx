// ============================================
// contexts/AuthContext.tsx — JWT Auth with Role-Based Access
// ============================================
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserRole } from '../types/markfed';
import { authAPI } from '../api/services';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  district_id: number | null;
  district_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  canEditField: (fieldGroup: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based redirect paths
export function getPostLoginPath(role: UserRole): string {
  switch (role) {
    case UserRole.MD:
      return '/dashboard';
    case UserRole.AO_CAO:
      return '/data-entry/loan';
    case UserRole.DM:
      return '/data-entry/utilization';
    case UserRole.SUPER_ADMIN:
    default:
      return '/dashboard';
  }
}

export const MarkfedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('markfed_access_token');
        const savedUser = localStorage.getItem('markfed_user');

        if (token && savedUser) {
          // Try to validate token with backend
          try {
            const { data } = await authAPI.me();
            const authUser: AuthUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role as UserRole,
              district_id: data.district_id,
              district_name: data.district_name,
              is_active: data.is_active,
            };
            setUser(authUser);
            localStorage.setItem('markfed_user', JSON.stringify(authUser));
          } catch {
            // Token invalid or backend unreachable — use cached user for offline dev
            const cached = JSON.parse(savedUser) as AuthUser;
            setUser(cached);
          }
        }
      } catch {
        // No valid session
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }): Promise<AuthUser> => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials.email, credentials.password);

      localStorage.setItem('markfed_access_token', data.access_token);
      localStorage.setItem('markfed_refresh_token', data.refresh_token);

      const authUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as UserRole,
        district_id: data.user.district_id,
        district_name: data.user.district_name,
        is_active: data.user.is_active,
      };

      setUser(authUser);
      localStorage.setItem('markfed_user', JSON.stringify(authUser));
      return authUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem('markfed_access_token');
    localStorage.removeItem('markfed_refresh_token');
    localStorage.removeItem('markfed_user');
    window.location.href = (process.env.PUBLIC_URL || '') + '/login';
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => !!user && roles.includes(user.role),
    [user]
  );

  const canEditField = useCallback(
    (fieldGroup: string): boolean => {
      if (!user) return false;
      if (user.role === UserRole.SUPER_ADMIN) return true;

      switch (fieldGroup) {
        case 'loan_sanction':    // cols 1-8
        case 'drawdowns':        // cols 9-13
          return user.role === UserRole.AO_CAO;
        case 'utilization':      // cols 14-26
        case 'farmers':          // cols 27-37
          return user.role === UserRole.DM;
        default:
          return false;
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, logout, hasRole, canEditField }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a MarkfedAuthProvider');
  }
  return context;
};

export default MarkfedAuthProvider;
