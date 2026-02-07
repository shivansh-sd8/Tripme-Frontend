"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Briefcase, User, Heart, Settings ,XIcon, Instagram, Facebook  ,Twitter ,Youtube} from 'lucide-react';
import { useScrollDirection } from '@/hooks/userScrollDirection';
import { useUI } from "@/core/store/uiContext";
import { apiClient } from '@/infrastructure/api/clients/api-client';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');
  const [hideMobileNav, setHideMobileNav] = useState(false);
  const scrollDirection = useScrollDirection();
  const { hideBottomNav } = useUI();
   const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'success' | 'error' | ''>('');


  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setHideMobileNav(document.body.classList.contains('search-open'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);


  const handleSubscribe = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!email.trim()) {
    setSubscriptionMessage('Please enter your email address');
    setSubscriptionStatus('error');
    return;
  }

  setIsSubscribing(true);
  setSubscriptionMessage('');

  try {
    // Get user info from localStorage or context if available
    const userInfo = typeof window !== 'undefined' ? 
      JSON.parse(localStorage.getItem('userInfo') || '{}') : {};

    const response = await apiClient.subscribeEmail(
      email,
      userInfo.name || undefined,
      userInfo.id || undefined,
      'footer'
    );

    if (response.success) {
      setSubscriptionMessage('Successfully subscribed! Check your email for confirmation.');
      setSubscriptionStatus('success');
      setEmail(''); // Clear the input
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSubscriptionMessage('');
        setSubscriptionStatus('');
      }, 5000);
    } else {
      // Handle specific error messages
      if (response.message === 'Email is already subscribed') {
        setSubscriptionMessage('You\'re already subscribed! Check your email for our latest updates.');
        setSubscriptionStatus('success'); // Treat as success, not error
      } else {
        setSubscriptionMessage(response.message || 'Subscription failed. Please try again.');
        setSubscriptionStatus('error');
      }
    }
  } catch (error: any) {
    console.error('Email subscription error:', error);
    
    // Handle API errors more gracefully
    if (error.status === 400 && error.message === 'Email is already subscribed') {
      setSubscriptionMessage('You\'re already subscribed! Check your email for our latest updates.');
      setSubscriptionStatus('success');
    } else {
      setSubscriptionMessage('Something went wrong. Please try again later.');
      setSubscriptionStatus('error');
    }
  } finally {
    setIsSubscribing(false);
  }
};

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav
  className={`
    fixed bottom-0 left-0 right-0 z-50
    bg-white border-t border-gray-200 shadow-2xl rounded-t-2xl
    flex justify-between items-center px-2 py-1 sm:hidden
    transition-transform duration-300 ease-out
    
    ${hideMobileNav || hideBottomNav ? 'hidden' : ''}

    ${scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'}
  `}
  // ${hideMobileNav ? 'hidden' : ''}
>
        <Link href="/" className="flex flex-col items-center flex-1 py-2 text-gray-700 hover:text-indigo-600 transition-all">
          <Home size={26} />
          <span className="text-xs mt-1 font-semibold">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center flex-1 py-2 text-gray-700 hover:text-indigo-600 transition-all">
          <Home size={26} />
          <span className="text-xs mt-1 font-semibold">Rooms</span>
        </Link>
        <Link href="/services" className="flex flex-col items-center flex-1 py-2 text-gray-700 hover:text-indigo-600 transition-all">
          <Settings size={26} />
          <span className="text-xs mt-1 font-semibold">Services</span>
        </Link>

        <Link href="/user/profile" className="flex flex-col items-center flex-1 py-2 text-gray-700 hover:text-indigo-600 transition-all">
          <User size={26} />
          <span className="text-xs mt-1 font-semibold">Profile</span>
        </Link>
      </nav>
      {/* Desktop Footer (unchanged, hidden on mobile) */}
      <footer className="relative w-full bg-white border-t border-gray-200 mt-auto overflow-hidden hidden sm:block">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-8 text-6xl">🏛️</div>
          <div className="absolute top-12 right-16 text-4xl">🕌</div>
          <div className="absolute bottom-8 left-1/4 text-5xl">🏔️</div>
          <div className="absolute bottom-12 right-1/3 text-4xl">🐘</div>
          <div className="absolute top-6 left-1/2 text-3xl">🎪</div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Brand section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="TripMe Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-600 leading-relaxed">
                Discover incredible stays across India. From heritage havelis to modern apartments, 
                find your perfect home away from home.
              </p>
              {/* <div className="flex space-x-3">
                <a href="#" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-sm">📱</span>
                </a>
                <a href="#" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-sm">📘</span>
                </a>
                <a href="#" className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-2 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-sm">📸</span>
                </a>
                <a href="#" className="bg-gradient-to-r from-violet-500 to-purple-500 text-white p-2 rounded-full hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-sm">🐦</span>
                </a>
              </div> */}
            </div>

            {/* Destinations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🏞️</span>
                Popular Destinations
              </h3>
              <ul className="space-y-2">
                {['Goa', 'Rajasthan', 'Kerala', 'Himachal Pradesh', 'Uttarakhand', 'Kashmir'].map((destination) => (
                  <li key={destination}>
                    <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{destination}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🛟</span>
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about-hosting" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">About Hosting</span>
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">About Us</span>
                  </Link>
                </li>
                <li>
                  <Link href="/refund-cancellation" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Cancellation Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/refund-cancellation" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Refund Policy</span>
                  </Link>
                </li>
                <li>
                  <Link href="/become-host" className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Become a Host</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📧</span>
                Stay Connected
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Get travel inspiration and exclusive deals delivered to your inbox.
              </p>
              <div className="space-y-3">
                 <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isSubscribing}
                required
              />
              <button 
                type="submit"
                disabled={isSubscribing}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-r-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>✈️</span>
                )}
              </button>
            </div>
            
            {/* Status Message */}
            {subscriptionMessage && (
              <div className={`text-xs p-2 rounded-md ${
                subscriptionStatus === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {subscriptionMessage}
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>🔒</span>
              <span>We respect your privacy</span>
            </div>
          </form>
                {/* <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-r-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                    ✈️
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>🔒</span>
                  <span>We respect your privacy</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Divider */}
           <div className="border-t border-purple-200 my-8"></div>
<div className="flex flex-col md:flex-row justify-center gap-6 items-center space-y-4 md:space-y-0">
  
  {/* Existing text or links */}
  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
    <span>Follow us!!</span>
  </div>

  {/* Social Media Icons Group */}
  <div className="flex items-center gap-4">
    <a 
      href="https://facebook.com/yourprofile" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-blue-600 transition-colors"
    >
      <Facebook size={20} />
    </a>
    <a 
      href="https://twitter.com/yourprofile" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-sky-500 transition-colors"
    >
      <XIcon size={20} />
    </a>
    <a 
      href="https://instagram.com/yourprofile" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-pink-600 transition-colors"
    >
      <Instagram size={20} />
    </a>

    <a 
    href="https://youtube.com/yourchannel" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-600 hover:text-red-600 transition-colors"
  >
    <Youtube size={20} />
  </a>
  </div>

</div>
        

          {/* Copyright */}
          <div className="text-center mt-8 pt-6 border-t border-purple-200">
            <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>in India</span>
              <span className="mx-2">•</span>
              <span>&copy; {currentYear} TripMe. All rights reserved.</span>
            </p>
            <div className="mt-2 flex items-center justify-center space-x-1 text-xs text-gray-400">
              <span>🇮🇳</span>
              <span>Proudly serving travelers across Bharat</span>
              <span>🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}