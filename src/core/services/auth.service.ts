import { User, AuthResponse, LoginFormData, SignupFormData } from '@/shared/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private token: string | null = null;

  private constructor() {
    this.initializeFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeFromStorage(): void {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Check for regular user token first
      const token = localStorage.getItem('tripme_token');
      const userData = localStorage.getItem('tripme_user');
      
      if (token && userData) {
        this.token = token;
        this.currentUser = JSON.parse(userData);
      } else {
        // Check for admin token
        const adminToken = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        
        if (adminToken && adminData) {
          this.token = adminToken;
          this.currentUser = JSON.parse(adminData);
        }
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      this.clearAuth();
    }
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        this.setAuth(response.data.user, response.data.token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async signup(userData: SignupFormData): Promise<AuthResponse> {
    try {
      const response = await apiClient.signup(userData);
      
      if (response.success && response.data) {
        this.setAuth(response.data.user, response.data.token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  public async googleLogin(token: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.googleLogin(token);
      
      if (response.success && response.data) {
        this.setAuth(response.data.user, response.data.token);
      }
      
      return response;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  public async adminLogin(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        // Store admin token and data
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminData', JSON.stringify(data.data.admin));
        
        // Also store in regular user storage for API client compatibility
        localStorage.setItem('tripme_token', data.data.token);
        localStorage.setItem('tripme_user', JSON.stringify(data.data.admin));
        
        // Set current auth state
        this.token = data.data.token;
        this.currentUser = data.data.admin;
      }
      
      return data;
    } catch (error: any) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  public logout(): void {
    this.clearAuth();
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUser && !!this.token;
  }

  public isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'super-admin';
  }

  public async adminLogout(): Promise<void> {
    try {
      // Call backend logout endpoint to invalidate session
      const token = this.getToken();
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.warn('Admin logout API call failed, but continuing with local logout');
        }
      }
    } catch (error) {
      console.warn('Admin logout API call failed, but continuing with local logout:', error);
    } finally {
      // Always clear local storage regardless of API call result
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      this.clearAuth();
    }
  }

  public isHost(): boolean {
    return this.currentUser?.role === 'host';
  }

  public isGuest(): boolean {
    return this.currentUser?.role === 'guest';
  }

  public updateUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripme_user', JSON.stringify(user));
    }
  }

  public setAuth(user: User, token: string): void {
    console.log('🔐 Auth service setAuth called with user:', user);
    this.currentUser = user;
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripme_token', token);
      localStorage.setItem('tripme_user', JSON.stringify(user));
      console.log('🔐 Auth service - stored in localStorage');
    }
    console.log('🔐 Auth service - current state:', { user: this.currentUser, token: this.token });
  }

  private clearAuth(): void {
    this.currentUser = null;
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tripme_token');
      localStorage.removeItem('tripme_user');
    }
  }
}

export const authService = AuthService.getInstance(); 