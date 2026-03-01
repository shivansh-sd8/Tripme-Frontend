import { Review, ReviewFormData, ReviewSummary, ApiResponse } from '@/shared/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

export class ReviewService {
  private static instance: ReviewService;

  private constructor() {}


//   getListingReviews

// getListingRating

// getAdminReviews

// flagReview

// deleteReview

  public static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  public async getListingReviews(propertyId: string): Promise<ApiResponse<Review[]>> {
    try {
      return await apiClient.getPropertyReviews(propertyId);
    } catch (error: any) {
      console.error('Get property reviews error:', error);
      throw error;
    }
  }

  public async getPropertyReviewSummary(propertyId: string): Promise<ApiResponse<ReviewSummary>> {
    try {
      return await apiClient.getPropertyReviewSummary(propertyId);
    } catch (error: any) {
      console.error('Get review summary error:', error);
      throw error;
    }
  }

  public async createReview(bookingId: string, reviewData: ReviewFormData): Promise<ApiResponse<Review>> {
    try {
      return await apiClient.createReview(bookingId, reviewData);
    } catch (error: any) {
      console.error('Create review error:', error);
      throw error;
    }
  }

  public async updateReview(reviewId: string, reviewData: Partial<ReviewFormData>): Promise<ApiResponse<Review>> {
    try {
      return await apiClient.updateReview(reviewId, reviewData);
    } catch (error: any) {
      console.error('Update review error:', error);
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

  public async respondToReview(reviewId: string, response: string): Promise<ApiResponse<Review>> {
    try {
      return await apiClient.respondToReview(reviewId, { response });
    } catch (error: any) {
      console.error('Respond to review error:', error);
      throw error;
    }
  }

  public async markReviewHelpful(reviewId: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.markReviewHelpful(reviewId);
    } catch (error: any) {
      console.error('Mark review helpful error:', error);
      throw error;
    }
  }

  public async reportReview(reviewId: string, reason: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.reportReview(reviewId, { reason });
    } catch (error: any) {
      console.error('Report review error:', error);
      throw error;
    }
  }
}