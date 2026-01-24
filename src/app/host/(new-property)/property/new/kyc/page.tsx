"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  FileText, 
  CreditCard,
  AlertCircle,
  Loader2,
  Home,
  MapPin
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { apiClient } from '@/infrastructure/api/clients/api-client';

const identityDocTypes = [
  { id: 'aadhar-card', label: 'Aadhaar Card', icon: CreditCard, placeholder: '1234 5678 9012', pattern: /^\d{12}$/, hint: '12 digit Aadhaar number' },
  { id: 'pan-card', label: 'PAN Card', icon: FileText, placeholder: 'ABCDE1234F', pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, hint: 'Format: ABCDE1234F' },
  { id: 'passport', label: 'Passport', icon: FileText, placeholder: 'A1234567', pattern: /^[A-Z]{1}[0-9]{7}$/, hint: 'Format: A1234567' },
  { id: 'voter-id', label: 'Voter ID', icon: CreditCard, placeholder: 'ABC1234567', pattern: /^[A-Z]{3}[0-9]{7}$/, hint: 'Format: ABC1234567' },
  { id: 'drivers-license', label: 'Driving License', icon: CreditCard, placeholder: 'DL0120110012345', pattern: /^[A-Z]{2}[0-9]{13}$/, hint: 'Format: DL + 13 digits' },
];

const addressProofTypes = [
  { id: 'aadhar-card', label: 'Aadhaar Card', icon: Home },
  { id: 'voter-id', label: 'Voter ID', icon: Home },
  { id: 'passport', label: 'Passport', icon: FileText },
  { id: 'utility-bill', label: 'Utility Bill', icon: FileText },
  { id: 'bank-statement', label: 'Bank Statement', icon: FileText },
  { id: 'rent-agreement', label: 'Rent Agreement', icon: Home },
];

