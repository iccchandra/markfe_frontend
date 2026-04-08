import React from 'react';
import { Users, TrendingUp, DollarSign, ChevronLeft, ChevronRight, Info, ExternalLink } from 'lucide-react';
import { AggregateSummaryResponse } from '../../services/payRecordsApi.service';
import { useNavigate } from 'react-router-dom';

interface AggregateSummaryProps {
  data: AggregateSummaryResponse | null;
  loading: boolean;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void; // ADD THIS LINE
  currentPage?: number; // ADD THIS LINE
  currentLimit?: number; // ADD THIS LINE
}
export const AggregateSummary: React.FC<AggregateSummaryProps> = ({ 
  data, 
  loading,
  onPageChange,
  onLimitChange, // ADD THIS LINE
  currentPage, // ADD THIS LINE
  currentLimit, // ADD THIS LINE
}) => {
  // FIXED: Move useNavigate inside the component
  const navigate = useNavigate();

  const handleBeneficiaryClick = (beneficiaryId: string) => {
    navigate(`/beneficiary-timeline?beneficiaryId=${beneficiaryId}`);
  };

  // Format currency with proper paisa handling
  const formatCurrency = (amount: number) => {
    if (amount === 0) {
      return '₹0';
    }

    // Special handling for ₹1 (penny drop amount)
    if (amount === 0.01 || amount === 1) {
      return '₹1';
    }

    // If amount is less than 1 rupee but not penny drop (only paisa)
    if (amount < 1 && amount > 0) {
      const paisaAmount = Math.round(amount * 100);
      return `${paisaAmount} paisa`;
    }

    // For amounts >= 1 rupee
    const rupees = Math.floor(amount);
    const paisa = Math.round((amount - rupees) * 100);

    const rupeesFormatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(rupees);

    if (paisa > 0) {
      return `₹${rupeesFormatted}.${paisa.toString().padStart(2, '0')}`;
    }

    return `₹${rupeesFormatted}`;
  };

  // Format in Crores ONLY (never TCr)
  const formatCompactCurrency = (amount: number) => {
    if (amount === 0) {
      return '₹0';
    }

    // Penny drop amounts
    if (amount === 0.01 || amount === 1) {
      return '₹1';
    }

    // Paisa amounts
    if (amount < 1 && amount > 0) {
      const paisaAmount = Math.round(amount * 100);
      return `${paisaAmount}p`;
    }

    // Less than 1 Lakh - show in rupees
    if (amount < 100000) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    }

    // 1 Lakh to 1 Crore - show in Lakhs
    if (amount < 10000000) {
      const lakhs = amount / 100000;
      return `₹${lakhs.toFixed(2)}L`;
    }

    // 1 Crore and above - ALWAYS show in Crores (never TCr)
    const crores = amount / 10000000;
    
    // For very large amounts (1000+ crores), still show in Crores
    if (crores >= 1000) {
      return `₹${crores.toFixed(2)} Cr`;
    }
    
    // For all crores amounts, show 2 decimal places
    return `₹${crores.toFixed(2)} Cr`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    const methodColors: Record<string, string> = {
      APBS: 'bg-indigo-100 text-indigo-800',
      BANK: 'bg-teal-100 text-teal-800',
      IOB: 'bg-cyan-100 text-cyan-800',
    };

    return (
      <span className={`${baseClasses} ${methodColors[method] || 'bg-gray-100 text-gray-800'}`}>
        {method}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    const stageColors: Record<string, string> = {
      BL: 'bg-blue-100 text-blue-800',
      RL: 'bg-purple-100 text-purple-800',
      RC: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`${baseClasses} ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
        {stage}
      </span>
    );
  };

  // Helper to check if beneficiary has penny drop transactions
  const hasPennyDropAmount = (beneficiary: any) => {
    return beneficiary.success_amount_rupees === 1 || 
           beneficiary.success_amount_rupees === 0.01 ||
           beneficiary.total_amount_rupees === 1 ||
           beneficiary.total_amount_rupees === 0.01;
  };

  // Pagination component
  const PaginationControls = () => {
    if (!data?.pagination || data.pagination.totalPages <= 1) return null;

    const { page, totalPages, total, limit } = data.pagination;
    const maxVisiblePages = 7;
    const pages: (number | string)[] = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, page - 2);
      let end = Math.min(totalPages - 1, page + 2);
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * limit, total)}
              </span> of{' '}
              <span className="font-medium">{total.toLocaleString('en-IN')}</span> beneficiaries
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              {pages.map((pageNum, index) => (
                typeof pageNum === 'number' ? (
                  <button
                    key={index}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span
                    key={index}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    {pageNum}
                  </span>
                )
              ))}
              <button
                onClick={() => onPageChange?.(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading aggregate summary...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Info Banner about Penny Drop */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-purple-600 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-purple-900">About ₹1 Transactions</h4>
            <p className="text-sm text-purple-700 mt-1">
              ₹1 amounts represent <strong>Penny Drop</strong> verification transactions used to validate bank account details before processing actual payments.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Beneficiaries</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(data.summary.total_beneficiaries || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(data.summary.total_transactions || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600 font-medium">
                  {(data.summary.total_success_count || 0).toLocaleString('en-IN')} ✓
                </span>
                {' • '}
                <span className="text-red-600 font-medium">
                  {(data.summary.total_failure_count || 0).toLocaleString('en-IN')} ✗
                </span>
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Amount</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCompactCurrency(data.summary.total_success_amount_rupees || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(data.summary.total_success_count || 0).toLocaleString('en-IN')} payments
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grand Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCompactCurrency(data.summary.grand_total_rupees || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">All statuses</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <DollarSign className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Beneficiary Aggregate Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Beneficiary Aggregates</h3>
          <p className="text-sm text-gray-500">Sum of all transactions per beneficiary</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Methods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stages
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Amount
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Period
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.beneficiaries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    No beneficiaries found
                  </td>
                </tr>
              ) : (
                data.beneficiaries.map((beneficiary, index) => {
                  const isPennyDrop = hasPennyDropAmount(beneficiary);
                  
                  return (
                    <tr key={`${beneficiary.beneficiaryId}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() => handleBeneficiaryClick(beneficiary.beneficiaryId)}
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 hover:underline transition-colors group"
                        >
                          <span>{beneficiary.beneficiaryId}</span>
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {beneficiary.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {beneficiary.payment_methods.map((method, idx) => (
                            <span key={idx}>
                              {getPaymentMethodBadge(method)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {beneficiary.stages.map((stage, idx) => (
                            <span key={idx}>
                              {getStageBadge(stage)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <div>{beneficiary.total_transactions}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="text-green-600">{beneficiary.success_count}✓</span>
                          {' • '}
                          <span className="text-red-600">{beneficiary.failure_count}✗</span>
                          {beneficiary.pending_count > 0 && (
                            <>
                              {' • '}
                              <span className="text-yellow-600">{beneficiary.pending_count}⏳</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {beneficiary.success_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {beneficiary.failure_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                        <div className="flex flex-col items-end">
                          <span>{formatCurrency(beneficiary.success_amount_rupees)}</span>
                          {isPennyDrop && (
                            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-normal mt-1">
                              Penny Drop
                            </span>
                          )}
                        </div>
                      </td>
                    
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div>{formatDate(beneficiary.first_payment_date)}</div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(beneficiary.last_payment_date)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <PaginationControls />
      </div>
    </div>
  );
};