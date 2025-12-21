import { ApiResponse, PaginatedResponse, PaginationParams } from '@/shared/types';
import { authService } from '@/core/services/auth.service';

// For generating idempotency keys
const crypto = typeof window !== 'undefined' ? window.crypto : require('crypto');

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    return authService.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log(`🔍 API Request: ${options.method || 'GET'} ${url}`);
      console.log(`🔍 Token present: ${!!token}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`🔍 API Response: ${response.status}`, data);

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Request failed',
          details: data.details,
        };
      }

      return data;
    } catch (error: any) {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout();
      }
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(userData: any): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async googleLogin(token: string): Promise<ApiResponse<any>> {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ provider: 'google', token }),
    });
  }

  // Listing endpoints (standardized from property)
  async createListing(listingData: any): Promise<ApiResponse<any>> {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id: string, listingData: any): Promise<ApiResponse<any>> {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  async getListing(id: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${id}`);
  }

  async getListings(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings${queryString}`);
  }

  async deleteListing(id: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async getMyListings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/listings/my-listings${queryParams}`);
  }

  async getHostListings(hostId: string, params?: any): Promise<ApiResponse<any>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/host${queryParams}`);
  }

  async getListingImages(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/photos`);
  }

  async uploadListingImages(listingId: string, images: File[]): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    return this.request(`/listings/${listingId}/photos`, {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async deleteListingImage(listingId: string, imageId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/photos/${imageId}`, {
      method: 'DELETE',
    });
  }

  async setPrimaryListingImage(listingId: string, imageId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/photos/${imageId}/primary`, {
      method: 'PATCH',
    });
  }

  async getAvailability(listingId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return this.request(`/availability/${listingId}${queryString}`);
  }

  async updateAvailability(listingId: string, availabilityData: any): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/${availabilityData._id}`, {
      method: 'PUT',
      body: JSON.stringify(availabilityData),
    });
  }

  async addAvailability(listingId: string, availabilityData: any): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}`, {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  }

  async bulkUpdateAvailability(listingId: string, availabilityData: any[]): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/bulk`, {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    });
  }

  // ========================================
  // NEW: Hourly availability methods
  // These use the new AvailabilityEvent model for precise hourly tracking
  // If backend APIs don't work, comment out these methods
  // ========================================
  
  async getHourlyAvailability(listingId: string, startDate?: string, endDate?: string, durationHours?: number): Promise<ApiResponse<any>> {
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    if (durationHours) queryParams.push(`durationHours=${durationHours}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return this.request(`/availability/${listingId}/hourly${queryString}`);
  }

  async getAvailabilityEvents(listingId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return this.request(`/availability/${listingId}/events${queryString}`);
  }

  async getNextAvailableSlot(listingId: string, fromDate?: string, durationHours?: number): Promise<ApiResponse<any>> {
    const queryParams = [];
    if (fromDate) queryParams.push(`fromDate=${fromDate}`);
    if (durationHours) queryParams.push(`durationHours=${durationHours}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return this.request(`/availability/${listingId}/next-slot${queryString}`);
  }

  async updateMaintenanceTime(listingId: string, maintenanceHours: number): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/maintenance-time`, {
      method: 'PUT',
      body: JSON.stringify({ maintenanceHours }),
    });
  }

  // Check if a specific time slot is available (for custom check-in times)
  async checkTimeSlotAvailability(
    listingId: string, 
    checkIn: string, 
    checkOut: string, 
    extension?: number
  ): Promise<ApiResponse<any>> {
    const queryParams = [`checkIn=${encodeURIComponent(checkIn)}`, `checkOut=${encodeURIComponent(checkOut)}`];
    if (extension) queryParams.push(`extension=${extension}`);
    const queryString = `?${queryParams.join('&')}`;
    return this.request(`/availability/${listingId}/check-slot${queryString}`);
  }
  
  // ========================================
  // END NEW: Hourly availability methods
  // ========================================

  // Service availability methods
  async getServiceAvailability(serviceId: string): Promise<ApiResponse<any>> {
    return this.request(`/services/${serviceId}/availability`, {
      method: 'GET',
    });
  }

  async updateServiceAvailability(serviceId: string, availableSlots: any[]): Promise<ApiResponse<any>> {
    return this.request(`/services/${serviceId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ availableSlots }),
    });
  }

  async deleteAvailability(listingId: string, availabilityId: string): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/${availabilityId}`, {
      method: 'DELETE',
    });
  }

  // Booking-related availability methods
  async blockDatesForBooking(listingId: string, dates: string[]): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/block-booking`, {
      method: 'PUT',
      body: JSON.stringify({ dates }),
    });
  }

  async confirmBooking(listingId: string, dates: string[], bookingId: string): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/confirm-booking`, {
      method: 'PUT',
      body: JSON.stringify({ dates, bookingId }),
    });
  }

  async releaseDates(listingId: string, dates: string[]): Promise<ApiResponse<any>> {
    return this.request(`/availability/${listingId}/release-dates`, {
      method: 'PUT',
      body: JSON.stringify({ dates }),
    });
  }

  async updateListingPricing(listingId: string, pricingData: any): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/pricing`, {
      method: 'PUT',
      body: JSON.stringify(pricingData),
    });
  }

  async updateListingStatus(listingId: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateListingVisibility(listingId: string, visibility: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ visibility }),
    });
  }

  async publishListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/publish`, {
      method: 'POST',
    });
  }

  async publishApprovedListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/publish-approved`, {
      method: 'POST',
    });
  }

  async unpublishListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/unpublish`, {
      method: 'POST',
    });
  }

  async getListingReviews(listingId: string, params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/${listingId}/reviews${queryString}`);
  }

  async getListingRating(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/rating`);
  }

  async getSimilarListings(listingId: string, params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/${listingId}/similar${queryString}`);
  }

  async getFeaturedListings(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/featured${queryString}`);
  }

  async searchListings(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/search${queryString}`);
  }

  async getListingCategories(): Promise<ApiResponse<any>> {
    return this.request('/listings/categories');
  }

  async getPopularLocations(): Promise<ApiResponse<any>> {
    return this.request('/listings/locations');
  }

  async getWishlistedListings(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/wishlist${queryString}`);
  }

  async addToListingWishlist(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/wishlist`, {
      method: 'POST',
    });
  }

  async removeFromListingWishlist(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/${listingId}/wishlist`, {
      method: 'DELETE',
    });
  }

  async getListingStats(listingId: string, params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/stats/overview${queryString}`);
  }

  async getListingRevenue(listingId: string, params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/stats/revenue${queryString}`);
  }

  async getListingViews(listingId: string, params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/stats/views${queryString}`);
  }

  async getHostDashboard(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/host/dashboard${queryString}`);
  }

  async getHostPerformance(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/host/performance${queryString}`);
  }

  async getPendingListings(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/listings/admin/pending${queryString}`);
  }

  async approveListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/admin/${listingId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/admin/${listingId}/reject`, {
      method: 'PATCH',
    });
  }

  async featureListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/listings/admin/${listingId}/feature`, {
      method: 'PATCH',
    });
  }

  // Service endpoints
  async createService(serviceData: any): Promise<ApiResponse<any>> {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id: string, serviceData: any): Promise<ApiResponse<any>> {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  async getService(id: string): Promise<ApiResponse<any>> {
    return this.request(`/services/${id}`);
  }

  async getHostServices(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/services/my-services${queryParams}`);
  }

  // Alias for getHostServices - used by host components
  async getMyServices(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    return this.getHostServices(params);
  }

  async deleteService(id: string): Promise<ApiResponse<void>> {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Booking endpoints
  async processPaymentAndCreateBooking(bookingData: any): Promise<ApiResponse<any>> {
    // Add security data
    const enhancedBookingData = {
      ...bookingData,
      idempotencyKey: this.generateIdempotencyKey(),
      paymentData: bookingData.paymentData ? {
        ...bookingData.paymentData,
        timestamp: new Date().toISOString(),
        clientVersion: '1.0.0'
      } : undefined,
      securityMetadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        clientVersion: '1.0.0'
      }
    };

    return this.request('/bookings/process-payment', {
      method: 'POST',
      body: JSON.stringify(enhancedBookingData),
    });
  }

  async createBooking(bookingData: any): Promise<ApiResponse<any>> {
    // Add security data
    const enhancedBookingData = {
      ...bookingData,
      idempotencyKey: this.generateIdempotencyKey(),
      securityMetadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        clientVersion: '1.0.0'
      }
    };

    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(enhancedBookingData),
    });
  }

  async processPayment(paymentData: any): Promise<ApiResponse<any>> {
    // Add security data
    const enhancedPaymentData = {
      ...paymentData,
      idempotencyKey: this.generateIdempotencyKey(),
      securityMetadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        clientVersion: '1.0.0'
      }
    };

    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(enhancedPaymentData),
    });
  }

  // Generate idempotency key for payment security
  private generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  async confirmPayment(paymentId: string): Promise<ApiResponse<any>> {
    return this.request(`/payments/confirm/${paymentId}`, {
      method: 'POST',
    });
  }

  async getBookings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/bookings${queryParams}`);
  }

  async getBooking(id: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}`);
  }

  async updateBookingStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async acceptBooking(id: string, message?: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/accept`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  }

  async rejectBooking(id: string, reason: string, message?: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason, message }),
    });
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getCancellationInfo(bookingId: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${bookingId}/cancellation-info`);
  }

  async checkInGuest(id: string, notes?: string): Promise<ApiResponse<any>> {
    return this.request(`/bookings/${id}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async downloadReceipt(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/bookings/${id}/receipt`, {
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download receipt');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getHostBookings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/bookings/host${queryParams}`);
  }

  async getUserBookings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/bookings/user${queryParams}`);
  }

  // Search endpoints
  async searchProperties(filters: any, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams({
      ...filters,
      ...params,
    });
    return this.request(`/search/properties?${queryParams.toString()}`);
  }

  async searchServices(filters: any, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = new URLSearchParams({
      ...filters,
      ...params,
    });
    return this.request(`/search/services?${queryParams.toString()}`);
  }

  async getFeaturedServices(): Promise<ApiResponse<any[]>> {
    return this.request('/services/featured');
  }

  // Host profile endpoints
  async becomeHost(hostData: any): Promise<ApiResponse<any>> {
    return this.request('/host/become', {
      method: 'POST',
      body: JSON.stringify(hostData),
    });
  }

  async updateHostProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.request('/host/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadHostImage(image: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('image', image);

    return this.request('/host/profile/image', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  // Admin endpoints
  // Host dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<any>> {
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

  async getHostStats(): Promise<ApiResponse<any>> {
    return this.request('/bookings/stats');
  }

  async getHostBookings(params?: any): Promise<ApiResponse<any>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/bookings/host${queryString}`);
  }

  async getAdminDashboardStats(): Promise<ApiResponse<any>> {
    return this.request('/admin/dashboard/stats');
  }

  async getAdminUsers(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/users${queryParams}`);
  }

  async updateUserStatus(userId: string, status: string, reason?: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ accountStatus: status, reason }),
    });
  }

  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/users/${userId}`);
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminHosts(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/hosts${queryParams}`);
  }

  async approveHost(hostId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/hosts/${hostId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectHost(hostId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/hosts/${hostId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminListings(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/properties${queryParams}`);
  }

  async approveListing(listingId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/listings/${listingId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectListing(listingId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/listings/${listingId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminBookings(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/bookings${queryParams}`);
  }

  async refundBooking(bookingId: string, amount: number, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/bookings/${bookingId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  async getAdminKYCVerifications(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/kyc${queryParams}`);
  }

  async getAdminKYCDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/kyc/${userId}`);
  }

  async approveKYC(kycId: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/kyc/${kycId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'verified' }),
    });
  }

  async rejectKYC(kycId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/kyc/${kycId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected', rejectionReason: reason }),
    });
  }

  async getAdminPayments(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/payments${queryParams}`);
  }

  async getPropertyAvailability(propertyId: string): Promise<ApiResponse<any>> {
    return this.request(`/availability/${propertyId}`);
  }

  async processManualPayout(paymentId: string, amount: number): Promise<ApiResponse<any>> {
    return this.request(`/admin/payments/${paymentId}/payout`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getAdminReviews(params?: any): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/admin/reviews${queryParams}`);
  }

  async flagReview(reviewId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/admin/reviews/${reviewId}/flag`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async getAdminSettings(): Promise<ApiResponse<any>> {
    return this.request('/admin/settings');
  }

  async updateAdminSettings(settings: any): Promise<ApiResponse<any>> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getAdminAnalytics(dateRange: any): Promise<ApiResponse<any>> {
    return this.request('/admin/analytics', {
      method: 'POST',
      body: JSON.stringify(dateRange),
    });
  }

  async generateAdminReport(reportType: string, params: any): Promise<ApiResponse<any>> {
    return this.request('/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ reportType, params }),
    });
  }

  // KYC endpoints
  async getKYCStatus(): Promise<ApiResponse<any>> {
    return this.request('/kyc/status');
  }

  async submitKYC(kycData: any): Promise<ApiResponse<any>> {
    return this.request('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(kycData),
    });
  }

  async updateKYC(kycData: any): Promise<ApiResponse<any>> {
    return this.request('/kyc/update', {
      method: 'PUT',
      body: JSON.stringify(kycData),
    });
  }

  async getKYCRequirements(): Promise<ApiResponse<any>> {
    return this.request('/kyc/requirements');
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/auth/me');
  }

  // Coupon endpoints
  async validateCoupon(code: string, bookingAmount: number, listingId?: string, serviceId?: string): Promise<ApiResponse<any>> {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({
        code,
        bookingAmount,
        listingId,
        serviceId,
        userId: this.getAuthToken() ? 'authenticated' : undefined
      }),
    });
  }

  // Generic HTTP methods for secure pricing API
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(); 