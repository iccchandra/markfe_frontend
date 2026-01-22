import React, { useState } from 'react';
import {
  Search,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import paymentVerificationService from '../../services/payment-verification.service';
import { PaymentStatusDetail } from '../../types/payment.types';

/**
 * Beneficiary Search Component
 * Search for specific beneficiary and view all their payments
 */

interface PaymentCardProps {
  payment: PaymentStatusDetail;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED_AND_PAID':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Paid Successfully
          </span>
        );
      case 'APPROVED_NOT_PAID':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Not Paid
          </span>
        );
      case 'APPROVED_BUT_FAILED':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Payment Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {status}
          </span>
        );
    }
  };

  const getStageBadge = (stage: string) => {
    const colors: { [key: string]: string } = {
      PENNY_DROP: 'bg-purple-100 text-purple-800',
      BL: 'bg-blue-100 text-blue-800',
      RL: 'bg-green-100 text-green-800',
      RC: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[stage] || 'bg-gray-100 text-gray-800'}`}>
        {stage}
      </span>
    );
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {getStageBadge(payment.stage)}
        {getStatusBadge(payment.overallStatus)}
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Approved Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            ₹{payment.approvedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {payment.paidAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Paid Amount:</span>
            <span className="text-lg font-bold text-green-600">
              ₹{payment.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {payment.approvalByMD && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Approved on: {new Date(payment.dateOfApproval).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span>Approved by: </span>
              <span className="font-medium text-gray-900">{payment.approvedBy}</span>
            </div>
          </div>
        )}

        {payment.responseCode && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Code:</span>
              <span className={`font-mono font-bold ${payment.responseCode === '00' ? 'text-green-600' : 'text-red-600'}`}>
                {payment.responseCode}
              </span>
            </div>
            {payment.rejectionReason && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {payment.rejectionReason}
              </div>
            )}
          </div>
        )}

        {payment.bankProcessedDate && (
          <div className="text-xs text-gray-500">
            Processed: {new Date(payment.bankProcessedDate).toLocaleString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
};

const BeneficiarySearch: React.FC = () => {
  const [beneficiaryId, setBeneficiaryId] = useState<string>('');
  const [payments, setPayments] = useState<PaymentStatusDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!beneficiaryId.trim()) {
      setError('Please enter a beneficiary ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const response = await paymentVerificationService.getBeneficiaryStatus(beneficiaryId.trim());
      setPayments(response.payments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch beneficiary data');
      console.error('Search error:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const beneficiary = payments.length > 0 ? payments[0] : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <User className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Beneficiary Search</h2>
            <p className="text-gray-600 mt-1">Search for beneficiary payment status</p>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter Beneficiary ID (e.g., 201091/494344)"
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {searched && !loading && (
        <>
          {/* Beneficiary Info */}
          {beneficiary && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-12 h-12" />
                  <div>
                    <h3 className="text-2xl font-bold">{beneficiary.applicantName}</h3>
                    <p className="text-blue-100 text-sm">ID: {beneficiary.beneficiaryId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Total Payments</p>
                  <p className="text-4xl font-bold">{payments.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-100 pt-4 border-t border-blue-500">
                <MapPin className="w-4 h-4" />
                <span>
                  {beneficiary.village}, {beneficiary.mandal}, {beneficiary.district}
                </span>
              </div>
            </div>
          )}

          {/* Payments Grid */}
          {payments.length > 0 ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payment History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payments.map((payment) => (
                  <PaymentCard key={`${payment.beneficiaryId}-${payment.stage}`} payment={payment} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No records found</p>
              <p className="text-gray-500 text-sm mt-2">
                Please check the Beneficiary ID and try again
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BeneficiarySearch;