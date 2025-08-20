'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/core/store/auth-context';
import AdminLayout from '@/components/layouts/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  DollarSign, 
  CreditCard, 
  Clock,
  Receipt
} from 'lucide-react';

interface Payment {
  id: string;
  transactionId: string;
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
  listingTitle: string;
  amount: number;
  platformFee: number;
  hostEarning: number;
  status: string;
  paymentDate: string;
  payout: any;
  refunds: any[];
  totalRefunded: number;
  netAmount: number;
  payoutAmount: number;
  paymentMethod: string;
  bookingId: string;
  bookingDates: {
    checkIn: string;
    checkOut: string;
  } | null;
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
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/payments/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.data.payments || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch('/api/payments/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
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

  const formatDate = (dateString: string) => {
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Payment Management</h1>
            <p className="text-slate-600 mt-2">Monitor all payments, platform fees, and host payouts</p>
          </div>
          <Button onClick={exportPayments} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Revenue</h3>
                <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalAmount)}</div>
                <p className="text-xs text-slate-500">{stats.totalPayments} payments</p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Platform Fees</h3>
                <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.platformFees)}</div>
                <p className="text-xs text-slate-500">15% of total revenue</p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Pending Payouts</h3>
                <div className="text-2xl font-bold text-slate-800">{stats.pendingPayouts}</div>
                <p className="text-xs text-slate-500">Awaiting processing</p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-2">Total Refunds</h3>
                <div className="text-2xl font-bold text-slate-800">{formatCurrency(stats.refundAmount)}</div>
                <p className="text-xs text-slate-500">{stats.totalRefunds} refunds</p>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by transaction ID, guest name, or host name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card>
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold text-slate-800">Payment Transactions</h3>
          </div>
          <div className="p-6 pt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Transaction</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Guest</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Host</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Platform Fee</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-sm text-slate-800">{payment.transactionId}</div>
                            <div className="text-xs text-slate-500">{payment.bookingId}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-800">{payment.guestName}</div>
                            <div className="text-xs text-slate-500">{payment.guestEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-800">{payment.hostName}</div>
                            <div className="text-xs text-slate-500">{payment.hostEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{formatCurrency(payment.amount)}</div>
                          {payment.totalRefunded > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              -{formatCurrency(payment.totalRefunded)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{formatCurrency(payment.platformFee)}</div>
                          <div className="text-xs text-slate-500">
                            Host: {formatCurrency(payment.hostEarning)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-800">{formatDate(payment.paymentDate)}</div>
                          {payment.bookingDates && (
                            <div className="text-xs text-slate-500">
                              {formatDate(payment.bookingDates.checkIn)} - {formatDate(payment.bookingDates.checkOut)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentClick(payment)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

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
                    <span className="text-slate-700">Platform Fee (15%)</span>
                    <span className="font-medium text-slate-800">{formatCurrency(selectedPayment.platformFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Host Earning</span>
                    <span className="font-medium text-green-600">{formatCurrency(selectedPayment.hostEarning)}</span>
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