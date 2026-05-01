"use client";

import { Calendar, Shield, Clock, AlertCircle } from "lucide-react";

interface CancellationPolicyProps {
  policy?: 'flexible' | 'moderate' | 'strict' | 'super-strict';
}

const policyDetails = {
  flexible: {
    title: 'Flexible',
    description: 'Free cancellation up to 24 hours before check-in',
    details: [
      'Full refund if you cancel at least 24 hours before check-in',
      '50% refund if you cancel less than 24 hours before check-in',
      'No refund after check-in'
    ],
    color: 'bg-[#4285f4]'
  },
  moderate: {
    title: 'Moderate',
    description: 'Free cancellation up to 5 days before check-in',
    details: [
      'Full refund if you cancel at least 5 days before check-in',
      '50% refund if you cancel between 5 days and 24 hours before check-in',
      'No refund if you cancel less than 24 hours before check-in'
    ],
    color: 'bg-[#4285f4]'
  },
  strict: {
    title: 'Strict',
    description: 'Free cancellation up to 14 days before check-in',
    details: [
      'Full refund if you cancel at least 14 days before check-in',
      '50% refund if you cancel between 14 days and 7 days before check-in',
      '25% refund if you cancel between 7 days and 48 hours before check-in',
      'No refund if you cancel less than 48 hours before check-in'
    ],
    color: 'bg-[#4285f4]'
  },
  'super-strict': {
    title: 'Super Strict',
    description: 'Free cancellation up to 30 days before check-in',
    details: [
      'Full refund if you cancel at least 30 days before check-in',
      '50% refund if you cancel between 30 days and 14 days before check-in',
      '25% refund if you cancel between 14 days and 7 days before check-in',
      'No refund if you cancel less than 7 days before check-in'
    ],
    color: 'bg-[#4285f4]'
  }
};

export default function CancellationPolicy({ policy = 'moderate' }: CancellationPolicyProps) {
  const policyInfo = policyDetails[policy];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${policyInfo.color} rounded-lg sm:rounded-xl flex items-center justify-center`}>
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Cancellation policy
        </h2>
      </div>

      {/* Policy Type */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${policyInfo.color} text-white rounded-full mb-6`}>
        <Calendar className="w-4 h-4" />
        <span className="font-semibold">{policyInfo.title}</span>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm sm:text-base mb-6">
        {policyInfo.description}
      </p>

      {/* Details List */}
      <div className="space-y-4 mb-6">
        {policyInfo.details.map((detail, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <p className="text-gray-700 text-sm sm:text-base">{detail}</p>
          </div>
        ))}
      </div>

      {/* Important Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Important information
            </p>
            <p className="text-sm text-blue-700">
              Tripme's Guest Refund Policy does not cover cancellations due to 
              illness, travel restrictions, or other unforeseen circumstances. 
              Consider purchasing travel insurance for additional protection.
            </p>
          </div>
        </div>
      </div>

      {/* Learn More Link */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline">
          Learn more about cancellation policies
        </a>
      </div>
    </div>
  );
}