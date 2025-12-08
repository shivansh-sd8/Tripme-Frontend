import { ApiResponse, ErrorResponse, AuthResponse, User } from '@/types';
import { ApiError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'An error occurred';
        let errorCode = 'HTTP_ERROR';
        let errorDetails: any = null;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorCode = errorData.code || errorCode;
          errorDetails = errorData.details || errorData.errors || null;
        } catch {
          // If JSON parsing fails, use default error message
        }
        
        const error = new ApiError(
          response.status,
          errorCode,
          errorMessage,
          errorDetails
        );
        throw error;
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError(
          0,
          'NETWORK_ERROR',
          'Network error occurred. Please check your connection.'
        );
      }
      
      throw new ApiError(
        500,
        'UNKNOWN_ERROR',
        'An unexpected error occurred'
      );
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // Check for admin token first, then regular user token
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        console.log('🔐 API Client using admin token');
        return adminToken;
      }
      const userToken = localStorage.getItem('tripme_token');
      if (userToken) {
        console.log('🔐 API Client using user token');
        return userToken;
      }
      console.log('🔐 API Client no token found');
      return null;
    }
    return null;
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    return this.request<{ user: User; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ provider: 'google', token }),
    });
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
    role?: string;
    acceptTerms: boolean;
    marketingConsent?: boolean;
  }): Promise<AuthResponse> {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Location endpoints
  async getLocations() {
    return this.request('/locations');
  }

  async getLocation(slug: string) {
    return this.request(`/locations/${slug}`);
  }

  async getListings(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings${queryString}`);
  }

  // Stay endpoints
  async getStays(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request(`/stays?${params.toString()}`);
  }

  async getStay(id: string) {
    return this.request(`/stays/${id}`);
  }

  async getListing(id: string) {
    return this.request(`/listings/${id}`);
  }

  async createStay(stayData: any) {
    return this.request('/stays', {
      method: 'POST',
      body: JSON.stringify(stayData),
    });
  }

  async updateStay(id: string, stayData: any) {
    return this.request(`/stays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stayData),
    });
  }

  async deleteStay(id: string) {
    return this.request(`/stays/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking endpoints
  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(bookingId: string, statusData: { status: string; reason?: string }) {
    return this.request(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async getBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }

  async downloadReceipt(bookingId: string) {
    const response = await fetch(`${this.baseURL}/bookings/${bookingId}/receipt`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${bookingId}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async checkInGuest(bookingId: string, data: { notes?: string }) {
    return this.request(`/bookings/${bookingId}/check-in`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Host endpoints
  async becomeHost(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/users/become-host', {
      method: 'POST',
    });
  }

  // Property/Listing endpoints
  async createListing(propertyData: any) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async getMyListings(params?: any) {
    try {
      const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await this.request(`/listings/my-listings${queryParams}`);
      return response;
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('My listings API failed, using mock data:', error);
      return {
        success: true,
        data: {
          listings: []
        }
      };
    }
  }

  async getMyListings(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/my-listings${queryString}`);
  }

  async updateListing(id: string, propertyData: any) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async updateListing(id: string, listingData: any) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async deleteListing(id: string) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteListing(id: string) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Property availability endpoints
  async getListingAvailability(listingId: string) {
    return this.request(`/listings/${listingId}/availability`);
  }

  async updateListingAvailability(listingId: string, availability: { date: Date | string; status: 'available' | 'blocked' | 'booked' | 'maintenance' }[]) {
    return this.request(`/listings/${listingId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  }

  // Service endpoints
  async createService(serviceData: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async getMyServices(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/services/my-services${queryString}`);
  }

  async updateService(id: string, serviceData: any) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  async getService(id: string) {
    return this.request(`/services/${id}`);
  }

  // User profile endpoints
  async updateProfile(profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    languages?: string[];
    location?: {
      type?: string;
      coordinates?: number[];
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    profileImage?: string;
  }) {
    return this.request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserProfile() {
    return this.request<{ user: User }>('/users/profile');
  }

  // Host dashboard endpoints
  async getDashboardStats() {
    try {
      const response = await this.request('/users/dashboard');
      return response;
    } catch (error) {
      // Fallback to mock data if API fails
      console.warn('Dashboard API failed, using mock data:', error);
      return {
        success: true,
        data: {
          stats: {
            totalListings: 0,
            activeListings: 0,
            totalServices: 0,
            activeServices: 0,
            totalBookings: 0,
            pendingBookings: 0,
            completedBookings: 0,
            totalEarnings: 0,
            occupancyRate: 0,
            currentBookings: 0,
            recentBookings: []
          }
        }
      };
    }
  }

  async getHostStats() {
    return this.request('/bookings/stats');
  }

  async getHostBookings(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/bookings/host${queryString}`);
  }

  async getBookings() {
    return this.request('/bookings');
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Review endpoints
  async createReview(reviewData: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getStayReviews(stayId: string) {
    return this.request(`/stays/${stayId}/reviews`);
  }

  // Service availability endpoints
  async getServiceAvailability(serviceId: string) {
    return this.request(`/services/${serviceId}/availability`);
  }

  async updateServiceAvailability(serviceId: string, availableSlots: { startTime: Date | string; endTime: Date | string; isAvailable: boolean }[]) {
    return this.request(`/services/${serviceId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ availableSlots }),
    });
  }

  // Admin endpoints
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getAdminUsers(params?: any) {
    return this.request('/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminHosts(params?: any) {
    return this.request('/admin/hosts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminListings(params?: any) {
    return this.request('/admin/listings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminBookings(params?: any) {
    return this.request('/admin/bookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminKYCVerifications(params?: any) {
    return this.request('/admin/kyc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminPayments(params?: any) {
    return this.request('/admin/payments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminReviews(params?: any) {
    return this.request('/admin/reviews', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAdminSettings() {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(settings: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Generic GET method for admin endpoints
  async get(endpoint: string) {
    return this.request(endpoint);
  }

  // Generic PUT method for admin endpoints
  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Check if user is authenticated as admin
  isAdminAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('adminToken');
    }
    return false;
  }

}

export const apiClient = new ApiClient(API_BASE_URL); 