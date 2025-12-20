"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle } from 'lucide-react';
import PolicyHeader from '@/components/shared/PolicyHeader';
import Footer from '@/components/shared/Footer';

export default function ContactPage() {
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

          {/* Hero Section */}
          <div className="mb-12 sm:mb-16 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <Mail className="text-green-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Contact Us</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light">We're here to help you — whether you're planning a stay, managing a booking, or listing your property on Tripme.</p>
          </div>

          {/* Main Content */}
          <div className="space-y-6 sm:space-y-8">
            {/* Get in Touch */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Get in Touch</h2>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Email Support */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                      <Mail className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Email Support</h3>
                      <p className="text-xs sm:text-sm text-gray-600">For booking assistance, refunds, cancellations, or general queries</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:support@tripmeglobal.com" 
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base md:text-lg break-all"
                  >
                    support@tripmeglobal.com
                  </a>
                </div>

                {/* Business & Partnerships */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4 flex-shrink-0">
                      <Send className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Business & Partnerships</h3>
                      <p className="text-xs sm:text-sm text-gray-600">For host onboarding, partnerships, and business enquiries</p>
                    </div>
                  </div>
                  <a 
                    href="mailto:partners@tripmeglobal.com" 
                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm sm:text-base md:text-lg break-all"
                  >
                    partners@tripmeglobal.com
                  </a>
                </div>
              </div>
            </section>

            {/* Customer Support Hours */}
            <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <Clock className="text-orange-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Support Hours</h2>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100">
                <p className="text-base sm:text-lg text-gray-700 mb-2">
                  <span className="font-semibold">Monday to Sunday</span>
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">9:00 AM – 9:00 PM (IST)</p>
                <p className="text-sm sm:text-base text-gray-600">We aim to respond to all queries within 24 hours.</p>
              </div>
            </section>

            {/* Registered Office */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <MapPin className="text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Registered Office</h2>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">tripmeglobal.com</p>
                <p className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">TRIPME GLOBAL PRIVATE LIMITED</p>
                <div className="space-y-1 text-sm sm:text-base text-gray-700">
                  <p>A-42, Hanuman Nagar, Khatipura,</p>
                  <p>Jaipur, Rajasthan, India</p>
                  <p className="font-semibold">302012</p>
                </div>
              </div>
            </section>

            {/* For Guests & Hosts */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <HelpCircle className="text-blue-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">For Guests</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">If you are a guest and need help with:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4 mb-4 sm:mb-6">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Booking or payment issues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Check-in or stay-related concerns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Refunds or cancellations</span>
                  </li>
                </ul>
                <p className="text-xs sm:text-sm text-gray-600">
                  Please email <a href="mailto:support@tripmeglobal.com" className="text-blue-600 font-semibold hover:underline break-all">support@tripmeglobal.com</a> with your booking ID for faster assistance.
                </p>
              </section>

              <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <MessageSquare className="text-orange-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">For Hosts</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">If you are a host and need support with:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4 mb-4 sm:mb-6">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Listing your property</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Managing bookings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Payments and payouts</span>
                  </li>
                </ul>
                <p className="text-xs sm:text-sm text-gray-600">
                  Contact us at <a href="mailto:partners@tripmeglobal.com" className="text-orange-600 font-semibold hover:underline break-all">partners@tripmeglobal.com</a>.
                </p>
              </section>
            </div>

            {/* Feedback & Suggestions */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <MessageSquare className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Feedback & Suggestions</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4 leading-relaxed">
                We value your feedback. If you have ideas to improve Tripme or wish to share your experience, write to us at:
              </p>
              <a 
                href="mailto:feedback@tripmeglobal.com" 
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold text-base sm:text-lg break-all"
              >
                <Mail className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                feedback@tripmeglobal.com
              </a>
            </section>

            {/* Stay Connected */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Stay Connected</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                For updates, new features, and travel inspiration, follow Tripme on our official social media channels.
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-6 sm:mt-8">Tripme — Stay on your time.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
