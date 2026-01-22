// IntegratedBeneficiaryList.tsx - UPDATED FOR NEW BACKEND
// ✅ Updated to use APBS/BANK/IOB payment modes
// ✅ Updated to use flattened beneficiary structure
// ✅ Fixed all field name mappings
// ✅ Removed nested object access

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  CreditCard,
  Building2,
  Search,
  Filter,
  X,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002';

// ============================================================================
// INTERFACES - UPDATED
// ============================================================================

interface IntegratedBeneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  bankName: string;
  bankIIN: string;
  paymentMode: 'APBS' | 'BANK' | 'IOB';
  
  // Flattened structure - all at root level
  currentStage: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  stageAmount: number;
  verificationCost: number;
  totalDisbursed: number;
  totalPaidSoFar: number;
  pennyDropStatus: 'SUCCESS' | 'FAILED' | 'NOT_DONE';
  pennyDropDate?: string;
  accountHolderName?: string;
  lastPaymentDate?: string;
  failureCount: number;
  rejectionReason?: string;
  responseCode?: string;
  
  totalAmount: number;
  totalPaid: number;
  failedAmount: number;
}

interface BeneficiaryStats {
  total: number;
  bl: number;
  rl: number;
  rc: number;
  completed: number;
  verified: number;
  failed: number;
  pending: number;
  withFailures: number;
  apbsPayments: number;
  bankPayments: number;
  iobPayments: number;
}

interface BeneficiaryFilters {
  stage: string;
  pennyDrop: string;
  paymentMode: string;
  paymentStatus: string;
  searchQuery: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const IntegratedBeneficiaryList: React.FC = () => {
  const navigate = useNavigate();
  
  const [beneficiaries, setBeneficiaries] = useState<IntegratedBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;

  const [filters, setFilters] = useState<BeneficiaryFilters>({
    stage: 'all',
    pennyDrop: 'all',
    paymentMode: 'all',
    paymentStatus: 'all',
    searchQuery: ''
  });

  const [stats, setStats] = useState<BeneficiaryStats>({
    total: 0,
    bl: 0,
    rl: 0,
    rc: 0,
    completed: 0,
    verified: 0,
    failed: 0,
    pending: 0,
    withFailures: 0,
    apbsPayments: 0,
    bankPayments: 0,
    iobPayments: 0
  });

  useEffect(() => {
    fetchBeneficiaries();
  }, [
    currentPage, 
    filters.stage, 
    filters.pennyDrop, 
    filters.paymentMode, 
    filters.paymentStatus, 
    filters.searchQuery
  ]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: recordsPerPage,
        stage: filters.stage !== 'all' ? filters.stage : undefined,
        pennyDrop: filters.pennyDrop !== 'all' ? filters.pennyDrop : undefined,
        paymentMode: filters.paymentMode !== 'all' ? filters.paymentMode : undefined,
        paymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
        searchQuery: filters.searchQuery || undefined,
      };

      const response = await axios.get(`${API_BASE_URL}/integrated-beneficiaries`, { params });
      
      setBeneficiaries(response.data.data);
      setStats(response.data.stats);
      setTotalPages(response.data.pagination.totalPages);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof BeneficiaryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      stage: 'all',
      pennyDrop: 'all',
      paymentMode: 'all',
      paymentStatus: 'all',
      searchQuery: ''
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return filters.stage !== 'all' || 
           filters.pennyDrop !== 'all' || 
           filters.paymentMode !== 'all' || 
           filters.paymentStatus !== 'all' || 
           filters.searchQuery !== '';
  };

