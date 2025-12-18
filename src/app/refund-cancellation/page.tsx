"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Clock, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import PolicyHeader from '@/components/shared/PolicyHeader';
import Footer from '@/components/shared/Footer';

export default function RefundCancellationPage() {
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
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <RefreshCw className="text-red-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">Refund & Cancellation Policy</h1>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-6 sm:space-y-8 text-gray-700 leading-relaxed">
                <section className="border-l-4 border-red-500 pl-4 sm:pl-6">
                  <p className="text-base sm:text-lg text-gray-600 mb-4">
                    At Tripme.in ("Tripme", "we", "our", "us"), we aim to provide transparency and fairness for both Guests and Hosts. This Refund & Cancellation Policy explains how cancellations, refunds, and related charges are handled on the Tripme platform.
                  </p>
                  <p className="text-base sm:text-lg text-gray-600">
                    By making a booking or listing a property on Tripme, you agree to this policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>1. General Policy Overview</span>
                  </h2>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme is a marketplace platform connecting hosts and guests</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Refunds and cancellations are primarily governed by the host's chosen cancellation policy, which is clearly displayed before booking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme acts as a facilitator and processes refunds as per applicable policies</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>2. Cancellation by Guest</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                        <Clock className="text-red-500 mr-2 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                        <span>2.1 Before Check-in</span>
                      </h3>
                      <p className="text-sm sm:text-base text-gray-700 mb-3">
                        Guests may cancel their booking before check-in, subject to the host's cancellation policy, which may include:
                      </p>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
                          <CheckCircle className="text-green-600 mb-2 w-5 h-5 sm:w-6 sm:h-6" />
                          <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Free Cancellation</p>
                          <p className="text-xs sm:text-sm text-gray-600">Full refund if cancelled within the allowed period</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-200">
                          <AlertCircle className="text-yellow-600 mb-2 w-5 h-5 sm:w-6 sm:h-6" />
                          <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Partial Refund</p>
                          <p className="text-xs sm:text-sm text-gray-600">A percentage of the booking amount refunded</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-200 sm:col-span-2 md:col-span-1">
                          <XCircle className="text-red-600 mb-2 w-5 h-5 sm:w-6 sm:h-6" />
                          <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Non-Refundable</p>
                          <p className="text-xs sm:text-sm text-gray-600">No refund if cancelled after the permitted window</p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 mt-4">
                        The exact refund amount and eligibility are shown at the time of booking.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center">
                        <XCircle className="text-red-500 mr-2 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                        <span>2.2 After Check-in</span>
                      </h3>
                      <ul className="list-none space-y-2 ml-2 sm:ml-4">
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">No refunds will be provided once check-in has occurred</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Early departure does not qualify for partial or full refunds</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>3. 24-Hour Booking Rule (Important)</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">Tripme follows a 24-hour stay policy, where:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4 mb-3 sm:mb-4">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Check-out time is the same as check-in time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">One booking equals one full 24-hour stay</span>
                    </li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 font-semibold mb-3">Refunds are not applicable for:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Early check-out</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Late arrival</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Non-usage of booked hours</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>4. Cancellation by Host</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">If a host cancels a confirmed booking:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Guest will receive a full refund, including applicable fees</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme may assist the guest in finding an alternative accommodation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Repeated host cancellations may result in penalties or account suspension</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>5. No-Show Policy</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">If a guest:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Does not check in within the agreed time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Fails to inform the host or Tripme</span>
                    </li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mt-4">
                    The booking will be treated as a no-show, and no refund will be issued unless stated otherwise in the host's policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>6. Refund Processing Timeline</span>
                  </h2>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Approved refunds are processed within 5–10 working days</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Refunds are credited to the original payment method</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Delays caused by banks or payment gateways are beyond Tripme's control</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>7. Service Fees & Taxes</span>
                  </h2>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme service fees are non-refundable, unless cancellation is due to host fault or platform error</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Government taxes, if applicable, will be refunded as per statutory rules</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>8. Force Majeure / Exceptional Circumstances</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">
                    Refunds may be considered on a case-by-case basis for events beyond reasonable control, including:
                  </p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Natural disasters</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Government travel restrictions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Medical emergencies (valid proof required)</span>
                    </li>
                  </ul>
                  <p className="text-sm sm:text-base text-gray-700 mt-4">
                    Approval is at Tripme's sole discretion.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>9. Disputes & Resolution</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">If a refund-related dispute arises:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Guests and hosts are encouraged to communicate first</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme may review evidence and booking details</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme's decision shall be final and binding</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>10. Policy Changes</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700">
                    Tripme reserves the right to update this Refund & Cancellation Policy at any time. Updated policies will be effective immediately upon posting on the platform.
                  </p>
                </section>

                <section className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-red-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>11. Contact Us</span>
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 mb-3">For refund or cancellation-related queries, contact:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2 sm:mr-3">📧</span>
                      <a href="mailto:support@tripmeglobal.com" className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base break-all">support@tripmeglobal.com</a>
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-500 mr-2 sm:mr-3">🌐</span>
                      <a href="https://www.tripmeglobal.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base break-all">www.tripmeglobal.com</a>
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
