"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  Star, 
  Flag, 
  Trash2,
  Search,
  Filter,
  MessageSquare
} from 'lucide-react';

interface Review {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  revieweeName: string;
  revieweeEmail: string;
  propertyTitle: string;
  rating: number;
  content: string;
  status: 'active' | 'flagged' | 'deleted';
  createdAt: string;
  flaggedReason?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAdminReviews();
        
        if (response.success && response.data && response.data.data) {
          // Handle PaginatedResponse structure: response.data.data contains the array
          setReviews(response.data.data);
        } else if (response.success && Array.isArray(response.data)) {
          // Fallback: if response.data is directly an array
          setReviews(response.data);
        } else {
          // Fallback to empty array if API fails or returns unexpected structure
          console.warn('Admin reviews API failed or returned unexpected structure:', response);
          setReviews([]);
          setError('Failed to load reviews. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
        setError('Error loading reviews. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Ensure reviews is always an array before filtering
  const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
    const matchesSearch = review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.revieweeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>;
      case 'flagged':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Flag className="h-3 w-3 mr-1" />
          Flagged
        </span>;
      case 'deleted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Trash2 className="h-3 w-3 mr-1" />
          Deleted
        </span>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const handleFlag = (reviewId: string) => {
    // TODO: Implement flag logic
    console.log('Flag review:', reviewId);
  };

  const handleDelete = (reviewId: string) => {
    // TODO: Implement delete logic
    console.log('Delete review:', reviewId);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Loading reviews...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Reviews
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage user reviews and handle flagged content
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Flag className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Error Loading Reviews</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-red-100 text-red-800 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors duration-200"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Reviews
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Manage user reviews and handle flagged content
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Total: {reviews.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Active: {reviews.filter(r => r.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Flagged: {reviews.filter(r => r.status === 'flagged').length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search reviews by reviewer, reviewee, property, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="flagged">Flagged</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h3>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl font-medium">No reviews found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Review #{review.id.slice(-8)}</h4>
                          <p className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>

                    <div className="space-y-4">
                      {/* Review Content */}
                      <div className="p-4 bg-gray-100/50 rounded-xl">
                        <p className="text-sm text-gray-900 leading-relaxed">{review.content}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                      </div>

                      {/* Reviewer Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{review.reviewerName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewerName}</p>
                          <p className="text-sm text-gray-600">{review.reviewerEmail}</p>
                        </div>
                      </div>

                      {/* Reviewee Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">{review.revieweeName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.revieweeName}</p>
                          <p className="text-sm text-gray-600">{review.revieweeEmail}</p>
                        </div>
                      </div>

                      {/* Property */}
                      <div className="p-3 bg-gray-100/50 rounded-xl">
                        <p className="text-sm font-medium text-gray-900">Property</p>
                        <p className="text-sm text-gray-600">{review.propertyTitle}</p>
                      </div>

                      {/* Flagged Reason */}
                      {review.flaggedReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-sm font-medium text-red-800">Flagged Reason</p>
                          <p className="text-sm text-red-600">{review.flaggedReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        {review.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleFlag(review.id)}
                              className="flex-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl hover:bg-yellow-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                              <Flag className="w-4 h-4" />
                              <span>Flag</span>
                            </button>
                            <button
                              onClick={() => handleDelete(review.id)}
                              className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                        {review.status === 'flagged' && (
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 