import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { isAuthenticated, setTokens, clearTokens } from '@/lib/auth';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  tenantId: string;
  profileCompleted: boolean;
  emailVerifiedAt?: string;
  twoFactorEnabled: boolean;
  googleId?: string;
  profileVisibility: boolean;
  timezone?: string;
  dateFormat?: string;
  simulationViewMode?: string;
  showSimulationNames: boolean;
  showLinkedReports: boolean;
  emailVisibility: boolean;
  sidebarTransparent: boolean;
  notifEmail: boolean;
  notifBrowser: boolean;
  notifDesktopLevel?: string;
  notifEmailLevel?: string;
  notifAutoSubscribe: boolean;
  layoutPreference?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser | null>;
  register: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    gdprConsent: boolean;
  }) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.get<AuthUser>('/users/me');
      setUser(userData);
      // Sync layout preference from BDD to localStorage
      if (userData.layoutPreference) {
        localStorage.setItem('sim360_layout', userData.layoutPreference);
      }
      return userData;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const response = await api.post<{
        requires2FA?: boolean;
        tempToken?: string;
        tokens?: { accessToken: string; refreshToken: string };
        user?: AuthUser;
      }>('/auth/login', { email, password, rememberMe });

      // 2FA required: store temp token and redirect to verification
      if (response.requires2FA && response.tempToken) {
        sessionStorage.setItem('sim360_2fa_temp_token', response.tempToken);
        navigate('/auth/verify-2fa');
        return null;
      }

      setTokens(response.tokens!.accessToken, response.tokens!.refreshToken);
      setUser(response.user!);

      if (!response.user!.profileCompleted) {
        navigate('/profile/wizard');
      } else {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from);
      }

      return response.user!;
    },
    [navigate, location],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      gdprConsent: boolean;
    }) => {
      const { confirmPassword: _, ...payload } = data;
      const result = await api.post<{ message: string }>('/auth/register', payload);
      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore errors on logout
    }
    clearTokens();
    setUser(null);
    navigate('/auth/sign-in');
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