export default function KYCPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  
  // Identity document state
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [docNumberError, setDocNumberError] = useState('');
  
  // Address proof state
  const [selectedAddressProof, setSelectedAddressProof] = useState<string | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAddressProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAddressProofFile(e.target.files[0]);
    }
  };

  // Validate document number based on selected document type
  const validateDocumentNumber = (docType: string, number: string): boolean => {
    const doc = identityDocTypes.find(d => d.id === docType);
    if (!doc || !number) return false;
    return doc.pattern.test(number.toUpperCase().replace(/\s/g, ''));
  };

  const handleDocNumberChange = (value: string) => {
    setDocumentNumber(value);
    if (selectedDoc && value.trim()) {
      const isValid = validateDocumentNumber(selectedDoc, value);
      const doc = identityDocTypes.find(d => d.id === selectedDoc);
      setDocNumberError(isValid ? '' : doc?.hint || 'Invalid document number');
    } else {
      setDocNumberError('');
    }
  };

  // Check if KYC details are filled (identity doc is required, address proof is optional)
  const hasIdentityDoc = selectedDoc && uploadedFile && documentNumber.trim() && !docNumberError;
  const hasAddressProof = selectedAddressProof && addressProofFile;

  const handleSubmitKyc = async () => {
    if (!hasIdentityDoc) return;
    
    setIsSubmitting(true);
    setError('');
    try {
      // Upload identity document
      const formData = new FormData();
      formData.append('image', uploadedFile!);
      
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        setError('Failed to upload identity document');
        return;
      }

      // Upload address proof if provided
      let addressProofUrl = null;
      if (hasAddressProof) {
        const addressFormData = new FormData();
        addressFormData.append('image', addressProofFile!);
        
        const addressUploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: addressFormData,
        });
        
        const addressUploadResult = await addressUploadResponse.json();
        if (addressUploadResult.success) {
          addressProofUrl = addressUploadResult.data.url;
        }
      }

      // Submit KYC with uploaded document URLs
      const kycResponse = await apiClient.submitKYC({
        identityDocument: selectedDoc,
        documentNumber: documentNumber.trim().toUpperCase().replace(/\s/g, ''),
        documentImage: uploadResult.data.url,
        ...(hasAddressProof && {
          addressProofType: selectedAddressProof,
          addressProofImage: addressProofUrl,
        }),
      });
      
      if (kycResponse.success) {
        setKycSubmitted(true);
      } else {
        setError(kycResponse.message || 'Failed to submit KYC');
      }
    } catch (err: any) {
      console.error('Error submitting KYC:', err);
      setError(err?.message || 'Failed to submit KYC. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    router.push('/host/property/new/review');
  };

  // Determine button label and action
  const getNextLabel = () => {
    if (kycSubmitted) return 'Continue';
    if (hasIdentityDoc) return isSubmitting ? 'Submitting...' : 'Submit KYC';
    return 'Skip for now';
  };

  const handleNextAction = () => {
    if (kycSubmitted || !hasIdentityDoc) {
      handleNext();
    } else {
      handleSubmitKyc();
    }
  };

  const selectedDocInfo = identityDocTypes.find(d => d.id === selectedDoc);

  return (
    <OnboardingLayout
      currentMainStep={3}
      currentSubStep="kyc"
      onNext={handleNextAction}
      nextLabel={getNextLabel()}
      nextDisabled={isSubmitting}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-semibold text-gray-900">
            Verify your identity
          </h1>
        </div>
        <p className="text-gray-500 mb-6">
          Complete KYC verification to build trust with guests and unlock all hosting features.
        </p>

        {/* 15-day grace period notice */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Not required right now</p>
              <p className="text-sm text-amber-700 mt-1">
                You have <strong>15 days</strong> after publishing your listing to complete KYC verification. 
                Your listing will remain active during this period. You can skip this step and complete it later from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Document Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Select a document to verify (optional)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {identityDocTypes.map((doc) => {
              const Icon = doc.icon;
              const isSelected = selectedDoc === doc.id;
              
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc.id);
                    setDocumentNumber('');
                    setDocNumberError('');
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {doc.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Number & File Upload */}
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 space-y-4"
          >
            {/* Document Number */}
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-2">
                Document Number
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => handleDocNumberChange(e.target.value)}
                placeholder={selectedDocInfo?.placeholder || 'Enter document number'}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                  docNumberError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {selectedDocInfo && (
                <p className={`text-sm mt-1 ${docNumberError ? 'text-red-600' : 'text-gray-500'}`}>
                  {docNumberError || selectedDocInfo.hint}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Upload your document
              </h3>
              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  uploadedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{uploadedFile.name}</p>
                        <p className="text-sm text-green-600">Document uploaded successfully</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-700 font-medium">Click to upload</p>
                      <p className="text-sm text-gray-500">PNG, JPG or PDF (max 5MB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Address Proof Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Proof (Optional)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Adding address proof helps verify your identity faster
              </p>
              
              {/* Address Proof Type Selection */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {addressProofTypes.map((doc) => {
                  const Icon = doc.icon;
                  const isSelected = selectedAddressProof === doc.id;
                  
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedAddressProof(isSelected ? null : doc.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
                      <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {doc.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Address Proof File Upload */}
              {selectedAddressProof && (
                <label className="block">
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    addressProofFile 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleAddressProofFileChange}
                      className="hidden"
                    />
                    {addressProofFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900 text-sm">{addressProofFile.name}</p>
                          <p className="text-xs text-green-600">Address proof uploaded</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-gray-700 font-medium text-sm">Upload address proof</p>
                        <p className="text-xs text-gray-500">PNG, JPG or PDF (max 5MB)</p>
                      </>
                    )}
                  </div>
                </label>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* KYC Submitted Success */}
            {kycSubmitted && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">KYC Submitted Successfully!</p>
                    <p className="text-sm text-green-700">Your documents are under review. You can proceed to publish your listing.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Benefits of KYC */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h3 className="font-medium text-gray-900 mb-3">Benefits of verification</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Build trust with potential guests
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Get verified host badge on your listing
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Faster payouts to your bank account
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Access to premium hosting features
            </li>
          </ul>
        </div>

        {/* Skip option reminder */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can always complete verification later from{' '}
            <span className="font-medium text-gray-700">Hosting Dashboard → Account → Verification</span>
          </p>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
