"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Info, Clock, Users, Home, Shield, Target } from 'lucide-react';
import PolicyHeader from '@/components/shared/PolicyHeader';
import Footer from '@/components/shared/Footer';

export default function AboutPage() {
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
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <Info className="text-indigo-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">About Us</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light">Travel stays, redesigned for real life.</p>
          </div>

          {/* Main Content */}
          <div className="space-y-8 sm:space-y-12">
            {/* Introduction */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-4 sm:mb-6">
                Tripme.in was created with a simple idea — stays should work around your schedule, not the other way around.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                We are a technology-driven accommodation marketplace that connects hosts with guests looking for flexible, comfortable, and reliable stays across India. Whether you are travelling for work, leisure, medical visits, short breaks, or extended stays, Tripme gives you a smarter alternative to traditional hotels and rigid check-out rules.
              </p>
            </section>

            {/* What Makes Tripme Different */}
            <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <Clock className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">What Makes Tripme Different</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                Unlike conventional hotels and most short-stay platforms, Tripme follows a true 24-hour booking model.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-purple-100">
                  <p className="text-sm sm:text-base text-gray-700 font-medium">Check in at any time. Check out at the same time the next day.</p>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-purple-100">
                  <p className="text-sm sm:text-base text-gray-700 font-medium">No forced 11 AM check-outs.</p>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-purple-100">
                  <p className="text-sm sm:text-base text-gray-700 font-medium">No wasted hours.</p>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-purple-100">
                  <p className="text-sm sm:text-base text-gray-700 font-medium">No paying for time you cannot use.</p>
                </div>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mt-4 sm:mt-6 leading-relaxed">
                This simple yet powerful difference makes Tripme ideal for modern travellers who value flexibility, fairness, and convenience.
              </p>
            </section>

            {/* Our Platform */}
            <section className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 md:p-12">
              <div className="flex items-center mb-4 sm:mb-6">
                <Home className="text-indigo-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Platform</h2>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                Tripme operates as an online marketplace, similar in structure to global home-stay platforms, where:
              </p>
              <ul className="list-none space-y-2 sm:space-y-3 ml-2 sm:ml-4">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                  <span className="text-sm sm:text-base text-gray-700">Hosts list verified properties including homes, apartments, villas, and unique stays</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                  <span className="text-sm sm:text-base text-gray-700">Guests discover and book stays through our website and mobile app</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">•</span>
                  <span className="text-sm sm:text-base text-gray-700">Secure payments, transparent pricing, and clear policies ensure confidence for both sides</span>
                </li>
              </ul>
              <p className="text-base sm:text-lg text-gray-700 mt-4 sm:mt-6 leading-relaxed">
                Tripme does not own or manage properties — we empower local hosts while giving guests more choice and control.
              </p>
            </section>

            {/* For Guests & Hosts */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl sm:rounded-3xl shadow-xl border border-blue-100 p-6 sm:p-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Users className="text-blue-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">For Guests</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">With Tripme, guests enjoy:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Flexible 24-hour stays</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Transparent pricing with no hidden rules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">A wide range of accommodation options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Simple booking and secure payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Customer support when you need it</span>
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-gray-700 mt-4 sm:mt-6 leading-relaxed">
                  Whether it's a short city visit or a longer stay, Tripme ensures comfort without compromise.
                </p>
              </section>

              <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl shadow-xl border border-orange-100 p-6 sm:p-8">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Home className="text-orange-600 mr-2 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">For Hosts</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">Tripme helps hosts:</p>
                <ul className="list-none space-y-2 ml-2 sm:ml-4">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Monetize their property efficiently</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Attract quality guests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Set their own pricing and cancellation policies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Manage bookings with ease</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2 sm:mr-3 mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm sm:text-base text-gray-700">Earn consistently with platform support</span>
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-gray-700 mt-4 sm:mt-6 leading-relaxed">
                  We believe in building long-term partnerships with our host community.
                </p>
              </section>
            </div>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl sm:rounded-3xl shadow-xl border border-green-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Target className="text-green-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  To simplify stays by creating a fair, flexible, and trusted accommodation ecosystem for travellers and hosts across India.
                </p>
              </section>

              <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-8">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Shield className="text-purple-600 mr-2 sm:mr-3 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  To become India's most guest-friendly and host-empowering stay platform, known for innovation, transparency, and customer-first thinking.
                </p>
              </section>
            </div>

            {/* Why Tripme */}
            <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Why Tripme</h2>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg">
                <p className="font-semibold">Because your time matters.</p>
                <p className="font-semibold">Because flexibility matters.</p>
                <p className="font-semibold">Because travel should feel effortless.</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 text-center">Tripme — Stay on your time.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
