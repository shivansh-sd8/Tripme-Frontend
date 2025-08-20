"use client";
import React, { useEffect, useState } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { apiClient } from '@/lib/api';
import ServiceCard from '@/components/services/ServiceCard';

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
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.request('/services');
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center font-display">All Services by City</h1>
          {Object.keys(servicesByCity).length === 0 && (
            <div className="text-center text-gray-500 py-20 text-xl">No services found.</div>
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