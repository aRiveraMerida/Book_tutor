'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { login as apiLogin, logout as apiLogout, getAccessToken, setAccessToken, getCurrentUser } from '@/lib/api';

type UserRole = 'admin' | 'user';

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      const authCookie = Cookies.get('auth');
      
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch {
          // Token invalid, clear it
          setAccessToken(null);
          Cookies.remove('auth');
          setIsAuthenticated(false);
        }
      } else if (authCookie === 'true') {
        // Legacy auth - keep for backwards compatibility
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try backend JWT login first
      const response = await apiLogin(username, password);
      
      setUser({
        id: username,
        username: response.username,
        role: response.role as UserRole,
      });
      setIsAuthenticated(true);
      Cookies.set('auth', 'true', { expires: 7 });
      
      return true;
    } catch {
      // Fallback to legacy auth for demo
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          Cookies.set('auth', 'true', { expires: 7 });
          setIsAuthenticated(true);
          setUser({ id: username, username, role: 'user' });
          return true;
        }
      } catch {
        // Both failed
      }
      return false;
    }
  };

  const logout = () => {
    apiLogout();
    Cookies.remove('auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, isLoading }}>
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
