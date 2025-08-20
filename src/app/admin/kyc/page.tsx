"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import KYCDocumentReviewModal from '@/components/admin/KYCDocumentReviewModal';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Search,
  Filter
} from 'lucide-react';

interface KYCVerification {
  id: string;
  _id: string;
  name: string;
  email: string;
  kyc: {
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    documentType?: 'passport' | 'driving_license' | 'aadhar' | 'pan';
    documentNumber?: string;
    documentImage?: string;
    rejectionReason?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function AdminKYC() {
  const [kycVerifications, setKycVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const fetchKYCVerifications = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAdminKYCVerifications();
        
        if (response.success && response.data) {
          // The backend returns { kycApplications: [...], pagination: {...} }
          setKycVerifications(response.data.kycApplications || []);
        } else {
          // Fallback to mock data if API fails
          console.warn('Admin KYC API failed, using fallback data');
          setKycVerifications([]);
        }
      } catch (error) {
        console.error('Error fetching KYC verifications:', error);
        // Fallback to empty array on error
        setKycVerifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKYCVerifications();
  }, []);

  const filteredVerifications = (kycVerifications || []).filter(verification => {
    const matchesSearch = (verification.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (verification.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (verification.kyc?.documentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || verification.kyc?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport':
        return 'Passport';
      case 'driving_license':
        return 'Driving License';
      case 'aadhar':
        return 'Aadhar Card';
      case 'pan':
        return 'PAN Card';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>;
      case 'not_submitted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Not Submitted
        </span>;
      default:
        return null;
    }
  };

  const handleApprove = async (verificationId: string) => {
    try {
      const response = await apiClient.approveKYC(verificationId);
      if (response.success) {
        // Update the verification in the local state
        setKycVerifications(kycVerifications.map(verification => 
          (verification._id || verification.id) === verificationId 
            ? { 
                ...verification, 
                kyc: { ...verification.kyc, status: 'verified' as const }
              }
            : verification
        ));
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const handleReject = async (verificationId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        const response = await apiClient.rejectKYC(verificationId, reason);
        if (response.success) {
          // Update the verification in the local state
                  setKycVerifications(kycVerifications.map(verification => 
          (verification._id || verification.id) === verificationId 
            ? { 
                ...verification, 
                kyc: { ...verification.kyc, status: 'rejected' as const, rejectionReason: reason }
              }
            : verification
        ));
        }
      } catch (error) {
        console.error('Error rejecting KYC:', error);
      }
    }
  };

  const handleViewDocument = (verification: KYCVerification) => {
    setSelectedUserId(verification._id || verification.id);
    setIsModalOpen(true);
  };

  const handleDownloadDocument = (verification: KYCVerification) => {
    if (!verification.kyc?.documentImage) {
      alert('No document available for download');
      return;
    }

    try {
      // Create a temporary link to download the document
      const link = document.createElement('a');
      link.href = verification.kyc.documentImage;
      
      // Determine file extension from URL or default to jpg
      const url = verification.kyc.documentImage;
      const extension = url.includes('.') ? url.split('.').pop()?.split('?')[0] || 'jpg' : 'jpg';
      
      link.download = `kyc_document_${verification.name || 'user'}_${verification.kyc.documentType || 'document'}.${extension}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleApproveKYC = async (userId: string) => {
    try {
      const response = await apiClient.approveKYC(userId);
      if (response.success) {
        // Update the verification in the local state
        setKycVerifications(kycVerifications.map(verification => 
          (verification._id || verification.id) === userId 
            ? { 
                ...verification, 
                kyc: { ...verification.kyc, status: 'verified' as const }
              }
            : verification
        ));
      }
    } catch (error) {
      console.error('Error approving KYC:', error);
    }
  };

  const handleRejectKYC = async (userId: string, reason: string) => {
    try {
      const response = await apiClient.rejectKYC(userId, reason);
      if (response.success) {
        // Update the verification in the local state
        setKycVerifications(kycVerifications.map(verification => 
          (verification._id || verification.id) === userId 
            ? { 
                ...verification, 
                kyc: { ...verification.kyc, status: 'rejected' as const, rejectionReason: reason }
              }
            : verification
        ));
      }
    } catch (error) {
      console.error('Error rejecting KYC:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Verifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve identity verification documents.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or document number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="not_submitted">Not Submitted</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVerifications.map((verification) => (
                  <tr key={verification._id || verification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {(verification.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{verification.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{verification.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDocumentTypeLabel(verification.kyc?.documentType || 'unknown')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {verification.kyc?.documentNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(verification.kyc?.status || 'not_submitted')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Eye button - show only if documents exist */}
                        {verification.kyc?.documentImage && (
                          <button
                            onClick={() => handleViewDocument(verification)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Download button - show only if documents exist */}
                        {verification.kyc?.documentImage && (
                          <button
                            onClick={() => handleDownloadDocument(verification)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Show message when no documents available */}
                        {!verification.kyc?.documentImage && (
                          <span className="text-xs text-gray-400 italic">No documents</span>
                        )}
                        
                        {/* Approve/Reject buttons - show only for pending status */}
                        {verification.kyc?.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(verification._id || verification.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(verification._id || verification.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* KYC Document Review Modal */}
      <KYCDocumentReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={selectedUserId}
        onApprove={handleApproveKYC}
        onReject={handleRejectKYC}
      />
    </AdminLayout>
  );
} 