  const getPaymentModeBadge = (mode: string) => {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      'APBS': { 
        color: 'bg-blue-500', 
        label: 'APBS',
        icon: <CreditCard className="w-3 h-3" />
      },
      'BANK': { 
        color: 'bg-green-500', 
        label: 'Bank',
        icon: <Building2 className="w-3 h-3" />
      },
      'IOB': { 
        color: 'bg-purple-500', 
        label: 'IOB',
        icon: <TrendingUp className="w-3 h-3" />
      }
    };
    const { color, label, icon } = config[mode] || config['APBS'];
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${color} text-white rounded-md text-xs font-semibold`}>
        {icon}
        <span>{label}</span>
      </div>
    );
  };

  const getStageBadge = (stage: string) => {
    const config: Record<string, { color: string; label: string }> = {
      'BL': { color: 'bg-blue-100 text-blue-700', label: 'BL' },
      'RL': { color: 'bg-yellow-100 text-yellow-700', label: 'RL' },
      'RC': { color: 'bg-purple-100 text-purple-700', label: 'RC' },
      'COMPLETED': { color: 'bg-green-100 text-green-700', label: 'Done' }
    };
    const { color, label } = config[stage] || config['BL'];
    return <span className={`px-2 py-0.5 rounded ${color} text-xs font-bold`}>{label}</span>;
  };

  const getPennyDropBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      'SUCCESS': { 
        color: 'text-green-600', 
        label: 'Verified', 
        icon: <CheckCircle className="w-3.5 h-3.5" /> 
      },
      'FAILED': { 
        color: 'text-red-600', 
        label: 'Failed', 
        icon: <XCircle className="w-3.5 h-3.5" /> 
      },
      'NOT_DONE': { 
        color: 'text-gray-600', 
        label: 'Not Done', 
        icon: <Clock className="w-3.5 h-3.5" /> 
      }
    };
    const { color, label, icon } = config[status] || config['NOT_DONE'];
    return (
      <div className={`inline-flex items-center gap-1 ${color} text-xs font-medium`}>
        {icon}
        <span>{label}</span>
      </div>
    );
  };

  const handleViewTimeline = (beneficiary: IntegratedBeneficiary) => {
    navigate(`/IntegratedBeneficiaryTimeline?id=${beneficiary.beneficiaryId}`);
  };

  const handleExport = async () => {
    console.log('Exporting integrated beneficiaries...');
  };

  if (loading && beneficiaries.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading beneficiaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with inline stats */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top row: Title + Actions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-indigo-600" />
                Integrated Beneficiaries
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Combined APBS & Bank Transfer payments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showFilters 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters() && (
                  <span className="bg-white text-indigo-600 text-xs font-bold px-1.5 py-0.5 rounded">
                    {Object.values(filters).filter(v => v && v !== 'all').length}
                  </span>
                )}
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Inline summary stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-gray-900 text-lg">{stats.total?.toLocaleString() || 0}</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">APBS:</span>
              <span className="font-semibold text-gray-900">{stats.apbsPayments?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Bank:</span>
              <span className="font-semibold text-gray-900">{stats.bankPayments?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-gray-600">IOB:</span>
              <span className="font-semibold text-gray-900">{stats.iobPayments?.toLocaleString() || 0}</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700">{stats.verified?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="font-semibold text-red-700">{stats.failed?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="font-semibold text-orange-700">{stats.withFailures?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Search + Filters Panel */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, Aadhaar, beneficiary ID..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            {filters.searchQuery && (
              <button
                onClick={() => handleFilterChange('searchQuery', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stage Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Stage</label>
                  <select
                    value={filters.stage}
                    onChange={(e) => handleFilterChange('stage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Stages</option>
                    <option value="BL">Base Layer (BL)</option>
                    <option value="RL">Roof Level (RL)</option>
                    <option value="RC">Roof Casting (RC)</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Payment Mode Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Mode</label>
                  <select
                    value={filters.paymentMode}
                    onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Modes</option>
                    <option value="APBS">APBS Only</option>
                    <option value="BANK">Bank Transfer Only</option>
                    <option value="IOB">IOB Only</option>
                  </select>
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Verification</label>
                  <select
                    value={filters.pennyDrop}
                    onChange={(e) => handleFilterChange('pennyDrop', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="SUCCESS">Verified</option>
                    <option value="FAILED">Failed</option>
                    <option value="NOT_DONE">Not Done</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="not-paid">Not Paid</option>
                    <option value="failures">With Failures</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters() && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Beneficiary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Mode & Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Bank Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                    {/* Beneficiary Info */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{beneficiary.name}</div>
                        <div className="font-mono text-xs text-indigo-600 font-medium">
                          {beneficiary.beneficiaryId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {beneficiary.aadhaarNumber}
                        </div>
                      </div>
                    </td>

                    {/* Mode & Stage */}
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        {getPaymentModeBadge(beneficiary.paymentMode)}
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {beneficiary.paymentMode === 'APBS' && <CreditCard className="w-3 h-3 text-blue-600" />}
                            {beneficiary.paymentMode === 'BANK' && <Building2 className="w-3 h-3 text-green-600" />}
                            {beneficiary.paymentMode === 'IOB' && <TrendingUp className="w-3 h-3 text-purple-600" />}
                            {getStageBadge(beneficiary.currentStage)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bank Details */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <div className="font-mono text-sm font-semibold text-gray-900">
                          {beneficiary.accountNumber}
                        </div>
                        <div className="text-xs text-gray-600">{beneficiary.bankName}</div>
                        
                        {beneficiary.pennyDropStatus && (
                          <div className="mt-1.5">
                            {getPennyDropBadge(beneficiary.pennyDropStatus)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <div className="font-bold text-lg text-gray-900">
                          ₹{beneficiary.totalPaid?.toFixed(2) || '0.00'}L
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700 font-semibold">
                            ₹{beneficiary.totalPaid?.toFixed(2) || '0.00'}L paid
                          </span>
                        </div>
                        {beneficiary.failedAmount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <ArrowDownRight className="w-3 h-3 text-red-600" />
                            <span className="text-xs text-red-700 font-semibold">
                              ₹{beneficiary.failedAmount.toFixed(2)}L failed
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {beneficiary.failureCount > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold">
                              {beneficiary.failureCount} failure(s)
                            </span>
                          </div>
                          {beneficiary.rejectionReason && (
                            <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 max-w-xs">
                              {beneficiary.rejectionReason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">No Issues</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewTimeline(beneficiary)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {beneficiaries.length === 0 && !loading && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No beneficiaries found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query</p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <strong>{((currentPage - 1) * recordsPerPage) + 1}</strong> to{' '}
                <strong>{Math.min(currentPage * recordsPerPage, totalRecords)}</strong> of{' '}
                <strong>{totalRecords.toLocaleString()}</strong> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  First
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700 px-4 font-medium">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedBeneficiaryList;