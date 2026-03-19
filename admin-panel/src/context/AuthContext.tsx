import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Admin } from '../types';
import * as authApi from '../api/auth';

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);

function readStoredAdmin(): Admin | null {
  try {
    const stored = localStorage.getItem('admin_user');
    return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(readStoredAdmin);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));

  // isLoading only when we have a token but no cached user (need to fetch admin info)
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('admin_token') && !readStoredAdmin();
  });

  // On mount: only call getMe if we have a token but no cached admin data
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    const cachedAdmin = readStoredAdmin();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // We already have both token and cached admin — no need to refetch
    if (cachedAdmin) {
      setIsLoading(false);
      return;
    }

    // Token exists but no cached admin — fetch from server
    authApi
      .getMe()
      .then((me) => {
        setAdmin(me);
        localStorage.setItem('admin_user', JSON.stringify(me));
      })
      .catch(() => {
        // 401s are already handled by the axios interceptor (redirects to /login)
        // Only clear state for other errors if token is also gone
        if (!localStorage.getItem('admin_token')) {
          setAdmin(null);
          setToken(null);
        }
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    localStorage.setItem('admin_token', res.token);
    localStorage.setItem('admin_user', JSON.stringify(res.admin));
    setToken(res.token);
    setAdmin(res.admin);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
