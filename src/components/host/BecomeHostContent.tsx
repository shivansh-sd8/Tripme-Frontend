"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  Home, 
  Briefcase, 
  Users, 
  DollarSign, 
  Shield, 
  Star, 
  CheckCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Camera,
  FileText,
  AlertCircle,
  UserCheck,
  TrendingUp,
  Calculator,
  Building2,
  Clock,
  Target,
  Award,
  Heart,
  Globe
} from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import Card from '../ui/Card';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const BecomeHostContent: React.FC = () => {
  const { user, updateUser, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [justBecameHost, setJustBecameHost] = useState(false);
  
  // Earnings calculator state
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [hostingDays, setHostingDays] = useState(15);

  // City data with average prices and occupancy rates
  const cityData = {
    'Mumbai': { basePrice: 2500, occupancyRate: 0.75, demand: 'High' },
    'Delhi': { basePrice: 2200, occupancyRate: 0.70, demand: 'High' },
    'Bangalore': { basePrice: 2000, occupancyRate: 0.65, demand: 'Medium' },
    'Goa': { basePrice: 3000, occupancyRate: 0.80, demand: 'High' },
    'Jaipur': { basePrice: 1800, occupancyRate: 0.60, demand: 'Medium' },
    'Kerala': { basePrice: 2800, occupancyRate: 0.70, demand: 'High' },
    'Himachal Pradesh': { basePrice: 3200, occupancyRate: 0.85, demand: 'Very High' },
    'Rajasthan': { basePrice: 1900, occupancyRate: 0.55, demand: 'Medium' }
  };

  // Calculate earnings
  const calculateEarnings = () => {
    const city = cityData[selectedCity as keyof typeof cityData];
    if (!city) return { monthly: 0, yearly: 0, daily: 0 };
    
    const dailyEarnings = city.basePrice * city.occupancyRate;
    const monthlyEarnings = dailyEarnings * hostingDays;
    const yearlyEarnings = monthlyEarnings * 12;
    
    return {
      daily: Math.round(dailyEarnings),
      monthly: Math.round(monthlyEarnings),
      yearly: Math.round(yearlyEarnings)
    };
  };

  const earnings = calculateEarnings();

  const handleBecomeHost = async () => {
    setIsApplying(true);
    setError(null);
    try {
      const response = await apiClient.becomeHost();
      
      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        setSuccess(true);
        setJustBecameHost(true);
        setTimeout(() => {
          router.push('/host/dashboard');
        }, 3000);
      } else {
        setError(response.message || 'Failed to become a host.');
      }
    } catch (err: any) {
      console.error('Become host error:', err);
      if (err?.code === 'UNAUTHORIZED' || err?.status === 401) {
        setError('Please log in to become a host.');
      } else if (err?.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Failed to become a host. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const benefits = [
    {
      icon: <span className="text-green-600 font-bold text-xl">₹</span>,
      title: "Earn Money",
      description: "Turn your property or skills into income. Set your own prices and earn on your terms."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Meet Travelers",
      description: "Connect with people from around the world and share your local knowledge."
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Secure Platform",
      description: "Our secure payment system and insurance protect both hosts and guests."
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      title: "Build Your Brand",
      description: "Create a profile, get reviews, and build your reputation as a trusted host."
    }
  ];

  const requirements = [
    "Valid government-issued ID",
    "Property ownership or permission to host",
    "Basic safety standards compliance",
    "Responsive communication with guests",
    "Clean and well-maintained space"
  ];

  const steps = [
    {
      number: "1",
      title: "Apply to Host",
      description: "Fill out a simple application form and verify your identity."
    },
    {
      number: "2",
      title: "List Your Space",
      description: "Add photos, set pricing, and create your listing description."
    },
    {
      number: "3",
      title: "Start Earning",
      description: "Receive bookings and start earning money from day one."
    }
  ];

  const isHost = isAuthenticated && user?.role === 'host';
  const isKYCVerified = user?.isVerified || user?.kyc?.status === 'verified';
  const isKYCPending = user?.kyc?.status === 'pending';
  const isKYCRejected = user?.kyc?.status === 'rejected';
  const isKYCNotSubmitted = !user?.kyc || user?.kyc?.status === 'not_submitted';

  // Debug logging to check user KYC status
  React.useEffect(() => {
    if (user) {
      console.log('🔍 Become-Host KYC Debug:', {
        user: user,
        kyc: user.kyc,
        kycStatus: user.kyc?.status,
        isVerified: user.isVerified,
        isKYCVerified,
        isKYCPending,
        isKYCRejected,
        isKYCNotSubmitted
      });
    }
  }, [user, isKYCVerified, isKYCPending, isKYCRejected, isKYCNotSubmitted]);

  


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-16 pt-8"
      >
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 drop-shadow-lg font-display">
          Become a Host
        </h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-medium font-body leading-relaxed">
            Turn your space into income. Join thousands of hosts earning with TripMe.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">No setup fees</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Flexible hosting</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">24/7 support</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings Calculator Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 mb-16"
      >
        <Card className="p-8 bg-gradient-to-br from-white to-blue-50 shadow-2xl rounded-3xl border border-blue-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900 font-display">Earnings Calculator</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how much you could earn by hosting your space on TripMe
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-8">
              {/* City Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="w-5 h-5 inline mr-2" />
                  Select Your City
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(cityData).map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedCity === city
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-sm">{city}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {cityData[city as keyof typeof cityData].demand} demand
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hosting Days Slider */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Days per Month: {hostingDays}
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={hostingDays}
                    onChange={(e) => setHostingDays(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((hostingDays - 5) / 25) * 100}%, #e5e7eb ${((hostingDays - 5) / 25) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>5 days</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Display */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">Your Potential Earnings</h3>
              
              <div className="space-y-6">
                <div className="bg-white/20 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold mb-2">₹{earnings.daily.toLocaleString()}</div>
                  <div className="text-blue-100">per day</div>
                </div>
                
                <div className="bg-white/20 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold mb-2">₹{earnings.monthly.toLocaleString()}</div>
                  <div className="text-blue-100">per month</div>
                </div>
                
                <div className="bg-white/20 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold mb-2">₹{earnings.yearly.toLocaleString()}</div>
                  <div className="text-blue-100">per year</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-blue-100 text-center">
                  <div className="font-semibold mb-2">Based on {selectedCity}</div>
                  <div>Average price: ₹{cityData[selectedCity as keyof typeof cityData].basePrice.toLocaleString()}/night</div>
                  <div>Occupancy rate: {Math.round(cityData[selectedCity as keyof typeof cityData].occupancyRate * 100)}%</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Benefits Section */}
          <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-display">Why Choose TripMe?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the platform that puts hosts first with industry-leading tools and support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="p-6 bg-white shadow-lg hover:shadow-2xl rounded-2xl border border-gray-100 transition-all duration-300 h-full">
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </div>
                </Card>
                  </motion.div>
                ))}
              </div>
          </motion.div>

        {/* Stats Section */}
          <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-16"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Join Our Success Stories</h2>
              <p className="text-blue-100 text-lg">See what our hosts are achieving</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">₹25,000+</div>
                <div className="text-blue-100">Average monthly earnings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Host satisfaction rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Dedicated support</div>
              </div>
            </div>
            </Card>
          </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-display">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just 3 simple steps and begin earning immediately
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="relative"
              >
                <Card className="p-8 text-center bg-white shadow-xl rounded-3xl border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                  
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mb-16"
        >
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 shadow-xl rounded-3xl border border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">Host Requirements</h2>
              <p className="text-lg text-gray-600">What you need to get started as a host</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((requirement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{requirement}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>



        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-2xl rounded-3xl text-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 font-display">Ready to Start Your Hosting Journey?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of successful hosts and start earning from your space today
              </p>
            <AnimatePresence>
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center mb-6"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mb-2 animate-bounce" />
                  <span className="text-lg font-semibold text-green-700">You're now a host! Redirecting to dashboard...</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!isHost && !success && user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                {isKYCVerified ? (
                <Button
                  onClick={handleBecomeHost}
                  disabled={isApplying}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-12 py-6 rounded-2xl shadow-2xl text-xl transition-all duration-300 relative overflow-hidden border-2 border-white/20 hover:shadow-3xl transform hover:scale-105"
                >
                  {isApplying ? (
                      <span className="flex items-center justify-center gap-3">
                        <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></span>
                      Applying...
                    </span>
                  ) : (
                      <span className="flex items-center gap-3">
                        <Building2 className="w-6 h-6" />
                        Become a Host
                      </span>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push('/user/kyc')}
                    disabled={isKYCPending}
                    className={`font-bold px-12 py-6 rounded-2xl shadow-2xl text-xl transition-all duration-300 relative overflow-hidden border-2 hover:shadow-3xl transform hover:scale-105 ${
                      isKYCPending
                        ? 'bg-blue-400 text-blue-100 cursor-not-allowed border-blue-300'
                        : isKYCRejected
                        ? 'bg-red-500 text-white hover:bg-red-600 border-red-400'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-400'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {isKYCPending ? (
                        <Calendar className="w-6 h-6" />
                      ) : isKYCRejected ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : (
                        <UserCheck className="w-6 h-6" />
                      )}
                      {isKYCPending 
                        ? 'KYC Under Review'
                        : isKYCRejected
                        ? 'Resubmit KYC Documents'
                        : 'Complete KYC Verification'
                      }
                  </span>
                </Button>
                )}
              </motion.div>
            )}
            
            {/* Debug info - remove this after testing */}
            {user && (
              <div className="mt-4 p-4 bg-black/20 rounded-lg text-white text-sm">
                <div>Debug Info:</div>
                <div>isHost: {isHost ? 'true' : 'false'}</div>
                <div>isKYCVerified: {isKYCVerified ? 'true' : 'false'}</div>
                <div>isKYCPending: {isKYCPending ? 'true' : 'false'}</div>
                <div>isKYCRejected: {isKYCRejected ? 'true' : 'false'}</div>
                <div>user.isVerified: {user.isVerified ? 'true' : 'false'}</div>
                <div>user.kyc?.status: {user.kyc?.status || 'undefined'}</div>
              </div>
            )}
            
            {/* Status message for non-verified users */}
            {!isHost && !success && !isKYCVerified && user && (
              <div className="mt-6 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-lg mx-auto">
                  <p className="text-blue-100 text-lg">
                    {isKYCPending 
                      ? 'Your KYC documents are under review. We\'ll notify you once verification is complete.'
                      : isKYCRejected
                      ? 'Your KYC was rejected. Please resubmit with correct documents.'
                      : 'Complete KYC verification to start hosting and earning money.'
                    }
                  </p>
                </div>
              </div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 bg-red-500/20 backdrop-blur-sm rounded-xl p-4 text-red-200 font-medium"
              >
                {error}
              </motion.div>
            )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          border: 3px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          border: 3px solid white;
        }
      `}</style>
      {/* Confetti animation on success (optional, can use a confetti library for more effect) */}
      <AnimatePresence>
        {success && (
          <motion.div
            key="confetti"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="w-full h-full flex flex-wrap items-center justify-center">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: [0, 300, 0], opacity: [1, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.05 }}
                  className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 m-2"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BecomeHostContent; 