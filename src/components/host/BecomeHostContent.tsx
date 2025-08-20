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
  FileText
} from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import Card from '../ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { motion, AnimatePresence } from 'framer-motion';

const BecomeHostContent: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [justBecameHost, setJustBecameHost] = useState(false);

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
        }, 3000); // Increased timeout to show success message longer
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

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-12 pt-8"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 drop-shadow-lg font-display">
          Become a Host
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium font-body">
          Share your space or skills with travelers and earn money while meeting people from around the world
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-8 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 font-display">
                Why Host with TripMe?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(80,0,200,0.10)' }}
                    className="flex items-start space-x-4 transition-all"
                  >
                    <motion.div
                      className="flex-shrink-0 mt-1"
                      whileHover={{ scale: 1.2, rotate: 8 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="p-6 text-center bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">₹15,000+</div>
              <p className="text-gray-600">Average monthly earnings</p>
            </Card>
            <Card className="p-6 text-center bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <p className="text-gray-600">Host satisfaction rate</p>
            </Card>
            <Card className="p-6 text-center bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Support available</p>
            </Card>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-center mb-8 font-display">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              >
                <Card className="p-6 text-center relative bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl hover:scale-105 hover:shadow-2xl transition-all">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-purple-600">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-12"
        >
          <Card className="p-8 bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">Requirements to Host</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((requirement, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.04 }}
                  className="flex items-center space-x-3 transition-all"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Hosting Options & Become Host Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-12"
        >
          <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">Ready to Start Hosting?</h2>
            <p className="text-gray-700 mb-8 font-body">Click below to become a host and unlock new opportunities!</p>
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
            {!isHost && !success && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Button
                  onClick={handleBecomeHost}
                  disabled={isApplying}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg text-lg transition-all duration-200 relative overflow-hidden"
                >
                  {isApplying ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Applying...
                    </span>
                  ) : (
                    <span className="relative z-10">Become a Host</span>
                  )}
                  {/* Shine animation */}
                  <span className="absolute left-0 top-0 w-full h-full pointer-events-none">
                    <span className="block w-1/3 h-full bg-white/30 blur-lg animate-shine"></span>
                  </span>
                </Button>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-red-600 font-medium"
              >
                {error}
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
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