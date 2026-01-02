"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import {
  DollarSign,
  Calendar,
  Shield,
  Headphones,
  CheckCircle,
  ArrowRight,
  MapPin,
  Calculator,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Card from '../ui/Card';

const BecomeHostLanding: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
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
    'Rajasthan': { basePrice: 1900, occupancyRate: 0.55, demand: 'Medium' },
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
      yearly: Math.round(yearlyEarnings),
    };
  };

  const earnings = calculateEarnings();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/hosting');
      return;
    }
    
    // Redirect to hosting page which handles the flow:
    // - New users see the intro page
    // - Hosts with listings see their dashboard
    // - Hosts without listings see intro to create first listing
    router.push('/hosting');
  };

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-[#FF385C]" />,
      title: 'Earn Extra Income',
      description: 'Turn your space into income. Set your own prices and earn on your terms.',
    },
    {
      icon: <Calendar className="w-8 h-8 text-[#FF385C]" />,
      title: 'Flexible Hosting',
      description: 'Host when you want. You control your calendar and availability.',
    },
    {
      icon: <Headphones className="w-8 h-8 text-[#FF385C]" />,
      title: '24/7 Support',
      description: 'Our dedicated support team is here to help you every step of the way.',
    },
    {
      icon: <Shield className="w-8 h-8 text-[#FF385C]" />,
      title: 'Secure Platform',
      description: 'Protected payments, verified guests, and insurance coverage.',
    },
  ];

  const howItWorks = [
    {
      number: '1',
      title: 'Apply to Host',
      description: 'Complete a simple application and verify your identity.',
    },
    {
      number: '2',
      title: 'List Your Space',
      description: 'Add photos, set pricing, and create your listing.',
    },
    {
      number: '3',
      title: 'Start Earning',
      description: 'Receive bookings and start earning money from day one.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF5F5] via-white to-[#F5F5FF] pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Host your space,
              <br />
              <span className="text-[#FF385C]">share your world</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of hosts earning extra income by sharing their space with travelers from around the world.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
            <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">No setup fees</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Flexible hosting</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">24/7 support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose TripMe?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed as a host
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-8 h-8 text-[#FF385C]" />
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Earnings Calculator
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how much you could earn by hosting your space
            </p>
          </motion.div>

          <Card className="p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-6">
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
                            ? 'border-[#FF385C] bg-[#FFF5F5] text-[#FF385C] shadow-md'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Days per Month: {hostingDays}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={hostingDays}
                    onChange={(e) => setHostingDays(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FF385C 0%, #FF385C ${((hostingDays - 5) / 25) * 100}%, #e5e7eb ${((hostingDays - 5) / 25) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>5 days</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>

              {/* Earnings Display */}
              <div className="bg-gradient-to-br from-[#FF385C] to-[#E61E4D] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">Your Potential Earnings</h3>
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-4xl font-bold mb-2">₹{earnings.daily.toLocaleString()}</div>
                    <div className="text-white/90">per day</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-4xl font-bold mb-2">₹{earnings.monthly.toLocaleString()}</div>
                    <div className="text-white/90">per month</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-4xl font-bold mb-2">₹{earnings.yearly.toLocaleString()}</div>
                    <div className="text-white/90">per year</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="text-sm text-white/90 text-center">
                    <div className="font-semibold mb-2">Based on {selectedCity}</div>
                    <div>
                      Average price: ₹{cityData[selectedCity as keyof typeof cityData].basePrice.toLocaleString()}/night
                    </div>
                    <div>
                      Occupancy rate: {Math.round(cityData[selectedCity as keyof typeof cityData].occupancyRate * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card className="text-center p-8 h-full">
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="w-16 h-16 bg-[#FF385C] rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-gradient-to-br from-[#FF385C] to-[#E61E4D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Join Our Success Stories</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              See what our hosts are achieving
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <div className="text-4xl font-bold mb-2">₹25,000+</div>
              <div className="text-white/90">Average monthly earnings</div>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/90">Host satisfaction rate</div>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/90">Dedicated support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Start Your Hosting Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of successful hosts and start earning from your space today
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-12 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BecomeHostLanding;

