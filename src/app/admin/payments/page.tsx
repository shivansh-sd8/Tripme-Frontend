'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/core/store/auth-context';
import AdminLayout from '@/components/layouts/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  DollarSign, 
  CreditCard, 
  Clock,
  Receipt,
  Users
} from 'lucide-react';

interface Payment {
  _id: string;
  id: string;
  booking: {
    _id: string;
    listing?: string;
    service?: string;
    status: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    receiptId: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  host: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  commission: {
    platformFee: number;
    hostEarning: number;
    processingFee: number;
  };
  pricingBreakdown: {
    platformBreakdown: {
      platformRevenue: number;
    };
  };
  status: string;
  createdAt: string;
  payout: {
    status: string;
    method: string;
  };
  totalRefunded: number;
  netAmount: number;
  payoutAmount: number;
  paymentMethod: string;
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  platformFees: number;
  netRevenue: number;
  pendingPayouts: number;
  totalPayouts: number;
  totalRefunds: number;
  refundAmount: number;
}

export default function AdminPaymentsPage() {
  const { user, isAdmin } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPayments();
      fetchPaymentStats();
    }
  }, [isAdmin, currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage.toString(),
        limit: '10'
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await apiClient.getAdminPayments(params);
      
      if (response.success && response.data) {
        setPayments(response.data.payments || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      // Calculate stats from payments data
      const response = await apiClient.getAdminPayments({ limit: '1000' });
      
      if (response.success && response.data) {
        const payments = response.data.payments || [];
        
        const stats = {
          totalPayments: payments.length,
          totalAmount: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
          platformFees: payments.reduce((sum, payment) => sum + (payment.commission?.platformFee || 0), 0),
          netRevenue: payments.reduce((sum, payment) => sum + (payment.pricingBreakdown?.platformBreakdown?.platformRevenue || 0), 0),
          pendingPayouts: payments.filter(p => p.payout?.status === 'pending').length,
          totalPayouts: payments.filter(p => p.payout?.status === 'completed').length,
          totalRefunds: payments.reduce((sum, payment) => sum + (payment.totalRefunded || 0), 0),
          refundAmount: payments.reduce((sum, payment) => sum + (payment.totalRefunded || 0), 0)
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      failed: 'bg-red-100 text-red-800 border border-red-200',
      refunded: 'bg-blue-100 text-blue-800 border border-blue-200',
      partially_refunded: 'bg-purple-100 text-purple-800 border border-purple-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: '✓',
      pending: '⏳',
      failed: '✗',
      refunded: '↩',
      partially_refunded: '↩'
    };
    return icons[status as keyof typeof icons] || '?';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const exportPayments = () => {
    console.log('Exporting payments...');
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h1>
            <p className="text-slate-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Payment Management
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Monitor all payments, platform fees, and host payouts
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Total: {formatCurrency(stats?.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Platform Fees: {formatCurrency(stats?.platformFees || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Pending: {stats?.pendingPayouts || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
                    <p className="text-xs text-gray-500">{stats.totalPayments} payments</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Platform Fees</h3>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.platformFees)}</div>
                    <p className="text-xs text-gray-500">Platform fee of total revenue</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Payouts</h3>
                    <div className="text-2xl font-bold text-gray-900">{stats.pendingPayouts}</div>
                    <p className="text-xs text-gray-500">Awaiting processing</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Total Refunds</h3>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.refundAmount)}</div>
                    <p className="text-xs text-gray-500">{stats.totalRefunds} refunds</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by transaction ID, guest name, or host name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                </select>
                <Button 
                  onClick={exportPayments} 
                  className="bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/70 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Payments Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Transactions</h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payments...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {payments.map((payment) => (
                  <div key={payment._id || payment.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Transaction #{payment._id?.slice(-8) || payment.id?.slice(-8) || 'N/A'}</h4>
                        <p className="text-sm text-gray-600">{payment.booking?._id || payment.booking?.receiptId || 'N/A'}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Guest Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{payment.user?.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Host Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{payment.host?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{payment.host?.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Property/Service */}
                      <div className="p-3 bg-gray-100/50 rounded-xl">
                        <p className="text-sm font-medium text-gray-900">Property/Service</p>
                        <p className="text-sm text-gray-600">
                          {payment.booking?.listing || payment.booking?.service || 'N/A'}
                        </p>
                      </div>

                      {/* Amount Breakdown */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">Total Amount</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                            {payment.totalRefunded > 0 && (
                              <div className="text-xs text-red-600">
                                -{formatCurrency(payment.totalRefunded)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600">Platform Fee</p>
                            <p className="text-sm font-semibold text-blue-600">{formatCurrency(payment.commission?.platformFee || 0)}</p>
                          </div>
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-600">Host Earning</p>
                            <p className="text-sm font-semibold text-purple-600">{formatCurrency(payment.commission?.hostEarning || 0)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Date Info */}
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                          {payment.booking?.checkIn && payment.booking?.checkOut && (
                            <p className="text-xs text-gray-600">
                              {formatDate(payment.booking.checkIn)} - {formatDate(payment.booking.checkOut)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2">
                        <Button
                          onClick={() => handlePaymentClick(payment)}
                          className="w-full bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 p-4 bg-gray-100/50 rounded-xl">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/70"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/70"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Detail Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Payment Details"
          size="lg"
        >
          {selectedPayment && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Transaction ID</label>
                  <p className="text-sm font-mono text-slate-800">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Amount</label>
                  <p className="text-lg font-bold text-slate-800">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Payment Method</label>
                  <p className="text-sm text-slate-800">{selectedPayment.paymentMethod}</p>
                </div>
              </div>

              {/* Guest & Host Info */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-medium text-slate-800 mb-3">Guest & Host Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Guest</label>
                    <p className="text-sm font-medium text-slate-800">{selectedPayment.guestName}</p>
                    <p className="text-xs text-slate-500">{selectedPayment.guestEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Host</label>
                    <p className="text-sm font-medium text-slate-800">{selectedPayment.hostName}</p>
                    <p className="text-xs text-slate-500">{selectedPayment.hostEmail}</p>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-medium text-slate-800 mb-3">Fee Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Platform Fee</span>
                    <span className="font-medium text-slate-800">{formatCurrency(selectedPayment.commission?.platformFee || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Host Earning</span>
                    <span className="font-medium text-green-600">{formatCurrency(selectedPayment.commission?.hostEarning || 0)}</span>
                  </div>
                  {selectedPayment.totalRefunded > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Total Refunded</span>
                      <span className="font-medium">-{formatCurrency(selectedPayment.totalRefunded)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="font-medium text-slate-800">Net Amount</span>
                    <span className="font-bold text-slate-800">{formatCurrency(selectedPayment.netAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
} 