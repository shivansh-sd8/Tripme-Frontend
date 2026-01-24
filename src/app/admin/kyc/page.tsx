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
  Filter,
  Shield,
  X
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
          // The backend returns { kyc: [...], pagination: {...} }
          setKycVerifications(response.data.kyc || []);
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
      case 'aadhar-card':
        return 'Aadhar Card';
      case 'pan-card':
        return 'PAN Card';
      case 'voter-id':
        return 'Voter ID Card';
      case 'passport':
        return 'Passport';
      case 'drivers-license':
        return 'Driver\'s License';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 md:p-6">
            {/* <div className="flex items-center flex-wrap justify-between">
              <div className="flex-wrap">
                <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  KYC Verifications
                </h1>
                <p className="mt-2 text-xs md:text-lg text-gray-600 whitespace-normal break-words">
                  Review and approve identity verification documents
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {filteredVerifications.filter(v => v.kyc?.status === 'pending').length} Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {filteredVerifications.filter(v => v.kyc?.status === 'verified').length} Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {filteredVerifications.filter(v => v.kyc?.status === 'rejected').length} Rejected
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
            </div> */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  {/* Left Section: flex-1 ensures the text container doesn't overflow its parent */}
  <div className="flex-1 min-w-0"> 
    <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent truncate sm:whitespace-normal">
      KYC Verifications
    </h1>
    
    <p className="mt-2 text-xs md:text-lg text-gray-600 whitespace-normal break-words leading-relaxed">
      Review and approve identity verification documents
    </p>

    {/* Status Dots: flex-wrap is critical here for mobile */}
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-xs md:text-sm text-gray-600 font-medium">
          {filteredVerifications.filter(v => v.kyc?.status === 'pending').length} Pending
        </span>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
        <span className="text-xs md:text-sm text-gray-600 font-medium">
          {filteredVerifications.filter(v => v.kyc?.status === 'verified').length} Verified
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
        <span className="text-xs md:text-sm text-gray-600 font-medium">
          {filteredVerifications.filter(v => v.kyc?.status === 'rejected').length} Rejected
        </span>
      </div>
    </div>
  </div>

  {/* Right Section: Hidden on mobile, shown on md+ */}
  <div className="hidden md:block shrink-0">
    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
      <Shield className="w-10 h-10 text-white" />
    </div>
  </div>
</div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or document number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">Filter by status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-2 md:px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 min-w-[120px] md:min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="not_submitted">Not Submitted</option>
                  <option value="pending">Pending Review</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced KYC Cards */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVerifications.map((verification) => (
              <div key={verification._id || verification.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
               
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {(verification.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{verification.name || 'N/A'}</h3>
                    <p className="text-sm text-gray-500">{verification.email || 'N/A'}</p>
                  </div>
                  {getStatusBadge(verification.kyc?.status || 'not_submitted')}
                </div>

               
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Document Type</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {getDocumentTypeLabel(verification.kyc?.documentType || 'unknown')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Document Number</span>
                    <span className="text-sm font-semibold text-gray-900 font-mono">
                      {verification.kyc?.documentNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Submitted</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

              
                <div className="flex items-center gap-3">
                  {verification.kyc?.documentImage ? (
                    <button
                      onClick={() => handleViewDocument(verification)}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  ) : (
                    <div className="flex-1 bg-gray-100 text-gray-500 px-4 py-3 rounded-xl font-medium text-center">
                      No Documents
                    </div>
                  )}
                  
                  {verification.kyc?.documentImage && (
                    <button
                      onClick={() => handleDownloadDocument(verification)}
                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors shadow-md hover:shadow-lg"
                      title="Download Documents"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  )}
                  
                  {verification.kyc?.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(verification._id || verification.id)}
                        className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors shadow-md hover:shadow-lg"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(verification._id || verification.id)}
                        className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors shadow-md hover:shadow-lg"
                        title="Reject"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
  {filteredVerifications.map((verification) => (
    <div 
      key={verification._id || verification.id} 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 group"
    >
      {/* 1. Header Section */}
      <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-lg md:text-xl font-bold text-white uppercase">
              {(verification.name || 'U').charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">
              {verification.name || 'N/A'}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 truncate leading-tight">
              {verification.email || 'N/A'}
            </p>
          </div>
        </div>
        {/* Badge moves to top-right on mobile */}
        <div className="shrink-0">
           {getStatusBadge(verification.kyc?.status || 'not_submitted')}
        </div>
      </div>

      {/* 2. Document Details Grid (2-column on mobile to save height) */}
      <div className="grid grid-cols-2 gap-2 md:block md:space-y-3 mb-6">
        <div className="col-span-1 p-2 md:p-3 bg-gray-50 rounded-xl border border-gray-100/50">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Type</p>
          <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">
            {getDocumentTypeLabel(verification.kyc?.documentType || 'unknown')}
          </p>
        </div>
        <div className="col-span-1 p-2 md:p-3 bg-gray-50 rounded-xl border border-gray-100/50">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">ID Number</p>
          <p className="text-xs md:text-sm font-mono font-semibold text-gray-800 truncate">
            {verification.kyc?.documentNumber || 'N/A'}
          </p>
        </div>
        <div className="col-span-2 md:col-span-1 p-2 md:p-3 bg-gray-50 rounded-xl border border-gray-100/50">
           <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-0.5">Submitted Date</p>
           <p className="text-xs md:text-sm font-semibold text-gray-800">
             {new Date(verification.createdAt).toLocaleDateString()}
           </p>
        </div>
      </div>

      {/* 3. Action Buttons - Flex wrap to prevent horizontal overflow */}
      <div className="flex flex-wrap items-center gap-2">
        {verification.kyc?.documentImage ? (
          <button
            onClick={() => handleViewDocument(verification)}
            className="flex-1 min-w-[120px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </button>
        ) : (
          <div className="flex-1 bg-gray-100 text-gray-400 py-2.5 rounded-xl text-xs font-bold text-center">
            No Docs
          </div>
        )}
        
        {/* Secondary Actions Row */}
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {verification.kyc?.documentImage && (
            <button
              onClick={() => handleDownloadDocument(verification)}
              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-90 transition-all border border-blue-100"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          
          {verification.kyc?.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(verification._id || verification.id)}
                className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 active:scale-90 transition-all border border-green-100"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(verification._id || verification.id)}
                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-90 transition-all border border-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  ))}
</div>

          {/* Empty State */}
          {filteredVerifications.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No KYC Verifications Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No identity verification documents have been submitted yet.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

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