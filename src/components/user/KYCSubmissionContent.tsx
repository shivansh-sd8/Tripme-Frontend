"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Camera,
  FileText,
  Home,
  User,
  Mail,
  Phone,
  Save,
  ArrowLeft
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface KYCStatus {
  kyc: {
    status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
    documentType?: string;
    documentNumber?: string;
    documentImage?: string;
    rejectionReason?: string;
  };
  verification?: any;
  canBecomeHost: boolean;
}

interface KYCRequirements {
  identityDocuments: Array<{
    type: string;
    name: string;
    description: string;
  }>;
  addressProofs: Array<{
    type: string;
    name: string;
    description: string;
  }>;
  selfie: {
    description: string;
    requirements: string[];
  };
  generalRequirements: string[];
}

const KYCSubmissionContent: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('status');
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [requirements, setRequirements] = useState<KYCRequirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    identityDocument: '',
    documentNumber: '',
    documentImage: '',
    addressProof: '',
    addressProofImage: '',
    selfie: ''
  });

  // Image upload states
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingAddressProof, setUploadingAddressProof] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Fetch KYC status and requirements
  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch KYC status
        const statusResponse = await apiClient.getKYCStatus();
        if (statusResponse.success) {
          setKycStatus(statusResponse.data);
        }

        // Fetch KYC requirements
        const requirementsResponse = await apiClient.getKYCRequirements();
        if (requirementsResponse.success) {
          setRequirements(requirementsResponse.data.requirements);
        }
      } catch (error) {
        console.error('Error fetching KYC data:', error);
        setError('Failed to load KYC information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKYCData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await apiClient.submitKYC(formData);
      
      if (response.success) {
        setSuccess('Host application submitted successfully! Please wait for verification.');
        // Refresh KYC status
        const statusResponse = await apiClient.getKYCStatus();
        if (statusResponse.success) {
          setKycStatus(statusResponse.data);
        }
        setActiveTab('status');
      } else {
        setError(response.message || 'Failed to submit host application');
      }
    } catch (error: any) {
      console.error('Error submitting host application:', error);
      setError(error.message || 'Failed to submit host application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('media', file);

    const token = localStorage.getItem('tripme_token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(`${apiUrl}/upload/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    const result = await response.json();
    return result.data.url;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">Under Review</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Not Submitted</span>
          </div>
        );
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Your identity has been verified! You are now a host and can start creating listings.';
      case 'pending':
        return 'Your documents are under review. This usually takes 1-3 business days.';
      case 'rejected':
        return kycStatus?.kyc?.rejectionReason 
          ? `Your KYC was rejected: ${kycStatus.kyc.rejectionReason}`
          : 'Your KYC was rejected. Please submit new documents.';
      default:
        return 'Submit your identity verification documents to become a host.';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/user/profile')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Become a Host</h1>
            <p className="text-gray-600 mt-1">
              Complete your identity verification to start hosting and earning
            </p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Host Application Status</h2>
            {kycStatus && getStatusBadge(kycStatus.kyc?.status || 'not_submitted')}
          </div>
          <p className="text-gray-600 mb-4">
            {kycStatus && getStatusDescription(kycStatus.kyc?.status || 'not_submitted')}
          </p>
          
          {kycStatus?.kyc?.status === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">
                  Your identity has been verified! You are now a host.
                </span>
              </div>
              <Button
                onClick={async () => {
                  // Force refresh user data to get updated role after KYC verification
                  await refreshUser(true);
                  router.push('/host/dashboard');
                }}
                className="mt-3"
              >
                Go to Host Dashboard
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('status')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Application Status
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'submit'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submit Documents
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requirements'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Requirements
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'status' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
            
            {kycStatus?.kyc?.status === 'rejected' && kycStatus.kyc.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Rejection Reason</span>
                </div>
                <p className="text-red-700 mt-2">{kycStatus.kyc.rejectionReason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Type:</strong> {kycStatus?.kyc?.documentType || 'Not submitted'}</p>
                  <p><strong>Number:</strong> {kycStatus?.kyc?.documentNumber || 'Not submitted'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {kycStatus?.kyc?.status === 'not_submitted' && (
                    <p>Submit your identity verification documents to get started.</p>
                  )}
                  {kycStatus?.kyc?.status === 'pending' && (
                    <p>Your documents are being reviewed. You'll receive an email notification once verified.</p>
                  )}
                  {kycStatus?.kyc?.status === 'verified' && (
                    <p>Your identity is verified! You can now apply to become a host.</p>
                  )}
                  {kycStatus?.kyc?.status === 'rejected' && (
                    <p>Please submit new documents after addressing the rejection reason.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'submit' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Documents</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">{success}</span>
                </div>
              </div>
            )}

            {kycStatus?.kyc?.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">
                    Your KYC is already under review. Please wait for the verification process to complete.
                  </span>
                </div>
              </div>
            )}

            {kycStatus?.kyc?.status === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800">
                    Your KYC is already verified. No further action needed.
                  </span>
                </div>
              </div>
            )}

            {(kycStatus?.kyc?.status === 'not_submitted' || kycStatus?.kyc?.status === 'rejected') && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identity Document Type
                    </label>
                    <select
                      value={formData.identityDocument}
                      onChange={(e) => handleInputChange('identityDocument', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select document type</option>
                      {requirements?.identityDocuments.map((doc) => (
                        <option key={doc.type} value={doc.type}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document Number
                    </label>
                    <Input
                      type="text"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      placeholder="Enter document number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identity Document Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload a clear image of your identity document
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setUploadingDocument(true);
                            const imageUrl = await uploadImage(file);
                            handleInputChange('documentImage', imageUrl);
                          } catch (error) {
                            console.error('Upload error:', error);
                            setError(error instanceof Error ? error.message : 'Failed to upload image');
                          } finally {
                            setUploadingDocument(false);
                          }
                        }
                      }}
                      className="mt-2"
                      required
                      disabled={uploadingDocument}
                    />
                    {uploadingDocument && (
                      <div className="mt-2 flex items-center justify-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                    {formData.documentImage && !uploadingDocument && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Document uploaded successfully
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Proof Type
                  </label>
                  <select
                    value={formData.addressProof}
                    onChange={(e) => handleInputChange('addressProof', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Select address proof type</option>
                    {requirements?.addressProofs.map((proof) => (
                      <option key={proof.type} value={proof.type}>
                        {proof.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Proof Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload a clear image of your address proof
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setUploadingAddressProof(true);
                            const imageUrl = await uploadImage(file);
                            handleInputChange('addressProofImage', imageUrl);
                          } catch (error) {
                            console.error('Upload error:', error);
                            setError(error instanceof Error ? error.message : 'Failed to upload image');
                          } finally {
                            setUploadingAddressProof(false);
                          }
                        }
                      }}
                      className="mt-2"
                      required
                      disabled={uploadingAddressProof}
                    />
                    {uploadingAddressProof && (
                      <div className="mt-2 flex items-center justify-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                    {formData.addressProofImage && !uploadingAddressProof && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Address proof uploaded successfully
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie with ID
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload a selfie photo holding your ID document
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setUploadingSelfie(true);
                            const imageUrl = await uploadImage(file);
                            handleInputChange('selfie', imageUrl);
                          } catch (error) {
                            console.error('Upload error:', error);
                            setError(error instanceof Error ? error.message : 'Failed to upload image');
                          } finally {
                            setUploadingSelfie(false);
                          }
                        }
                      }}
                      className="mt-2"
                      required
                      disabled={uploadingSelfie}
                    />
                    {uploadingSelfie && (
                      <div className="mt-2 flex items-center justify-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                    {formData.selfie && !uploadingSelfie && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Selfie uploaded successfully
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('status')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'requirements' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Application Requirements</h3>
            
            {requirements && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Identity Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requirements.identityDocuments.map((doc) => (
                      <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-1">{doc.name}</h5>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Address Proof</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requirements.addressProofs.map((proof) => (
                      <div key={proof.type} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-1">{proof.name}</h5>
                        <p className="text-sm text-gray-600">{proof.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Selfie Requirements</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">{requirements.selfie.description}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {requirements.selfie.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">General Requirements</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      {requirements.generalRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default KYCSubmissionContent; 