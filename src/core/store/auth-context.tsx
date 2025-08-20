"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/shared/types';
import { authService } from '@/core/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: (force?: boolean) => Promise<void>;
  isAdmin: () => boolean;
  isHost: () => boolean;
  isGuest: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    // Initialize auth state from service
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      console.log('🔐 Auth context init - currentUser from service:', currentUser);
      console.log('🔐 Auth context init - token from service:', token ? 'exists' : 'missing');
      
      // Only set user if we have both user and token
      if (currentUser && token) {
        setUser(currentUser);
        console.log('🔐 Auth context init - user and token found, user set');
      } else {
        console.log('🔐 Auth context init - missing user or token, clearing state');
        setUser(null);
      }
      
      setIsLoading(false);
      console.log('🔐 Auth context init - loading set to false');
    };
    
    // Small delay to ensure localStorage is ready
    setTimeout(initializeAuth, 100);
  }, []);

  const login = (user: User, token: string) => {
    console.log('🔐 Auth context login called with user:', user);
    authService.setAuth(user, token);
    setUser(user);
    console.log('🔐 Auth context user state updated:', user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    authService.updateUser(updatedUser);
    setUser(updatedUser);
  };

  const refreshUser = async (force = false) => {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshing && !force) {
      return;
    }

    // Don't refresh if we already have user data and it's not forced
    if (user && !force) {
      return;
    }

    try {
      setIsRefreshing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          // Only update if the user data has actually changed
          const currentUser = authService.getCurrentUser();
          if (!currentUser || JSON.stringify(currentUser) !== JSON.stringify(data.data.user)) {
            authService.updateUser(data.data.user);
            setUser(data.data.user);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isAdmin = () => authService.isAdmin();
  const isHost = () => authService.isHost();
  const isGuest = () => authService.isGuest();

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
    isAdmin,
    isHost,
    isGuest,
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
  
  // Return a safe default during SSR
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
      refreshUser: async (force?: boolean) => {},
      isAdmin: () => false,
      isHost: () => false,
      isGuest: () => false,
    };
  }
  
  return context;
} 