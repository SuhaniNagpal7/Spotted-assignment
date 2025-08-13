"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authApi, getAuthToken, setAuthToken, removeAuthToken, getStoredUser, setStoredUser } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing auth token on mount
  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getStoredUser();
    
    if (token && storedUser) {
      setUser(storedUser);
      // Verify token is still valid
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      if (response.success) {
        const { user: userData, token } = response.data;
        setAuthToken(token);
        setStoredUser(userData);
        setUser(userData);
        toast.success('Login successful!');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.register({ email, password, name, phone });
      
      if (response.success) {
        const { user: userData, token } = response.data;
        setAuthToken(token);
        setStoredUser(userData);
        setUser(userData);
        toast.success('Registration successful!');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      if (response.success && response.data) {
        setStoredUser(response.data.user);
        setUser(response.data.user);
      } else {
        // Token might be invalid
        logout();
      }
    } catch (error) {
      // Token might be invalid or expired
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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