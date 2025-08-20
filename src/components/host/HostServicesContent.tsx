"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { Briefcase, Edit, Eye, Trash2, Plus, Search, Filter, MoreHorizontal, CheckCircle, XCircle, Clock, AlertCircle, MapPin, Users, ArrowLeft, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Service } from '@/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface HostService extends Omit<Service, 'createdAt' | 'updatedAt' | 'media'> {
  _id: string;
  status: 'draft' | 'published' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
  media: { url: string; type: 'image' | 'video'; caption?: string }[];
}

const HostServicesContent: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<HostService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMyServices();
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.services) {
          setServices(data.services);
        } else {
          setError('Failed to load services');
        }
      } else {
        setError('Failed to load services');
      }
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await apiClient.deleteService(serviceId);
      if (response.success) {
        setServices(prev => prev.filter(service => service._id !== serviceId));
      } else {
        alert('Failed to delete service');
      }
    } catch (err: any) {
      console.error('Error deleting service:', err);
      alert(err?.message || 'Failed to delete service');
    }
  };

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateService(serviceId, { status: newStatus });
      if (response.success) {
        setServices(prev => prev.map(service => 
          service._id === serviceId 
            ? { ...service, status: newStatus as any }
            : service
        ));
      } else {
        alert('Failed to update service status');
      }
    } catch (err: any) {
      console.error('Error updating service status:', err);
      alert(err?.message || 'Failed to update service status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'price':
          return (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your services</h2>
            <p className="text-gray-600">Gathering your service information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchServices} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-display">
                    My Services
                  </h1>
                  <p className="text-gray-600 font-body">Manage your services and experiences</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/host/dashboard')}
                variant="outline"
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/host/service/new')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900">{services.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {services.filter(s => s.status === 'published').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {services.filter(s => s.status === 'draft').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {services.filter(s => s.status === 'published').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </div>
              Search & Filter
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search services by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                  className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="updatedAt">Recently Updated</option>
                  <option value="title">Title A-Z</option>
                  <option value="price">Price High-Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {services.length === 0 
                ? "You haven't created any services yet. Start by adding your first service to begin earning."
                : "No services match your current filters. Try adjusting your search criteria."
              }
            </p>
            <Button 
              onClick={() => router.push('/host/service/new')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Service
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <Card 
                key={service._id} 
                className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={service.media[0]?.url || '/placeholder-service.jpg'}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-emerald-600 font-bold text-sm">₹</span>
                      <span className="text-xs font-semibold ml-1">{formatPrice(service.pricing?.basePrice || 0).replace('₹', '')}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">{service.title}</h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{service.location.city}, {service.location.state}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-purple-600" />
                        <span>Max {service.groupSize?.max || 1}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-purple-600" />
                        <span>{service.duration ? `${service.duration.value} ${service.duration.unit}` : 'Flexible'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatPrice(service.pricing?.basePrice || 0)}
                      </p>
                      <p className="text-xs text-gray-600">per service</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6 p-3 bg-gray-50/50 rounded-xl">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6 p-3 bg-gray-50/50 rounded-xl">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-purple-600" />
                      Created {formatDate(service.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-purple-600" />
                      {formatDate(service.updatedAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200"
                      onClick={() => router.push(`/host/service/${service._id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200"
                      onClick={() => router.push(`/host/service/${service._id}/availability`)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Set Availability
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200"
                      onClick={() => router.push(`/services/${service._id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>

                  {/* Status Actions */}
                  {service.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleStatusChange(service._id, 'published')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publish Service
                    </Button>
                  )}
                  {service.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleStatusChange(service._id, 'draft')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Unpublish Service
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostServicesContent; 