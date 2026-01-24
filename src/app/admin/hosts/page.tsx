"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  UserCheck,
  Search,
  Filter
} from 'lucide-react';

interface Host {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  role: string;
  createdAt: string;
  propertiesCount?: number;
  bookingsCount?: number;
  totalEarnings?: number;
  stats?: {
    properties: number;
    bookings: number;
    totalEarnings: number;
  };
  kyc?: {
    status: 'verified' | 'pending' | 'rejected' | 'not_submitted';
    submittedAt?: string;
  };
}

export default function AdminHosts() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAdminHosts();
        
        if (response.success && response.data?.hosts) {
          // Map the API response to match our interface
          const mappedHosts = response.data.hosts.map((host: any) => ({
            ...host,
            propertiesCount: host.stats?.properties || 0,
            bookingsCount: host.stats?.bookings || 0,
            totalEarnings: host.stats?.totalEarnings || 0,
            status: host.accountStatus || 'pending'
          }));
          setHosts(mappedHosts);
        } else {
          // Fallback to mock data if API fails
          console.warn('Admin hosts API failed, using fallback data');
          setHosts([]);
        }
      } catch (error) {
        console.error('Error fetching hosts:', error);
        // Fallback to empty array on error
        setHosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  const filteredHosts = hosts.filter(host => {
    const matchesSearch = host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         host.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || host.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Suspended
        </span>;
      default:
        return null;
    }
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <UserCheck className="w-3 h-3 mr-1" />
          Verified
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>;
      case 'not_submitted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Not Submitted
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Not Submitted
        </span>;
    }
  };

  const handleApprove = async (hostId: string) => {
    try {
      const response = await apiClient.approveHost(hostId);
      if (response.success) {
        // Update the host in the local state
                  setHosts(hosts.map(host => 
            host._id === hostId 
              ? { ...host, status: 'active' as const }
              : host
          ));
      }
    } catch (error) {
      console.error('Error approving host:', error);
    }
  };

  const handleReject = async (hostId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        const response = await apiClient.rejectHost(hostId, reason);
        if (response.success) {
          // Update the host in the local state
          setHosts(hosts.map(host => 
            host._id === hostId 
              ? { ...host, status: 'suspended' as const }
              : host
          ));
        }
      } catch (error) {
        console.error('Error rejecting host:', error);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Host Management
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Manage hosts and their verification status
                </p>
                <div className="mt-4 flex items-center gap-2 md:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      {filteredHosts.filter(h => h.status === 'active').length} Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      {filteredHosts.filter(h => h.status === 'pending').length} Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      {filteredHosts.filter(h => h.status === 'suspended').length} Suspended
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCheck className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search hosts by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-2 md:px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 min-w-[120px] md:min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Host Cards */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHosts.map((host) => (
              <div key={host._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <span className="text-xl font-bold text-white">{host.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{host.name}</h3>
                    <p className="text-sm text-gray-500">{host.email}</p>
                  </div>
                  {getStatusBadge(host.status)}
                </div>

              
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">KYC Status</span>
                    {getKYCStatusBadge(host.kyc?.status || 'pending')}
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Listings</span>
                    <span className="text-sm font-semibold text-gray-900">{host.propertiesCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Total Earnings</span>
                    <span className="text-sm font-semibold text-green-600">₹{(host.totalEarnings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">Bookings</span>
                    <span className="text-sm font-semibold text-gray-900">{host.bookingsCount || 0}</span>
                  </div>
                </div>

              
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleView(host._id)}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  {host.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(host._id)}
                        className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors shadow-md hover:shadow-lg"
                        title="Approve Host"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(host._id)}
                        className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors shadow-md hover:shadow-lg"
                        title="Reject Host"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
  {filteredHosts.map((host) => (
    <div 
      key={host._id} 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 group"
    >
      {/* 1. Header: More compact on mobile */}
      <div className="flex items-start justify-between gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
            <span className="text-lg md:text-xl font-bold text-white uppercase">
              {host.name.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
              {host.name}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 truncate">{host.email}</p>
          </div>
        </div>
        <div className="shrink-0">
          {getStatusBadge(host.status)}
        </div>
      </div>

      {/* 2. Host Details: 2-column grid on mobile to save vertical space */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="col-span-2 flex items-center justify-between p-2.5 bg-purple-50/50 rounded-xl border border-purple-100/50">
          <span className="text-[10px] md:text-sm font-medium text-gray-600 uppercase tracking-wider">KYC Status</span>
          {getKYCStatusBadge(host.kyc?.status || 'pending')}
        </div>
        
        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Listings</p>
          <p className="text-sm font-bold text-gray-900">{host.propertiesCount || 0}</p>
        </div>

        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Bookings</p>
          <p className="text-sm font-bold text-gray-900">{host.bookingsCount || 0}</p>
        </div>

        <div className="col-span-2 p-2.5 bg-green-50/50 rounded-xl border border-green-100">
          <div className="flex justify-between items-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Earnings</p>
            <p className="text-sm font-bold text-green-600">₹{(host.totalEarnings || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons: Responsive sizing */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleView(host._id)}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden xs:inline">View Details</span>
          <span className="xs:hidden">View</span>
        </button>

        {host.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApprove(host._id)}
              className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 active:scale-90 transition-all shadow-sm"
              title="Approve Host"
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleReject(host._id)}
              className="p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 active:scale-90 transition-all shadow-sm"
              title="Reject Host"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  ))}
</div>

          {/* Empty State */}
          {filteredHosts.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hosts Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No hosts have registered yet.'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 