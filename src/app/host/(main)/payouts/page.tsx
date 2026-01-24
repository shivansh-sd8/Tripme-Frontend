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
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Banknote,
  Wallet
} from 'lucide-react';

interface Payout {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'bank_transfer' | 'paypal' | 'stripe' | 'manual';
  scheduledDate: string;
  processedDate?: string;
  transactionId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  paypalDetails?: {
    email: string;
  };
  fees: number;
  netAmount: number;
  notes?: string;
  adminNotes?: string;
  booking: {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    listingTitle: string;
  };
}

interface PayoutStats {
  totalPayouts: number;
  totalAmount: number;
  pendingPayouts: number;
  completedPayouts: number;
  successRate: number;
  averagePayout: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
}

interface PayoutRequest {
  amount: number;
  reason: string;
  preferredMethod: 'bank_transfer' | 'paypal' | 'stripe';
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  paypalEmail?: string;
}

export default function HostPayoutsPage() {
  const { user, isHost } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [payoutRequest, setPayoutRequest] = useState<PayoutRequest>({
    amount: 0,
    reason: '',
    preferredMethod: 'bank_transfer'
  });

  useEffect(() => {
    if (isHost) {
      fetchPayouts();
      fetchPayoutStats();
    }
  }, [isHost, currentPage, searchTerm, statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/payouts/host?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tripme_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayouts(data.data.payouts || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutStats = async () => {
    try {
      const response = await fetch('/api/payments/host', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tripme_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.payoutStats);
      }
    } catch (error) {
      console.error('Error fetching payout stats:', error);
    }
  };

  const handlePayoutClick = (payout: Payout) => {
    setSelectedPayout(payout);
    setShowPayoutModal(true);
  };

  const handlePayoutRequest = async () => {
    try {
      const response = await fetch('/api/payouts/host/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tripme_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payoutRequest)
      });

      if (response.ok) {
        setShowRequestModal(false);
        setPayoutRequest({ amount: 0, reason: '', preferredMethod: 'bank_transfer' });
        fetchPayouts();
        fetchPayoutStats();
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      processing: Clock,
      completed: CheckCircle,
      failed: XCircle,
      cancelled: XCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const getMethodDisplay = (method: string) => {
    const methods = {
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal',
      stripe: 'Stripe',
      manual: 'Manual'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isHost) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need to be a host to access this page.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Payout Management</h1>
            <p className="text-gray-600 mt-2">Track your earnings and manage payouts</p>
          </div>
          <Button onClick={() => setShowRequestModal(true)} className="bg-green-600 hover:bg-green-700">
            Request Payout
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-2">
                <h3 className="text-sm font-medium">Total Payouts</h3>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPayouts} payouts
                </p>
              </div>
            </Card>

            <Card>
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-2">
                <h3 className="text-sm font-medium">Pending Payouts</h3>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stats.pendingPayouts}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting processing
                </p>
              </div>
            </Card>

            <Card>
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-2">
                <h3 className="text-sm font-medium">Success Rate</h3>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedPayouts} completed
                </p>
              </div>
            </Card>

            <Card>
              <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6 pb-2">
                <h3 className="text-sm font-medium">This Month</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
                <div className="flex items-center mt-1 text-sm">
                  {stats.growthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="pt-6 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by reference or guest name..."
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Payouts Table */}
        <Card>
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold">Payout History</h3>
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
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Reference</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Method</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Scheduled</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-sm">{payout.reference}</div>
                            <div className="text-xs text-gray-500">{payout.booking.listingTitle}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{formatCurrency(payout.amount)}</div>
                          <div className="text-xs text-gray-500">
                            Net: {formatCurrency(payout.netAmount)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getMethodDisplay(payout.method)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                            {getStatusIcon(payout.status)}
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{formatDate(payout.scheduledDate)}</div>
                          {payout.processedDate && (
                            <div className="text-xs text-gray-500">
                              Processed: {formatDate(payout.processedDate)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayoutClick(payout)}
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
                <div className="text-sm text-gray-700">
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

        {/* Payout Detail Modal */}
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Payout Details"
          size="lg"
        >
          {selectedPayout && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference</label>
                  <p className="text-sm font-mono">{selectedPayout.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayout.status)}`}>
                    {getStatusIcon(selectedPayout.status)}
                    {selectedPayout.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-lg font-bold">{formatCurrency(selectedPayout.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Method</label>
                  <p className="text-sm">{getMethodDisplay(selectedPayout.method)}</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guest</label>
                    <p className="text-sm">{selectedPayout.booking.guestName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Listing</label>
                    <p className="text-sm">{selectedPayout.booking.listingTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-in</label>
                    <p className="text-sm">{formatDate(selectedPayout.booking.checkIn)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-out</label>
                    <p className="text-sm">{formatDate(selectedPayout.booking.checkOut)}</p>
                  </div>
                </div>
              </div>

              {/* Payout Details */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Payout Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gross Amount</span>
                    <span className="font-medium">{formatCurrency(selectedPayout.amount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Fees</span>
                    <span className="font-medium">-{formatCurrency(selectedPayout.fees)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Amount</span>
                    <span className="font-bold text-green-600">{formatCurrency(selectedPayout.netAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              {selectedPayout.bankDetails && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Bank Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bank</label>
                      <p className="text-sm">{selectedPayout.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="text-sm font-mono">{selectedPayout.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                      <p className="text-sm font-mono">{selectedPayout.bankDetails.ifscCode}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayout.paypalDetails && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">PayPal Details</h4>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{selectedPayout.paypalDetails.email}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPayout.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedPayout.notes}</p>
                </div>
              )}

              {selectedPayout.adminNotes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Admin Notes</h4>
                  <p className="text-sm text-gray-600">{selectedPayout.adminNotes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Payout Request Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request Payout"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter amount to withdraw"
                value={payoutRequest.amount}
                onChange={(e) => setPayoutRequest({...payoutRequest, amount: Number(e.target.value)})}
                min="100"
                step="100"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: ₹100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <Input
                placeholder="Why are you requesting this payout?"
                value={payoutRequest.reason}
                onChange={(e) => setPayoutRequest({...payoutRequest, reason: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Method
              </label>
              <select
                value={payoutRequest.preferredMethod}
                onChange={(e) => setPayoutRequest({...payoutRequest, preferredMethod: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {payoutRequest.preferredMethod === 'bank_transfer' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <Input
                      placeholder="Account holder name"
                      value={payoutRequest.bankDetails?.accountHolderName || ''}
                      onChange={(e) => setPayoutRequest({
                        ...payoutRequest,
                        bankDetails: {
                          ...payoutRequest.bankDetails,
                          accountHolderName: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <Input
                      placeholder="Account number"
                      value={payoutRequest.bankDetails?.accountNumber || ''}
                      onChange={(e) => setPayoutRequest({
                        ...payoutRequest,
                        bankDetails: {
                          ...payoutRequest.bankDetails,
                          accountNumber: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <Input
                      placeholder="IFSC code"
                      value={payoutRequest.bankDetails?.ifscCode || ''}
                      onChange={(e) => setPayoutRequest({
                        ...payoutRequest,
                        bankDetails: {
                          ...payoutRequest.bankDetails,
                          ifscCode: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <Input
                      placeholder="Bank name"
                      value={payoutRequest.bankDetails?.bankName || ''}
                      onChange={(e) => setPayoutRequest({
                        ...payoutRequest,
                        bankDetails: {
                          ...payoutRequest.bankDetails,
                          bankName: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            {payoutRequest.preferredMethod === 'paypal' && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">PayPal Email</h4>
                <Input
                  type="email"
                  placeholder="PayPal email address"
                  value={payoutRequest.paypalEmail || ''}
                  onChange={(e) => setPayoutRequest({...payoutRequest, paypalEmail: e.target.value})}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handlePayoutRequest}
                disabled={!payoutRequest.amount || !payoutRequest.reason}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Submit Request
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRequestModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
