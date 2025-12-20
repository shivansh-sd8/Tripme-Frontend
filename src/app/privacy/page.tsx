"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import PolicyHeader from '@/components/shared/PolicyHeader';
import Footer from '@/components/shared/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <PolicyHeader />
      <div className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 sm:mb-8 transition-colors group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <Shield className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">Privacy Policy</h1>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-6 sm:space-y-8 text-gray-700 leading-relaxed">
                <section className="border-l-4 border-blue-500 pl-4 sm:pl-6">
                  <p className="text-base sm:text-lg text-gray-600">
                    This Privacy Policy is currently being updated. Please refer to our Terms & Conditions for information about how we handle your data, or contact us at <a href="mailto:support@tripmeglobal.com" className="text-blue-600 hover:text-blue-700 font-medium break-all">support@tripmeglobal.com</a> for any privacy-related concerns.
                  </p>
                </section>

                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>Contact Information</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">For privacy-related questions or concerns, contact us at:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2 sm:mr-3">📧</span>
                      <a href="mailto:support@tripmeglobal.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base break-all">support@tripmeglobal.com</a>
                    </li>
                    <li className="flex items-center">
                      <span className="text-blue-500 mr-2 sm:mr-3">🌐</span>
                      <a href="https://www.tripmeglobal.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base break-all">www.tripmeglobal.com</a>
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
