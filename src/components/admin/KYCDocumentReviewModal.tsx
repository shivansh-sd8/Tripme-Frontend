"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Download, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  MapPin,
  Camera,
  AlertCircle,
  Shield,
  Clock
} from 'lucide-react';
import Button from '../ui/Button';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface KYCDocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
}

interface KYCData {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    kyc: {
      status: string;
      documentType?: string;
      documentNumber?: string;
    };
    createdAt: string;
  };
  kycVerification: {
    _id: string;
    identityDocument: {
      type: string;
      number: string;
      frontImage: string;
      backImage: string;
      expiryDate?: string;
    };
    addressProof: {
      type: string;
      documentImage: string;
      address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
      };
    };
    selfie: string;
    status: string;
    rejectionReason?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

const KYCDocumentReviewModal: React.FC<KYCDocumentReviewModalProps> = ({
  isOpen,
  onClose,
  userId,
  onApprove,
  onReject
}) => {
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchKYCDetails();
    }
  }, [isOpen, userId]);

  const fetchKYCDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getAdminKYCDetails(userId);
      
      if (response.success) {
        setKycData(response.data);
      } else {
        setError(response.message || 'Failed to fetch KYC details');
      }
    } catch (error: any) {
      console.error('Error fetching KYC details:', error);
      setError(error.message || 'Failed to fetch KYC details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await onApprove(userId);
      onClose();
    } catch (error) {
      console.error('Error approving KYC:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setIsProcessing(true);
      await onReject(userId, rejectionReason);
      onClose();
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport':
        return 'Passport';
      case 'national-id':
        return 'National ID Card';
      case 'drivers-license':
        return 'Driver\'s License';
      case 'aadhar-card':
        return 'Aadhar Card';
      default:
        return type;
    }
  };

  const getAddressProofLabel = (type: string) => {
    switch (type) {
      case 'utility-bill':
        return 'Utility Bill';
      case 'bank-statement':
        return 'Bank Statement';
      case 'rental-agreement':
        return 'Rental Agreement';
      case 'property-tax':
        return 'Property Tax Receipt';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">KYC Document Review</h2>
              <p className="text-sm text-gray-600">Review submitted identity verification documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          ) : kycData ? (
            <div className="space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{kycData.user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">{kycData.user.email}</span>
                  </div>
                  {kycData.user.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{kycData.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Submitted:</span>
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {new Date(kycData.kycVerification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="ml-2">{getStatusBadge(kycData.kycVerification.status)}</span>
                </div>
              </div>

              {/* Identity Document */}
              {kycData.kycVerification.identityDocument && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Identity Document
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {getDocumentTypeLabel(kycData.kycVerification.identityDocument.type)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Number:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {kycData.kycVerification.identityDocument.number}
                      </span>
                    </div>
                    {kycData.kycVerification.identityDocument.expiryDate && (
                      <div>
                        <span className="text-sm text-gray-600">Expiry Date:</span>
                        <span className="text-sm font-medium text-gray-900 ml-2">
                          {new Date(kycData.kycVerification.identityDocument.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Front Image</h4>
                      <div className="border border-gray-200 rounded-lg p-2">
                        <img 
                          src={kycData.kycVerification.identityDocument.frontImage} 
                          alt="Document Front"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0QTRBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Back Image</h4>
                      <div className="border border-gray-200 rounded-lg p-2">
                        <img 
                          src={kycData.kycVerification.identityDocument.backImage} 
                          alt="Document Back"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0QTRBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Proof */}
              {kycData.kycVerification.addressProof && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Address Proof
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {getAddressProofLabel(kycData.kycVerification.addressProof.type)}
                      </span>
                    </div>
                    {kycData.kycVerification.addressProof.address && kycData.kycVerification.addressProof.address.city && (
                      <div>
                        <span className="text-sm text-gray-600">City:</span>
                        <span className="text-sm font-medium text-gray-900 ml-2">
                          {kycData.kycVerification.addressProof.address.city}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Document Image</h4>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <img 
                        src={kycData.kycVerification.addressProof.documentImage} 
                        alt="Address Proof"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0QTRBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Selfie */}
              {kycData.kycVerification.selfie && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-purple-600" />
                    Selfie with ID
                  </h3>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selfie Image</h4>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <img 
                        src={kycData.kycVerification.selfie} 
                        alt="Selfie with ID"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0QTRBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Reason (if rejected) */}
              {kycData.kycVerification.rejectionReason && kycData.kycVerification.rejectionReason.trim() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Rejection Reason</h3>
                  <p className="text-red-800">{kycData.kycVerification.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {kycData.kycVerification.status && kycData.kycVerification.status === 'pending' && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowRejectionForm(true)}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              )}

              {/* Rejection Form */}
              {showRejectionForm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Rejection Reason</h3>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    rows={3}
                  />
                  <div className="flex items-center justify-end space-x-3 mt-3">
                    <Button
                      onClick={() => setShowRejectionForm(false)}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReject}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default KYCDocumentReviewModal; 