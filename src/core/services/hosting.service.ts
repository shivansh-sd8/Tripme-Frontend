import { Property, Service, ApiResponse, PaginatedResponse, PaginationParams, SearchFilters } from '@/shared/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

export class HostingService {
  private static instance: HostingService;

  private constructor() {}

  public static getInstance(): HostingService {
    if (!HostingService.instance) {
      HostingService.instance = new HostingService();
    }
    return HostingService.instance;
  }

  // Property Management
  public async createListing(propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.createListing(propertyData);
    } catch (error: any) {
      console.error('Create property error:', error);
      throw error;
    }
  }

  public async updateListing(id: string, propertyData: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.updateListing(id, propertyData);
    } catch (error: any) {
      console.error('Update property error:', error);
      throw error;
    }
  }

  public async getListing(id: string): Promise<ApiResponse<Property>> {
    try {
      return await apiClient.getListing(id);
    } catch (error: any) {
      console.error('Get property error:', error);
      throw error;
    }
  }

  public async getHostProperties(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      return await apiClient.getHostProperties(params);
    } catch (error: any) {
      console.error('Get host properties error:', error);
      throw error;
    }
  }

  public async deleteListing(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.deleteListing(id);
    } catch (error: any) {
      console.error('Delete property error:', error);
      throw error;
    }
  }

  public async uploadPropertyImages(propertyId: string, images: File[]): Promise<ApiResponse<string[]>> {
    try {
      return await apiClient.uploadPropertyImages(propertyId, images);
    } catch (error: any) {
      console.error('Upload property images error:', error);
      throw error;
    }
  }

  // Service Management
  public async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await apiClient.createService(serviceData);
    } catch (error: any) {
      console.error('Create service error:', error);
      throw error;
    }
  }

  public async updateService(id: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await apiClient.updateService(id, serviceData);
    } catch (error: any) {
      console.error('Update service error:', error);
      throw error;
    }
  }

  public async getService(id: string): Promise<ApiResponse<Service>> {
    try {
      return await apiClient.getService(id);
    } catch (error: any) {
      console.error('Get service error:', error);
      throw error;
    }
  }

  public async getHostServices(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Service>>> {
    try {
      return await apiClient.getHostServices(params);
    } catch (error: any) {
      console.error('Get host services error:', error);
      throw error;
    }
  }

  public async deleteService(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.deleteService(id);
    } catch (error: any) {
      console.error('Delete service error:', error);
      throw error;
    }
  }

  // Search and Discovery
  public async searchProperties(filters: SearchFilters, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Property>>> {
    try {
      return await apiClient.searchProperties(filters, params);
    } catch (error: any) {
      console.error('Search properties error:', error);
      throw error;
    }
  }

  public async searchServices(filters: SearchFilters, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Service>>> {
    try {
      return await apiClient.searchServices(filters, params);
    } catch (error: any) {
      console.error('Search services error:', error);
      throw error;
    }
  }

  public async getPopularProperties(): Promise<ApiResponse<Property[]>> {
    try {
      return await apiClient.getPopularProperties();
    } catch (error: any) {
      console.error('Get popular properties error:', error);
      throw error;
    }
  }

  public async getFeaturedServices(): Promise<ApiResponse<Service[]>> {
    try {
      return await apiClient.getFeaturedServices();
    } catch (error: any) {
      console.error('Get featured services error:', error);
      throw error;
    }
  }

  // Host Profile Management
  public async becomeHost(hostData: {
    bio: string;
    experience: string;
    specialties: string[];
  }): Promise<ApiResponse<User>> {
    try {
      return await apiClient.becomeHost(hostData);
    } catch (error: any) {
      console.error('Become host error:', error);
      throw error;
    }
  }

  public async updateHostProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await apiClient.updateHostProfile(profileData);
    } catch (error: any) {
      console.error('Update host profile error:', error);
      throw error;
    }
  }

  public async uploadHostImage(image: File): Promise<ApiResponse<string>> {
    try {
      return await apiClient.uploadHostImage(image);
    } catch (error: any) {
      console.error('Upload host image error:', error);
      throw error;
    }
  }

  // Utility Methods
  public calculatePropertyRating(property: Property): number {
    // This would typically come from reviews
    return 4.5; // Placeholder
  }

  public formatPropertyPrice(property: Property): string {
    return `${property.price.currency} ${property.price.base}/night`;
  }

  public getPropertyAmenities(property: Property): string[] {
    return property.amenities || [];
  }

  public isPropertyAvailable(property: Property, checkIn: string, checkOut: string): boolean {
    // This would check against existing bookings
    return true; // Placeholder
  }
}

export const hostingService = HostingService.getInstance(); 