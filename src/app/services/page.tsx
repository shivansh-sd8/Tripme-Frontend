"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Wrench, ArrowRight, Sparkles, Compass } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { apiClient } from '@/lib/api';
import ServiceCard from '@/components/services/ServiceCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Group services by city
function groupByCity(services: any[]) {
  const grouped: Record<string, any[]> = {};
  services.forEach((service) => {
    const city = service.location?.city || 'Other';
    if (!grouped[city]) grouped[city] = [];
    grouped[city].push(service);
  });
  return grouped;
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Get search parameters from URL
      const city = searchParams.get('city');
      const serviceType = searchParams.get('serviceType');
      
      // Build query parameters
      const params: any = {};
      if (city) params.city = city;
      if (serviceType) params.serviceType = serviceType;
      
      const res = await apiClient.request('/services', { params });
      const fetchedServices = res?.data?.services || res?.data?.listings || [];
      setServices(fetchedServices);
    } catch (e) {
      console.error('Error fetching services:', e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const servicesByCity = groupByCity(services);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading services</h2>
            <p className="text-gray-600">Finding amazing experiences for you...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-foreground">
      <Header />
      <main className="flex-1 mt-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Summary */}
          {(searchParams.get('city') || searchParams.get('serviceType')) && (
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Filtered by:</span>
                {searchParams.get('city') && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                    <span className="text-purple-600">📍</span>
                    <span className="font-semibold text-gray-900">{searchParams.get('city')}</span>
                  </div>
                )}
                {searchParams.get('serviceType') && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                    <span className="text-purple-600">🔧</span>
                    <span className="font-semibold text-gray-900 capitalize">{searchParams.get('serviceType')?.replace('-', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {Object.keys(servicesByCity).length === 0 && (
            <div className="max-w-4xl mx-auto">
              {/* Modern No Services Design */}
              <div className="text-center py-16 px-6">
                {/* Animated Illustration */}
                <div className="relative mb-12">
                  <div className="w-40 h-40 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center relative">
                      <Wrench className="w-12 h-12 text-orange-600" />
                      {/* Floating elements */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                      <div className="absolute -bottom-1 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 -right-4 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                    </div>
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 -z-10">
                      <div className="absolute top-8 left-8 w-16 h-16 bg-orange-100 rounded-full opacity-30 animate-pulse"></div>
                      <div className="absolute bottom-8 right-8 w-12 h-12 bg-pink-100 rounded-full opacity-40 animate-bounce"></div>
                      <div className="absolute top-1/2 left-4 w-8 h-8 bg-red-100 rounded-full opacity-50 animate-ping"></div>
                    </div>
                  </div>
                </div>

                {/* Main Message */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
                  {searchParams.get('city') ? `No services found in ${searchParams.get('city')}` : 'No services found for your search'}
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {searchParams.get('city') 
                    ? `We couldn't find any services in ${searchParams.get('city')} for your selected criteria.`
                    : "We couldn't find any services matching your search criteria."
                  }
                </p>
              </div>

              {/* Search Summary Card */}
              {(searchParams.get('city') || searchParams.get('serviceType')) && (
                <div className="mb-12 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border border-orange-200 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Your Search Details
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {searchParams.get('city') && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-200">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-700 font-medium">{searchParams.get('city')}</span>
                      </div>
                    )}
                    {searchParams.get('serviceType') && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-pink-200">
                        <Wrench className="w-4 h-4 text-pink-600" />
                        <span className="text-pink-700 font-medium capitalize">{searchParams.get('serviceType')?.replace('-', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestions Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Try Different Service Type */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Try Different Service Type</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Explore other types of services that might be available in your area.</p>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                    onClick={() => router.push('/services')}
                  >
                    Browse All Services
                  </Button>
                </div>

                {/* Explore Nearby Areas */}
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Explore Nearby Areas</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Consider looking for services in nearby cities or regions.</p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                    onClick={() => router.push('/')}
                  >
                    Search Other Locations
                  </Button>
                </div>
              </div>

              {/* Popular Service Types */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Service Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Photography', 'Transportation', 'Tour Guide', 'Catering', 'Entertainment', 'Wellness', 'Adventure', 'Cultural'].map((serviceType) => (
                    <button
                      key={serviceType}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 text-center group"
                      onClick={() => router.push(`/services?serviceType=${serviceType.toLowerCase()}`)}
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                        {serviceType}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Destinations for Services */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Service Destinations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Jaipur', 'Kerala', 'Himachal Pradesh', 'Rajasthan'].map((destination) => (
                    <button
                      key={destination}
                      className="p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 text-center group"
                      onClick={() => router.push(`/services?city=${destination}`)}
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                        {destination}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                  onClick={() => router.push('/services')}
                >
                  Browse All Services
                </Button>
                <Button 
                  className="bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-xl font-semibold transition-all duration-200 text-lg"
                  onClick={() => router.push('/')}
                >
                  Start New Search
                </Button>
              </div>

              {/* Service Provider CTA */}
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 border border-orange-200">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">Are you a service provider?</h4>
                  <p className="text-gray-600 mb-6">Join our platform and start offering your services to travelers around the world.</p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <Button 
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      onClick={() => router.push('/become-host')}
                    >
                      <Compass className="w-4 h-4" />
                      Become a Service Provider
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Start earning from your expertise today!</p>
                </div>
              </div>
            </div>
          )}
          {Object.entries(servicesByCity).map(([city, services]) => (
            <section key={city} className="mb-12">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 font-heading">{city}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <ServiceCard 
                    key={service._id} 
                    service={service}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 