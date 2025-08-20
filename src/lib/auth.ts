import React from 'react';
import { User } from '@/types';

// Authentication state management
class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;
  private token: string | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeAuth() {
    // Check for existing token on app load
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('tripme_token') || sessionStorage.getItem('tripme_token');
      if (this.token) {
        this.validateToken();
      } else {
        // If no token, notify listeners immediately to stop loading
        this.notifyListeners();
      }
    } else {
      // Server-side, notify listeners immediately
      this.notifyListeners();
    }
  }

  private async validateToken() {
    try {
      // TODO: Implement token validation with backend
      // const response = await apiClient.validateToken();
      // this.user = response.data.user;
      
      // For now, simulate a user with the token
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'guest',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.user = mockUser;
      this.notifyListeners();
    } catch (error) {
      this.logout();
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    try {
      // TODO: Implement actual login API call
      // const response = await apiClient.login(email, password);
      
      // Simulate successful login for now
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'guest',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      
      this.user = mockUser;
      this.token = mockToken;

      // Store token based on remember me preference
      if (rememberMe) {
        localStorage.setItem('tripme_token', mockToken);
      } else {
        sessionStorage.setItem('tripme_token', mockToken);
      }

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async signup(userData: { name: string; email: string; password: string; phone?: string }): Promise<boolean> {
    try {
      // TODO: Implement actual signup API call
      // const response = await apiClient.signup(userData);
      
      // Simulate successful signup for now
      const mockUser: User = {
        id: '1',
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'guest',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token-' + Date.now();
      
      this.user = mockUser;
      this.token = mockToken;
      localStorage.setItem('tripme_token', mockToken);

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  }

  logout(): void {
    this.user = null;
    this.token = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tripme_token');
      sessionStorage.removeItem('tripme_token');
    }

    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  isHost(): boolean {
    return this.user?.role === 'host';
  }

  // Observer pattern for auth state changes
  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user));
  }
}

export const authManager = AuthManager.getInstance();

// React hook for authentication
export function useAuth() {
  const [user, setUser] = React.useState<User | null>(authManager.getCurrentUser());
  const [loading, setLoading] = React.useState(() => {
    // If there's no token, we're not loading
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('tripme_token') || sessionStorage.getItem('tripme_token')
      : null;
    const isLoading = !!token; // Only loading if there's a token to validate

    return isLoading;
  });

  React.useEffect(() => {
    
    const unsubscribe = authManager.subscribe((user) => {
      
      setUser(user);
      setLoading(false);
    });

    // If there's no token, set loading to false immediately
    if (!authManager.getToken()) {

      setLoading(false);
    }

    return unsubscribe;
  }, []);

  const result = {
    user,
    loading,
    isAuthenticated: authManager.isAuthenticated(),
    isHost: authManager.isHost(),
    login: authManager.login.bind(authManager),
    signup: authManager.signup.bind(authManager),
    logout: authManager.logout.bind(authManager),
  };



  return result;
} 