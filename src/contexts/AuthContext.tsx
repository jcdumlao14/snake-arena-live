import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthCredentials } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  signup: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    api.auth.getCurrentUser().then(user => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = async (credentials: AuthCredentials) => {
    const { user } = await api.auth.login(credentials);
    setUser(user);
  };

  const signup = async (credentials: AuthCredentials) => {
    const { user } = await api.auth.signup(credentials);
    setUser(user);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
