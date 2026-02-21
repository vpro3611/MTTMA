import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '../api/auth';
import { setAccessToken } from '../api/client';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refreshSession = useCallback(async () => {
    try {
      await authApi.refresh();
      const stored = sessionStorage.getItem('user');
      const user: User | null = stored ? JSON.parse(stored) : null;
      setState((s) => ({ ...s, user, loading: false }));
    } catch {
      setAccessToken(null);
      sessionStorage.removeItem('user');
      setState((s) => ({ ...s, user: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const { user } = await authApi.login({ email, password });
      sessionStorage.setItem('user', JSON.stringify(user));
      setState((s) => ({ ...s, user, loading: false, error: null }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : 'Login failed',
      }));
      throw e;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const { user } = await authApi.register({ email, password });
      sessionStorage.setItem('user', JSON.stringify(user));
      setState((s) => ({ ...s, user, loading: false, error: null }));
    } catch (e) {
      setState((s) => ({
        ...s,
        error: e instanceof Error ? e.message : 'Registration failed',
      }));
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, error: null }));
    try {
      await authApi.logout();
    } finally {
      sessionStorage.removeItem('user');
      setState((s) => ({ ...s, user: null }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const updateUser = useCallback((user: User) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
