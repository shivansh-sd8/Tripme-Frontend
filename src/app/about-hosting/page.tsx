"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, CheckCircle, DollarSign, Shield, Users, FileText, TrendingUp } from 'lucide-react';
import PolicyHeader from '@/components/shared/PolicyHeader';
import Footer from '@/components/shared/Footer';

export default function AboutHostingPage() {
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
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <Home className="text-orange-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">About Hosting</h1>
            <p className="text-lg sm:text-xl text-gray-600 font-light">Turn your space into a steady source of income — on your terms.</p>
          </div>

          {/* Main Content */}
          <div className="space-y-8 sm:space-y-12">
            {/* Introduction */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Tripme makes hosting simple, transparent, and rewarding. Whether you own a home, apartment, villa, or serviced space, Tripme helps you connect with genuine guests while giving you full control over pricing, availability, and house rules.
              </p>
            </section>

            {/* Why Host on Tripme */}
            <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100 p-6 sm:p-8 md:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Why Host on Tripme?</h2>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                Tripme is designed for hosts who want flexibility, fairness, and better utilization of their property.
              </p>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100">
                <div className="flex items-center mb-3 sm:mb-4">
                  <CheckCircle className="text-orange-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">24-Hour Booking Advantage</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">Unlike traditional platforms, Tripme follows a 24-hour stay model.</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Guests check out at the same time they check in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Better planning and fewer awkward early check-outs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">More predictable turnover and cleaning schedules</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* What You Can Host */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <Home className="text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What You Can Host</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">You can list:</p>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {['Homes & apartments', 'Villas & holiday homes', 'Studio units', 'Serviced residences', 'Unique stays (subject to approval)'].map((item, index) => (
                  <div key={index} className="flex items-center bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                    <CheckCircle className="text-indigo-500 mr-2 sm:mr-3 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-4 sm:mt-6 text-xs sm:text-sm">Each listing is reviewed to ensure quality and guest trust.</p>
            </section>

            {/* Full Control */}
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <Shield className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Full Control, Always</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">As a host on Tripme, you stay in control:</p>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {['Set your own pricing', 'Choose your cancellation policy', 'Define house rules', 'Accept or decline bookings', 'Block dates anytime'].map((item, index) => (
                  <div key={index} className="flex items-center bg-white rounded-xl p-3 sm:p-4 border border-purple-100">
                    <CheckCircle className="text-purple-500 mr-2 sm:mr-3 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-700 mt-4 sm:mt-6 leading-relaxed">
                Tripme does not interfere with how you manage your property.
              </p>
            </section>

            {/* Secure Payments & Trusted Guests */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl shadow-xl border border-green-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <DollarSign className="text-green-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Secure & Transparent Payments</h2>
                </div>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">All bookings are prepaid through the Tripme platform</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Payouts are processed securely to your registered bank account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Clear earnings breakdown with no hidden deductions</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Users className="text-blue-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Trusted Guests</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3">Tripme encourages responsible travel by:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Verifying guest profiles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Enforcing house rules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Providing support in case of disputes</span>
                  </li>
                </ul>
                <p className="text-xs sm:text-sm text-gray-700 mt-4">We work to create a respectful and safe hosting environment.</p>
              </section>
            </div>

            {/* Simple Listing Process */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <FileText className="text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple Listing Process</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">Getting started is easy:</p>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { step: '1', title: 'Create your host account' },
                  { step: '2', title: 'Add property details, photos, and pricing' },
                  { step: '3', title: 'Set availability and house rules' },
                  { step: '4', title: 'Go live and start receiving bookings' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                      {item.step}
                    </div>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 pt-1 sm:pt-2">{item.title}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-4 sm:mt-6">Our team is available to help you at every step.</p>
            </section>

            {/* Host Support & Who Can Become a Host */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Users className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Host Support</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3">Tripme offers:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Dedicated host support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Guidance on listing optimization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Policy support for cancellations and disputes</span>
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-gray-700 mt-4 font-semibold">You host. We support.</p>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <CheckCircle className="text-blue-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Who Can Become a Host?</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3">Anyone who:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Owns or legally manages a property</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Complies with local laws and regulations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700">Commits to cleanliness, safety, and guest satisfaction</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* Grow With Tripme */}
            <section className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 text-white">
              <div className="flex items-center mb-4 sm:mb-6">
                <TrendingUp className="mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold">Grow With Tripme</h2>
              </div>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                Tripme is building a community of hosts who believe in fair pricing, flexibility, and better hospitality.
              </p>
              <div className="space-y-2 text-lg sm:text-xl font-semibold">
                <p>Host smarter. Earn better. Stay in control.</p>
              </div>
            </section>

            {/* Call to Action */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-orange-200 p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Get Started?</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">List your property on Tripme today and start earning.</p>
              <Link
                href="/become-host"
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Become a Host
              </Link>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
