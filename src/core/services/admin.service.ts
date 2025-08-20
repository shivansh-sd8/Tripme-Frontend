import { 
  AdminStats, 
  RecentActivity, 
  User, 
  Property, 
  Booking, 
  KYCVerification, 
  Payment, 
  Story,
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '@/shared/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

export class AdminService {
  private static instance: AdminService;

  private constructor() {}

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // Dashboard Statistics
  public async getDashboardStats(): Promise<ApiResponse<{
    stats: AdminStats;
    recentActivity: RecentActivity[];
  }>> {
    try {
      return await apiClient.getAdminDashboardStats();
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  // User Management
  public async getUsers(params?: PaginationParams & {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      return await apiClient.getAdminUsers(params);
    } catch (error: any) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  public async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<ApiResponse<User>> {
    try {
      return await apiClient.updateUserStatus(userId, status);
    } catch (error: any) {
      console.error('Update user status error:', error);
      throw error;
    }
  }

  public async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.deleteUser(userId);
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Host Management
  public async getHosts(params?: PaginationParams & {
    status?: string;
    kycStatus?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      return await apiClient.getAdminHosts(params);
    } catch (error: any) {
      console.error('Get hosts error:', error);
      throw error;
    }
  }

  public async approveHost(hostId: string): Promise<ApiResponse<User>> {
    try {
      return await apiClient.approveHost(hostId);
    } catch (error: any) {
      console.error('Approve host error:', error);
      throw error;
    }
  }

  public async rejectHost(hostId: string, reason: string): Promise<ApiResponse<User>> {
    try {
      return await apiClient.rejectHost(hostId, reason);
    } catch (error: any) {
      console.error('Reject host error:', error);
      throw error;
    }
  }

  // Property/Listing Management
  public async getListings(params?: PaginationParams & {
    status?: string;
    hostId?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      return await apiClient.getAdminListings(params);
    } catch (error: any) {
      console.error('Get listings error:', error);
      throw error;
    }
  }

  public async approveListing(listingId: string): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.approveListing(listingId);
    } catch (error: any) {
      console.error('Approve listing error:', error);
      throw error;
    }
  }

  public async rejectListing(listingId: string, reason: string): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.rejectListing(listingId, reason);
    } catch (error: any) {
      console.error('Reject listing error:', error);
      throw error;
    }
  }

  // Booking Management
  public async getBookings(params?: PaginationParams & {
    status?: string;
    guestId?: string;
    hostId?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    try {
      return await apiClient.getAdminBookings(params);
    } catch (error: any) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }

  public async refundBooking(bookingId: string, amount: number, reason: string): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.refundBooking(bookingId, amount, reason);
    } catch (error: any) {
      console.error('Refund booking error:', error);
      throw error;
    }
  }

  // KYC Management
  public async getKYCVerifications(params?: PaginationParams & {
    status?: string;
    documentType?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<KYCVerification>>> {
    try {
      return await apiClient.getAdminKYCVerifications(params);
    } catch (error: any) {
      console.error('Get KYC verifications error:', error);
      throw error;
    }
  }

  public async approveKYC(kycId: string): Promise<ApiResponse<KYCVerification>> {
    try {
      return await apiClient.approveKYC(kycId);
    } catch (error: any) {
      console.error('Approve KYC error:', error);
      throw error;
    }
  }

  public async rejectKYC(kycId: string, reason: string): Promise<ApiResponse<KYCVerification>> {
    try {
      return await apiClient.rejectKYC(kycId, reason);
    } catch (error: any) {
      console.error('Reject KYC error:', error);
      throw error;
    }
  }

  // Payment Management
  public async getPayments(params?: PaginationParams & {
    status?: string;
    hostId?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    try {
      return await apiClient.getAdminPayments(params);
    } catch (error: any) {
      console.error('Get payments error:', error);
      throw error;
    }
  }

  public async processManualPayout(paymentId: string, amount: number): Promise<ApiResponse<Payment>> {
    try {
      return await apiClient.processManualPayout(paymentId, amount);
    } catch (error: any) {
      console.error('Process manual payout error:', error);
      throw error;
    }
  }

  // Review Management
  public async getReviews(params?: PaginationParams & {
    status?: string;
    rating?: number;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      return await apiClient.getAdminReviews(params);
    } catch (error: any) {
      console.error('Get reviews error:', error);
      throw error;
    }
  }

  public async flagReview(reviewId: string, reason: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.flagReview(reviewId, reason);
    } catch (error: any) {
      console.error('Flag review error:', error);
      throw error;
    }
  }

  public async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.deleteReview(reviewId);
    } catch (error: any) {
      console.error('Delete review error:', error);
      throw error;
    }
  }

  // Settings Management
  public async getSettings(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.getAdminSettings();
    } catch (error: any) {
      console.error('Get settings error:', error);
      throw error;
    }
  }

  public async updateSettings(settings: {
    commissionRate?: number;
    refundPolicy?: string;
    featureToggles?: Record<string, boolean>;
    securitySettings?: Record<string, any>;
  }): Promise<ApiResponse<any>> {
    try {
      return await apiClient.updateAdminSettings(settings);
    } catch (error: any) {
      console.error('Update settings error:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  public async getAnalytics(dateRange: {
    start: string;
    end: string;
  }): Promise<ApiResponse<any>> {
    try {
      return await apiClient.getAdminAnalytics(dateRange);
    } catch (error: any) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }

  public async generateReport(reportType: string, params: any): Promise<ApiResponse<any>> {
    try {
      return await apiClient.generateAdminReport(reportType, params);
    } catch (error: any) {
      console.error('Generate report error:', error);
      throw error;
    }
  }

  // Utility Methods
  public calculateCommission(amount: number, rate: number = 0.10): number {
    return Math.round(amount * rate * 100) / 100;
  }

  public formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
      case 'suspended':
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const adminService = AdminService.getInstance(); 