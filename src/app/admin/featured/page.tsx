"use client";
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import {
  Star,
  Zap,
  Search,
  Home,
  Eye,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Megaphone,
  BarChart2,
  Filter,
} from 'lucide-react';

interface Listing {
  id: string;
  _id: string;
  title: string;
  type: string;
  host: {
    name: string;
    email: string;
  };
  status: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
  };
  isFeatured: boolean;
  isSponsored: boolean;
  rating?: {
    average: number;
  };
  reviewCount?: number;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  createdAt: string;
}

type TabType = 'all' | 'featured' | 'sponsored';

// Toggle switch component
const Toggle = ({
  enabled,
  onChange,
  loading,
}: {
  enabled: boolean;
  onChange: () => void;
  loading?: boolean;
}) => (
  <button
    onClick={onChange}
    disabled={loading}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${enabled
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 focus:ring-purple-400'
        : 'bg-slate-300 focus:ring-slate-400'
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    aria-checked={enabled}
    role="switch"
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
      </span>
    )}
  </button>
);

// Stat card
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-5 flex items-center gap-4">
    <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center shadow-inner shrink-0`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function AdminFeaturedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [togglingIds, setTogglingIds] = useState<Record<string, 'featured' | 'sponsored' | null>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAdminListings();
      if (response.success && response.data) {
        setListings(response.data.properties || []);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleToggleFeatured = async (listing: Listing) => {
    const id = listing._id || listing.id;
    setTogglingIds((prev) => ({ ...prev, [id]: 'featured' }));
    try {
      const newValue = !listing.isFeatured;
      const response = await apiClient.setAdminListingFeatured(id, newValue);
      if (response.success) {
        setListings((prev) =>
          prev.map((l) =>
            (l._id || l.id) === id ? { ...l, isFeatured: newValue } : l
          )
        );
        showToast(
          newValue
            ? `"${listing.title}" marked as Featured ⭐`
            : `"${listing.title}" removed from Featured`
        );
      } else {
        showToast(response.message || 'Failed to update featured status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error — please try again', 'error');
    } finally {
      setTogglingIds((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleToggleSponsored = async (listing: Listing) => {
    const id = listing._id || listing.id;
    setTogglingIds((prev) => ({ ...prev, [id]: 'sponsored' }));
    try {
      const newValue = !listing.isSponsored;
      const response = await apiClient.setAdminListingSponsored(id, newValue);
      if (response.success) {
        setListings((prev) =>
          prev.map((l) =>
            (l._id || l.id) === id ? { ...l, isSponsored: newValue } : l
          )
        );
        showToast(
          newValue
            ? `"${listing.title}" marked as Sponsored ⚡`
            : `"${listing.title}" removed from Sponsored`
        );
      } else {
        showToast(response.message || 'Failed to update sponsored status', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error — please try again', 'error');
    } finally {
      setTogglingIds((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleView = (listingId: string) => {
    window.open(`/rooms/${listingId}`, '_blank');
  };

  // Derived stats
  const totalListings = listings.length;
  const featuredCount = listings.filter((l) => l.isFeatured).length;
  const sponsoredCount = listings.filter((l) => l.isSponsored).length;
  const publishedCount = listings.filter((l) => l.status === 'published').length;

  // Filter logic
  const filtered = listings.filter((listing) => {
    const matchesSearch =
      (listing.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.host?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'featured' && listing.isFeatured) ||
      (activeTab === 'sponsored' && listing.isSponsored);

    const matchesStatus =
      statusFilter === 'all' || listing.status === statusFilter;

    return matchesSearch && matchesTab && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-200 border-t-purple-600" />
            <p className="text-gray-500 font-medium">Loading listings…</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Featured & Sponsored
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Control which properties appear as Featured or Sponsored across the platform.
                </p>
              </div>
              <button
                onClick={fetchListings}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* ── Stat Cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Listings" value={totalListings} icon={Home} color="text-indigo-600" bg="bg-indigo-100" />
            <StatCard label="Published" value={publishedCount} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            <StatCard label="Featured" value={featuredCount} icon={Star} color="text-amber-600" bg="bg-amber-100" />
            <StatCard label="Sponsored" value={sponsoredCount} icon={Zap} color="text-purple-600" bg="bg-purple-100" />
          </div>

          {/* ── Tabs + Search + Filter ───────────────────────────── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5">
            {/* Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto">
              {(
                [
                  { key: 'all', label: 'All Listings', icon: BarChart2, count: totalListings },
                  { key: 'featured', label: 'Featured', icon: Star, count: featuredCount },
                  { key: 'sponsored', label: 'Sponsored', icon: Megaphone, count: sponsoredCount },
                ] as const
              ).map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === key
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === key ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by title, host, or city…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 text-sm min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Legend ───────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-4 px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
              <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500" /> Featured — shows in "Featured Properties" section
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-500" /> Sponsored — promoted with "Sponsored" badge
              </span>
            </div>
          </div>

          {/* ── Listing Cards ─────────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-10 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No listings found</h3>
              <p className="text-gray-400 text-sm">
                {searchTerm || statusFilter !== 'all' || activeTab !== 'all'
                  ? 'Try adjusting your filters or search term.'
                  : 'No property listings have been created yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((listing) => {
                const id = listing._id || listing.id;
                const primaryImage = listing.images?.find((img) => img.isPrimary)?.url || listing.images?.[0]?.url;
                const isFeaturedToggling = togglingIds[id] === 'featured';
                const isSponsoredToggling = togglingIds[id] === 'sponsored';

                return (
                  <div
                    key={id}
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl group flex flex-col overflow-hidden ${listing.isFeatured && listing.isSponsored
                        ? 'border-gradient-to-r border-purple-300'
                        : listing.isFeatured
                          ? 'border-amber-300'
                          : listing.isSponsored
                            ? 'border-purple-300'
                            : 'border-white/20 hover:border-gray-200'
                      }`}
                  >
                    {/* Card top gradient bar */}
                    <div
                      className={`h-1.5 w-full ${listing.isFeatured && listing.isSponsored
                          ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500'
                          : listing.isFeatured
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                            : listing.isSponsored
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-gray-200 to-gray-100'
                        }`}
                    />

                    <div className="p-5 flex flex-col flex-1 gap-4">
                      {/* Header: icon + title + status chips */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center shadow-md ${listing.isFeatured
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            }`}
                        >
                          {primaryImage ? (
                            <img src={primaryImage} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Home className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize truncate">{listing.type}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {/* Status */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${listing.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : listing.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                            >
                              {listing.status === 'published' ? (
                                <CheckCircle className="w-2.5 h-2.5" />
                              ) : (
                                <XCircle className="w-2.5 h-2.5" />
                              )}
                              {listing.status}
                            </span>
                            {listing.isFeatured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                                <Star className="w-2.5 h-2.5" /> Featured
                              </span>
                            )}
                            {listing.isSponsored && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                                <Zap className="w-2.5 h-2.5" /> Sponsored
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Host</p>
                          <p className="font-semibold text-gray-800 truncate">{listing.host?.name || '—'}</p>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] uppercase font-bold text-gray-400">Price</p>
                          <p className="font-bold text-green-600">₹{(listing.pricing?.basePrice || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 col-span-2 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <p className="font-semibold text-gray-800 truncate">
                            {[listing.location?.city, listing.location?.state].filter(Boolean).join(', ') || '—'}
                          </p>
                          {listing.rating?.average ? (
                            <span className="ml-auto flex items-center gap-1 text-amber-500 font-bold">
                              <TrendingUp className="w-3 h-3" />
                              {listing.rating.average.toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Toggle controls */}
                      <div className="mt-auto space-y-3 pt-3 border-t border-gray-100">
                        {/* Featured toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${listing.isFeatured ? 'bg-amber-100' : 'bg-gray-100'}`}>
                              <Star className={`w-4 h-4 ${listing.isFeatured ? 'text-amber-500' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Featured</p>
                              <p className="text-[10px] text-gray-400">Show in featured section</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={listing.isFeatured}
                            onChange={() => handleToggleFeatured(listing)}
                            loading={isFeaturedToggling}
                          />
                        </div>

                        {/* Sponsored toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${listing.isSponsored ? 'bg-purple-100' : 'bg-gray-100'}`}>
                              <Zap className={`w-4 h-4 ${listing.isSponsored ? 'text-purple-500' : 'text-gray-400'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Sponsored</p>
                              <p className="text-[10px] text-gray-400">Show with sponsor badge</p>
                            </div>
                          </div>
                          <Toggle
                            enabled={listing.isSponsored}
                            onChange={() => handleToggleSponsored(listing)}
                            loading={isSponsoredToggling}
                          />
                        </div>
                      </div>

                      {/* View button */}
                      <button
                        onClick={() => handleView(id)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        View Property
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Toast Notification ─────────────────────────────────── */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-slide-up ${toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-rose-600'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            {toast.message}
          </div>
        )}

        <style jsx>{`
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
      </div>
    </AdminLayout>
  );
}