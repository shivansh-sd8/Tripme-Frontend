"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import PolicyHeader from '@/components/shared/PolicyHeader';
import Footer from '@/components/shared/Footer';

export default function TermsPage() {
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
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <FileText className="text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">Terms & Conditions</h1>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12 lg:p-16">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-6 sm:space-y-8 text-gray-700 leading-relaxed">
                <section className="border-l-4 border-purple-500 pl-4 sm:pl-6">
                  <p className="text-base sm:text-lg text-gray-600 mb-4">
                    Welcome to Tripme.in ("Tripme", "we", "our", "us"). These Terms & Conditions ("Terms") govern your access to and use of the Tripme website, mobile application, and related services (collectively, the "Platform").
                  </p>
                  <p className="text-base sm:text-lg text-gray-600">
                    By accessing, browsing, or using Tripme, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>1. About Tripme</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">
                    Tripme is an online marketplace that connects hosts offering accommodations or stays with guests seeking short-to-long-term stays. Tripme enables bookings through its platform but does not own, operate, or manage any listed property.
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base">
                    A key feature of Tripme is its 24-hour booking model, where the check-out time is the same as the check-in time, unless otherwise specified in the listing.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>2. Eligibility</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">To use Tripme:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">You must be at least 18 years of age</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">You must provide accurate, current, and complete information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">You must be legally capable of entering into binding contracts under Indian law</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4 text-sm sm:text-base">
                    Tripme reserves the right to suspend or terminate accounts that violate these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>3. User Accounts</span>
                  </h2>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">You are responsible for maintaining the confidentiality of your account credentials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">You are fully responsible for all activities conducted through your account</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme is not liable for unauthorized access resulting from your failure to secure your account</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>4. Bookings & Payments</span>
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">4.1 Booking Confirmation</h3>
                      <ul className="list-none space-y-2 ml-2 sm:ml-4">
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">A booking is confirmed only after successful payment through the Platform</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Tripme reserves the right to cancel bookings in case of fraud, payment failure, or policy violations</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">4.2 Pricing & Fees</h3>
                      <ul className="list-none space-y-2 ml-2 sm:ml-4">
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Prices are set by hosts and may include cleaning fees, service fees, or applicable taxes</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                          <span className="text-sm sm:text-base">Tripme charges a platform service fee, disclosed during checkout</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span className="text-base sm:text-lg">5. Check-in & Check-out Policy (24-Hour Model)</span>
                  </h2>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Guests are entitled to 24 hours of stay starting from the check-in time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Check-out time will be the same as check-in time on the departure date</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Early check-in or late check-out is subject to host approval and additional charges</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Failure to vacate the property on time may result in extra charges or penalties.</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>6. Host Responsibilities</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">Hosts agree to:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Provide accurate descriptions, images, and amenities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Maintain cleanliness, safety, and habitability of the property</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Comply with all applicable local laws, housing regulations, and tax requirements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Resolve disputes professionally and fairly with guests</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4 text-sm sm:text-base">
                    Tripme is not responsible for host conduct but may intervene to maintain platform integrity.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>7. Guest Responsibilities</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">Guests agree to:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Use the property responsibly and for lawful purposes only</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Respect house rules provided by the host</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Avoid damage, illegal activities, or nuisance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Pay for any damages caused during the stay</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4 text-sm sm:text-base">
                    Hosts may claim damages through Tripme where applicable.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>8. Cancellations & Refunds</span>
                  </h2>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Cancellation policies are set by individual hosts and displayed at the time of booking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Refunds, if applicable, will be processed as per the host's cancellation policy</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme is not responsible for delays caused by banks or payment gateways</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>9. Prohibited Activities</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">Users must not:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Provide false or misleading information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Engage in illegal, abusive, or unsafe conduct</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Circumvent platform fees or payment systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Violate intellectual property or privacy rights</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Use the platform for commercial solicitation without authorization</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4 text-sm sm:text-base">
                    Violation may result in suspension or permanent account termination.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>10. Limitation of Liability</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">
                    Tripme acts solely as a technology platform. To the maximum extent permitted by law:
                  </p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme is not liable for property conditions, host actions, or guest behavior</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Tripme is not responsible for personal injury, loss, theft, or damages during a stay</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Any disputes between hosts and guests are primarily their responsibility</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>11. Indemnification</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">
                    You agree to indemnify and hold Tripme harmless from any claims, losses, damages, liabilities, or expenses arising from:
                  </p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Your use of the Platform</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Violation of these Terms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">Breach of laws or third-party rights</span>
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>12. Intellectual Property</span>
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    All content on Tripme, including logos, design, text, and software, is the property of Tripme or its licensors and is protected under applicable intellectual property laws. Unauthorized use is strictly prohibited.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>13. Termination</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">Tripme may suspend or terminate your access:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">For breach of these Terms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">For fraudulent or unlawful activity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base">To comply with legal obligations</span>
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4 text-sm sm:text-base">
                    Termination does not affect accrued rights or obligations.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>14. Governing Law & Jurisdiction</span>
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    These Terms are governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts of India.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>15. Changes to Terms</span>
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Tripme may update these Terms from time to time. Updated Terms will be posted on the Platform, and continued use constitutes acceptance of the revised Terms.
                  </p>
                </section>

                <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></span>
                    <span>16. Contact Information</span>
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base">For questions, concerns, or legal notices, contact us at:</p>
                  <ul className="list-none space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2 sm:mr-3">📧</span>
                      <a href="mailto:support@tripmeglobal.com" className="text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base break-all">support@tripmeglobal.com</a>
                    </li>
                    <li className="flex items-center">
                      <span className="text-purple-500 mr-2 sm:mr-3">🌐</span>
                      <a href="https://www.tripmeglobal.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-medium text-sm sm:text-base break-all">www.tripmeglobal.com</a>
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
