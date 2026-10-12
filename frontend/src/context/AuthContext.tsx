/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { UserProfile, RegisterCredentials } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (credentials: RegisterCredentials) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('dlt_auth_token');
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('dlt_auth_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem('dlt_auth_token');
      if (!storedToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await api.getMe();
        if (mounted) {
          setUser(currentUser);
          setToken(storedToken);
        }
      } catch (err) {
        // If stored token is invalid, clear session
        console.warn('Session verification failed, logging out:', err);
        localStorage.removeItem('dlt_auth_token');
        localStorage.removeItem('dlt_auth_user');
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.register(credentials);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('dlt_auth_token');
      localStorage.removeItem('dlt_auth_user');
    }
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    if (user) {
      const nextUser = { ...user, ...updated };
      setUser(nextUser);
      localStorage.setItem('dlt_auth_user', JSON.stringify(nextUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
