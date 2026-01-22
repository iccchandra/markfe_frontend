import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Download, Search, Eye, RefreshCw, CheckCircle, 
  Clock, XCircle, AlertCircle, CreditCard, FileText 
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '../../components/common/Table/Table';
import { Badge } from '../../components/common/Badge/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { apiService } from '../../services/api.service';

interface Payment {
  _id: string;
  transactionId: string;
  bookingNumber: string;
  applicantName: string;
  venue: string;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  paymentGateway: 'razorpay' | 'paytm' | 'phonepe';
  status: 'success' | 'pending' | 'failed' | 'refund_initiated' | 'refunded';
  transactionDate: Date;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PaymentsManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayments: Payment[] = [
        {
          _id: '1',
          transactionId: 'TXN20250115001',
          bookingNumber: 'BPP20250115001',
          applicantName: 'John Doe',
          venue: 'Peoples Plaza',
          amount: 429000,
          paymentMethod: 'card',
          paymentGateway: 'razorpay',
          status: 'success',
          transactionDate: new Date('2025-01-15T10:30:00'),
          razorpayPaymentId: 'pay_123456789',
          razorpayOrderId: 'order_abc123',
          createdAt: new Date('2025-01-15T10:30:00'),
          updatedAt: new Date('2025-01-15T10:30:00'),
        },
        {
          _id: '2',
          transactionId: 'TXN20250115002',
          bookingNumber: 'BPP20250115002',
          applicantName: 'Jane Smith',
          venue: 'Lumbini Park',
          amount: 22880,
          paymentMethod: 'upi',
          paymentGateway: 'razorpay',
          status: 'pending',
          transactionDate: new Date('2025-01-15T11:45:00'),
          razorpayPaymentId: 'pay_987654321',
          razorpayOrderId: 'order_xyz789',
          createdAt: new Date('2025-01-15T11:45:00'),
          updatedAt: new Date('2025-01-15T11:45:00'),
        },
        {
          _id: '3',
          transactionId: 'TXN20250115003',
          bookingNumber: 'BPP20250115003',
          applicantName: 'Mike Johnson',
          venue: 'Necklace Road',
          amount: 14300,
          paymentMethod: 'netbanking',
          paymentGateway: 'razorpay',
          status: 'success',
          transactionDate: new Date('2025-01-15T14:20:00'),
          razorpayPaymentId: 'pay_456789123',
          razorpayOrderId: 'order_def456',
          createdAt: new Date('2025-01-15T14:20:00'),
          updatedAt: new Date('2025-01-15T14:20:00'),
        },
        {
          _id: '4',
          transactionId: 'TXN20250114004',
          bookingNumber: 'BPP20250114004',
          applicantName: 'Sarah Williams',
          venue: 'Sanjeevaiah Park',
          amount: 25025,
          paymentMethod: 'card',
          paymentGateway: 'razorpay',
          status: 'failed',
          transactionDate: new Date('2025-01-14T09:15:00'),
          razorpayPaymentId: 'pay_789123456',
          createdAt: new Date('2025-01-14T09:15:00'),
          updatedAt: new Date('2025-01-14T09:15:00'),
        },
        {
          _id: '5',
          transactionId: 'TXN20250113005',
          bookingNumber: 'BPP20250113005',
          applicantName: 'Robert Brown',
          venue: 'Peoples Plaza',
          amount: 457600,
          paymentMethod: 'upi',
          paymentGateway: 'razorpay',
          status: 'refund_initiated',
          transactionDate: new Date('2025-01-13T16:50:00'),
          razorpayPaymentId: 'pay_321654987',
          razorpayOrderId: 'order_ghi789',
          refundAmount: 457600,
          refundReason: 'Booking cancelled by user',
          createdAt: new Date('2025-01-13T16:50:00'),
          updatedAt: new Date('2025-01-14T10:00:00'),
        },
        {
          _id: '6',
          transactionId: 'TXN20250112006',
          bookingNumber: 'BPP20250112006',
          applicantName: 'Emily Davis',
          venue: 'Lumbini Park',
          amount: 21000,
          paymentMethod: 'wallet',
          paymentGateway: 'paytm',
          status: 'refunded',
          transactionDate: new Date('2025-01-12T13:30:00'),
          razorpayPaymentId: 'pay_111222333',
          refundAmount: 21000,
          refundDate: new Date('2025-01-13T15:00:00'),
          refundReason: 'Venue unavailable',
          createdAt: new Date('2025-01-12T13:30:00'),
          updatedAt: new Date('2025-01-13T15:00:00'),
        },
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      success: 'success',
      pending: 'warning',
      failed: 'danger',
      refund_initiated: 'warning',
      refunded: 'default',
    };
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      refund_initiated: <RefreshCw className="w-3 h-3" />,
      refunded: <CheckCircle className="w-3 h-3" />,
    };
    const labels: Record<string, string> = {
      success: 'Success',
      pending: 'Pending',
      failed: 'Failed',
      refund_initiated: 'Refund Initiated',
      refunded: 'Refunded',
    };
    return (
      <Badge variant={variants[status]}>
        <div className="flex items-center gap-1">
          {icons[status]}
          {labels[status]}
        </div>
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const labels: Record<string, string> = {
      card: 'Card',
      upi: 'UPI',
      netbanking: 'Net Banking',
      wallet: 'Wallet',
    };
    return (
      <Badge variant="default">
        {labels[method] || method}
      </Badge>
    );
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleInitiateRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount.toString());
    setRefundReason('');
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async () => {
    if (!selectedPayment || !refundReason.trim() || !refundAmount) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // await apiService.initiateRefund(selectedPayment._id, {
      //   amount: parseFloat(refundAmount),
      //   reason: refundReason
      // });
      
      // Update local state
      setPayments(payments.map(p => 
        p._id === selectedPayment._id 
          ? { 
              ...p, 
              status: 'refund_initiated', 
              refundAmount: parseFloat(refundAmount),
              refundReason 
            } 
          : p
      ));
      
      setShowRefundModal(false);
      setRefundReason('');
      setRefundAmount('');
      alert('Refund initiated successfully');
    } catch (error) {
      console.error('Failed to initiate refund:', error);
      alert('Failed to initiate refund');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterPaymentMethod === 'all' || payment.paymentMethod === filterPaymentMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate statistics
  const stats = {
    total: payments.length,
    success: payments.filter(p => p.status === 'success').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refundInitiated: payments.filter(p => p.status === 'refund_initiated').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalRevenue: payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0),
    totalRefunded: payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + (p.refundAmount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payments Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track and manage all payment transactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Transactions</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.success}</div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.failed}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-semibold text-gray-600">Total Revenue</div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            ₹{(stats.totalRevenue / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-gray-600 mt-1">From successful payments</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg shadow-sm border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-sm font-semibold text-gray-600">Total Refunded</div>
          </div>
          <div className="text-3xl font-black text-gray-900">
            ₹{(stats.totalRefunded / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-gray-600 mt-1">{stats.refunded} refund(s) processed</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-lg shadow-sm border border-yellow-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-sm font-semibold text-gray-600">Pending Refunds</div>
          </div>
          <div className="text-3xl font-black text-gray-900">{stats.refundInitiated}</div>
          <div className="text-xs text-gray-600 mt-1">Awaiting processing</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="success">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refund_initiated">Refund Initiated</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallet</option>
          </select>

          {/* Export Button */}
          <Button 
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Transaction ID</TableHeaderCell>
              <TableHeaderCell>Booking #</TableHeaderCell>
              <TableHeaderCell>Applicant</TableHeaderCell>
              <TableHeaderCell>Venue</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Method</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>
                  <div className="font-medium text-primary-600 font-mono text-sm">
                    {payment.transactionId}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {payment.bookingNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900">
                    {payment.applicantName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-700">
                    {payment.venue}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-gray-900">
                    ₹{payment.amount.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  {getPaymentMethodBadge(payment.paymentMethod)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(payment.status)}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {new Date(payment.transactionDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(payment.transactionDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payment)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      View
                    </Button>
                    {payment.status === 'success' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInitiateRefund(payment)}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                      >
                        Refund
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <CreditCard className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                  <div className="text-sm font-semibold text-primary-600 mt-1 font-mono">
                    {selectedPayment.transactionId}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedPayment.status)}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Transaction Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  Transaction Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">TRANSACTION ID</div>
                    <div className="text-sm font-mono font-semibold text-gray-900">{selectedPayment.transactionId}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">BOOKING NUMBER</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedPayment.bookingNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">PAYMENT METHOD</div>
                    <div className="text-sm text-gray-900 capitalize">{selectedPayment.paymentMethod}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">PAYMENT GATEWAY</div>
                    <div className="text-sm text-gray-900 capitalize">{selectedPayment.paymentGateway}</div>
                  </div>
                  {selectedPayment.razorpayPaymentId && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-600 mb-1">RAZORPAY PAYMENT ID</div>
                      <div className="text-sm font-mono text-gray-900">{selectedPayment.razorpayPaymentId}</div>
                    </div>
                  )}
                  {selectedPayment.razorpayOrderId && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-600 mb-1">RAZORPAY ORDER ID</div>
                      <div className="text-sm font-mono text-gray-900">{selectedPayment.razorpayOrderId}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Applicant & Venue Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  Booking Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">APPLICANT NAME</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedPayment.applicantName}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">VENUE</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedPayment.venue}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">AMOUNT PAID</div>
                    <div className="text-xl font-bold text-green-600">₹{selectedPayment.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">TRANSACTION DATE</div>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedPayment.transactionDate).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Information (if applicable) */}
              {(selectedPayment.status === 'refund_initiated' || selectedPayment.status === 'refunded') && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-orange-600" />
                    </div>
                    Refund Information
                  </h3>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-1">REFUND AMOUNT</div>
                        <div className="text-lg font-bold text-orange-600">
                          ₹{selectedPayment.refundAmount?.toLocaleString()}
                        </div>
                      </div>
                      {selectedPayment.refundDate && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">REFUND DATE</div>
                          <div className="text-sm text-gray-900">
                            {new Date(selectedPayment.refundDate).toLocaleDateString('en-IN', {
                              dateStyle: 'medium'
                            })}
                          </div>
                        </div>
                      )}
                      {selectedPayment.refundReason && (
                        <div className="col-span-2">
                          <div className="text-xs font-semibold text-gray-600 mb-1">REFUND REASON</div>
                          <div className="text-sm text-gray-900">{selectedPayment.refundReason}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Initiate Refund</h2>
                  <div className="text-sm text-gray-600 mt-1">
                    Transaction: {selectedPayment.transactionId}
                  </div>
                </div>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Important:</p>
                    <p>This action will initiate a refund to the customer's original payment method. Please ensure all details are correct before proceeding.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Original Amount
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{selectedPayment.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Amount *
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedPayment.amount}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter refund amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum refundable amount: ₹{selectedPayment.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Refund Reason *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  placeholder="Enter reason for refund (e.g., Booking cancelled by user, Venue unavailable, etc.)"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                  setRefundAmount('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRefundSubmit}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                disabled={!refundReason.trim() || !refundAmount || parseFloat(refundAmount) <= 0}
              >
                Initiate Refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PaymentsManagement;