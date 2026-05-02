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
  Users,
  CheckCircle,
  Wallet,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface AdminPayout {
  _id: string;
  host: { _id: string; name: string; email: string };
  booking: { _id: string; totalAmount: number; checkIn: string; checkOut: string };
  payment: { _id: string; amount: number };
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
  method: string;
  scheduledDate: string;
  processedDate?: string;
  reference?: string;
  transactionId?: string;
  adminNotes?: string;
  fees: { netAmount: number };
  createdAt: string;
}

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
  const [activeTab, setActiveTab] = useState<'transactions' | 'host-payouts'>('transactions');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ── Host Payouts state ──
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('');
  const [confirmPayout, setConfirmPayout] = useState<AdminPayout | null>(null);
  const [confirmForm, setConfirmForm] = useState({ razorpayPayoutId: '', utrNumber: '', adminNotes: '' });
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchPayments();
      fetchPaymentStats();
    }
  }, [isAdmin, currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (isAdmin && activeTab === 'host-payouts') fetchAdminPayouts();
  }, [isAdmin, activeTab, payoutStatusFilter]);

  const fetchAdminPayouts = async () => {
    try {
      setPayoutsLoading(true);
      const params: any = { limit: '50' };
      if (payoutStatusFilter) params.status = payoutStatusFilter;
      const res = await apiClient.getAdminPayouts(params);
      if (res.success && res.data) setPayouts(res.data.payouts || []);
    } catch (e) {
      console.error('Error fetching admin payouts:', e);
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirmPayout) return;
    if (!confirmForm.razorpayPayoutId && !confirmForm.utrNumber) {
      setConfirmError('Please enter Razorpay Payout ID or UTR number.');
      return;
    }
    setConfirming(true);
    setConfirmError('');
    try {
      const res = await apiClient.confirmPayoutDone(confirmPayout._id, {
        razorpayPayoutId: confirmForm.razorpayPayoutId || undefined,
        utrNumber: confirmForm.utrNumber || undefined,
        adminNotes: confirmForm.adminNotes || undefined,
      });
      if (res.success) {
        setConfirmPayout(null);
        setConfirmForm({ razorpayPayoutId: '', utrNumber: '', adminNotes: '' });
        fetchAdminPayouts();
      } else {
        setConfirmError((res as any).message || 'Failed to confirm payout.');
      }
    } catch (e: any) {
      setConfirmError(e?.message || 'An error occurred.');
    } finally {
      setConfirming(false);
    }
  };

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

  const payoutStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      failed: 'bg-red-100 text-red-800 border border-red-200',
      cancelled: 'bg-gray-100 text-gray-700 border border-gray-200',
      reversed: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Payment Management
                </h1>
                <p className="mt-2 text-sm md:text-2xl text-gray-600">
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
          </div> */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6">
  <div className="flex items-start justify-between">
    <div className="w-full">
      {/* 1. Responsive Title - Smaller on mobile */}
      <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Payment Management
      </h1>
      
      {/* 2. Responsive Description - Fixed from 2xl to base for mobile */}
      <p className="mt-1 md:mt-2 text-xs md:text-lg text-gray-600 leading-relaxed max-w-2xl">
        Monitor all payments, platform fees, and host payouts
      </p>

      {/* 3. Legend Section - Wrapped for mobile, spaced for desktop */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* Total Stat */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          <span className="text-[11px] md:text-sm font-semibold text-gray-700">
            Total: <span className="text-gray-900">{formatCurrency(stats?.totalAmount || 0)}</span>
          </span>
        </div>

        {/* Platform Fees Stat */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
          <span className="text-[11px] md:text-sm font-semibold text-gray-700">
            Fees: <span className="text-gray-900">{formatCurrency(stats?.platformFees || 0)}</span>
          </span>
        </div>

        {/* Pending Stat */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
          <span className="text-[11px] md:text-sm font-semibold text-gray-700">
            Pending: <span className="text-gray-900">{stats?.pendingPayouts || 0}</span>
          </span>
        </div>
      </div>
    </div>

    {/* 4. Desktop-only Icon remains hidden on mobile */}
    <div className="hidden lg:block shrink-0 ml-6">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
        <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white" />
      </div>
    </div>
  </div>
</div>

          {/* Stats Cards */}
      {stats && (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
    {/* Total Revenue */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 md:p-6 hover:bg-white/90 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Icon at top */}
        <div className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-green-500/20">
          <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Revenue
            </h3>
            {/* Font size is lowered for mobile (text-base) and increased for tablet (text-xl) 
               'break-words' and 'whitespace-normal' ensure the number wraps if it's truly massive
            */}
            <div className="text-base sm:text-lg md:text-2xl font-black text-gray-900 leading-tight break-words whitespace-normal">
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>
          
          <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-2 border-t border-gray-100 pt-2">
            {stats.totalPayments} payments
          </p>
        </div>
      </div>
    </div>

    {/* Platform Fees */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 md:p-6 hover:bg-white/90 transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
          <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Fees
            </h3>
            <div className="text-base sm:text-lg md:text-2xl font-black text-gray-900 leading-tight break-words whitespace-normal">
              {formatCurrency(stats.platformFees)}
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-2 border-t border-gray-100 pt-2">
            Platform cut
          </p>
        </div>
      </div>
    </div>

    {/* Pending Payouts */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 md:p-6 hover:bg-white/90 transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/20">
          <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Pending
            </h3>
            <div className="text-base sm:text-lg md:text-2xl font-black text-gray-900 leading-tight">
              {stats.pendingPayouts}
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-2 border-t border-gray-100 pt-2">
            Awaiting
          </p>
        </div>
      </div>
    </div>

    {/* Total Refunds */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 md:p-6 hover:bg-white/90 transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-red-500/20">
          <Receipt className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Refunds
            </h3>
            <div className="text-base sm:text-lg md:text-2xl font-black text-gray-900 leading-tight break-words whitespace-normal">
              {formatCurrency(stats.refundAmount)}
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-2 border-t border-gray-100 pt-2">
            {stats.totalRefunds} cases
          </p>
        </div>
      </div>
    </div>
  </div>
)}
          {/* Enhanced Filters */}
         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6">
  {/* Changed to flex-col for mobile, lg:flex-row for desktop */}
  <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
    
    {/* Search Input - Full width on mobile */}
    <div className="flex-1">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-500 transition-colors" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm md:text-base text-gray-900 placeholder:text-gray-400 shadow-sm"
        />
      </div>
    </div>

    {/* Actions Section - Grid layout for perfectly even buttons on mobile */}
    <div className="grid grid-cols-2 lg:flex items-center gap-3 md:gap-4">
      
      {/* Status Filter */}
      <div className="relative flex items-center">
        <Filter className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full lg:w-auto pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm text-gray-900 appearance-none shadow-sm cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially</option>
        </select>
      </div>

      {/* Export Button */}
      <Button 
        onClick={exportPayments} 
        className="w-full lg:w-auto bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white/70 flex items-center justify-center gap-2 py-3 rounded-xl shadow-sm active:scale-95 transition-all"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export</span>
      </Button>
      
    </div>
  </div>
</div>
          {/* ── Tab switcher ── */}
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-2">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Payment Transactions
            </button>
            <button
              onClick={() => setActiveTab('host-payouts')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'host-payouts'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Host Payouts
              {payouts.filter(p => p.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {payouts.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* ── HOST PAYOUTS TAB ── */}
          {activeTab === 'host-payouts' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Host Payouts</h3>
                  <p className="text-sm text-gray-500 mt-1">After processing payment via Razorpay dashboard, confirm it here.</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={payoutStatusFilter}
                    onChange={e => setPayoutStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button onClick={fetchAdminPayouts} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${payoutsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {payoutsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                </div>
              ) : payouts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No payouts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-3 font-semibold text-gray-600">Host</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-600">Scheduled</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-600">Reference</th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {payouts.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-semibold text-gray-900">{p.host?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{p.host?.email}</p>
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-gray-900">₹{p.fees?.netAmount?.toLocaleString() ?? p.amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Gross: ₹{p.amount?.toLocaleString()}</p>
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase ${payoutStatusBadge(p.status)}`}>
                              {p.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                              {p.status === 'pending' && <Clock className="w-3 h-3" />}
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {p.reference ? (
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{p.reference}</span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {(p.status === 'pending' || p.status === 'processing') ? (
                              <button
                                onClick={() => { setConfirmPayout(p); setConfirmError(''); setConfirmForm({ razorpayPayoutId: '', utrNumber: '', adminNotes: '' }); }}
                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Confirm Payment
                              </button>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENT TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6">
  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Payment Transactions</h3>
  
  {loading ? (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600">Loading payments...</p>
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {payments.map((payment) => (
        <div key={payment._id || payment.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white/40 p-4 md:p-6 hover:shadow-xl transition-all duration-300 flex flex-col">
          
          {/* Header: ID & Status */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="min-w-0">
              <h4 className="text-sm md:text-base font-bold text-gray-900 truncate">
                #{payment._id?.slice(-8) || payment.id?.slice(-8) || 'N/A'}
              </h4>
              <p className="text-[10px] md:text-xs text-gray-500 font-mono truncate">
                Booking: {payment.booking?._id || payment.booking?.receiptId || 'N/A'}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(payment.status)}`}>
              {getStatusIcon(payment.status)}
              {payment.status}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Parties Info - Stacked neatly */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{payment.user?.name || 'N/A'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{payment.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{payment.host?.name || 'N/A'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{payment.host?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Property/Service */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Service Details</p>
              <p className="text-xs text-gray-700 leading-snug line-clamp-1">
                {payment.booking?.listing || payment.booking?.service || 'N/A'}
              </p>
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                <span className="text-xs font-bold text-green-800 uppercase">Total</span>
                <div className="text-right">
                  <span className="text-base font-black text-green-600">{formatCurrency(payment.amount)}</span>
                  {payment.totalRefunded > 0 && (
                    <div className="text-[10px] font-bold text-red-500">
                      -{formatCurrency(payment.totalRefunded)} Refund
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Fee</p>
                  <p className="text-xs font-bold text-blue-600">{formatCurrency(payment.commission?.platformFee || 0)}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-[9px] font-bold text-purple-400 uppercase">Host</p>
                  <p className="text-xs font-bold text-purple-600">{formatCurrency(payment.commission?.hostEarning || 0)}</p>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="flex items-start space-x-2 pt-1">
              <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-700">{formatDate(payment.createdAt)}</p>
                {payment.booking?.checkIn && (
                  <p className="text-[10px] text-gray-500 italic">
                    Sched: {formatDate(payment.booking.checkIn)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-5">
            <Button
              onClick={() => handlePaymentClick(payment)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-bold">View Full Receipt</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Pagination - Mobile Stacked, Tablet Row */}
  {totalPages > 1 && (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 p-4 bg-gray-50 rounded-2xl gap-4">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Page <span className="text-gray-900">{currentPage}</span> / {totalPages}
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex-1 sm:flex-none bg-white border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex-1 sm:flex-none bg-white border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  )}
</div>
          )}
        </div>

        {/* ── Confirm Payout Modal ── */}
        <Modal
          isOpen={!!confirmPayout}
          onClose={() => { setConfirmPayout(null); setConfirmError(''); }}
          title="Confirm Host Payment"
          size="lg"
        >
          {confirmPayout && (
            <div className="space-y-5">
              {/* Host & amount summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{confirmPayout.host?.name}</p>
                  <p className="text-sm text-gray-500">{confirmPayout.host?.email}</p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    ₹{(confirmPayout.fees?.netAmount ?? confirmPayout.amount)?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">Net payout amount</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Transfer the amount via <strong>Razorpay Dashboard</strong> first, then enter the reference below to mark it as completed.</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Razorpay Payout ID <span className="text-gray-400 font-normal">(e.g. pout_XXXXXXXXXX)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="pout_QAB1234XYZ"
                    value={confirmForm.razorpayPayoutId}
                    onChange={e => setConfirmForm(f => ({ ...f, razorpayPayoutId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    UTR / Bank Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 421234567890"
                    value={confirmForm.utrNumber}
                    onChange={e => setConfirmForm(f => ({ ...f, utrNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Admin Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="e.g. Transferred via IMPS on 2 May 2026"
                    value={confirmForm.adminNotes}
                    onChange={e => setConfirmForm(f => ({ ...f, adminNotes: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>

              {confirmError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {confirmError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {confirming ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {confirming ? 'Confirming...' : 'Mark as Paid'}
                </button>
                <button
                  onClick={() => { setConfirmPayout(null); setConfirmError(''); }}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>

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