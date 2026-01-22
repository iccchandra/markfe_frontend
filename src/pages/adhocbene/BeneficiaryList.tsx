// BeneficiaryList.tsx - SIMPLIFIED WITHOUT BATCH CONTEXT

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
  RefreshCw
} from 'lucide-react';
import { BeneficiaryFiltersComponent } from './BeneficiaryFilters';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

interface Beneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  bankName: string;
  currentStage: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  stageAmount: number;
  pennyDropStatus: 'VERIFIED' | 'FAILED' | 'PENDING';
  pennyDropDate?: string;
  accountHolderName?: string;
  totalPaidSoFar: number;
  lastPaymentDate?: string;
  failureCount: number;
  correctionCount: number;
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
}

interface BeneficiaryFilters {
  stage: string;
  pennyDrop: string;
  bank: string;
  paymentStatus: string;
  searchQuery: string;
}

export const ReconBeneficiaryList: React.FC = () => {
  const navigate = useNavigate();
  
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 50;

  const [filters, setFilters] = useState<BeneficiaryFilters>({
    stage: 'all',
    pennyDrop: 'all',
    bank: 'all',
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
    withFailures: 0
  });

  const [uniqueBanks, setUniqueBanks] = useState<string[]>([]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: recordsPerPage,
        stage: filters.stage !== 'all' ? filters.stage : undefined,
        pennyDrop: filters.pennyDrop !== 'all' ? filters.pennyDrop : undefined,
        bankName: filters.bank !== 'all' ? filters.bank : undefined,
        paymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
        searchQuery: filters.searchQuery || undefined,
      };

      const response = await axios.get(`${API_BASE_URL}/adhoc-beneficiaries`, { params });
      
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

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/adhoc-beneficiaries/filters/banks`);
      setUniqueBanks(response.data.banks);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const handleFilterChange = (newFilters: BeneficiaryFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getStageBadge = (stage: string) => {
    const config: Record<string, { style: string; label: string }> = {
      'BL': { style: 'bg-blue-100 text-blue-800 border-blue-300', label: 'BL Stage' },
      'RL': { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'RL Stage' },
      'RC': { style: 'bg-purple-100 text-purple-800 border-purple-300', label: 'RC Stage' },
      'COMPLETED': { style: 'bg-green-100 text-green-800 border-green-300', label: 'Completed' }
    };
    const { style, label } = config[stage] || config['BL'];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>{label}</span>;
  };

  const getPennyDropBadge = (status: string) => {
    const config: Record<string, { style: string; label: string; icon: React.ReactNode }> = {
      'VERIFIED': { style: 'bg-green-100 text-green-800', label: 'Verified', icon: <CheckCircle className="w-4 h-4" /> },
      'FAILED': { style: 'bg-red-100 text-red-800', label: 'Failed', icon: <XCircle className="w-4 h-4" /> },
      'PENDING': { style: 'bg-orange-100 text-orange-800', label: 'Pending', icon: <Clock className="w-4 h-4" /> }
    };
    const { style, label, icon } = config[status] || config['PENDING'];
    return (
      <div className="flex items-center gap-2">
        {icon}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>{label}</span>
      </div>
    );
  };

  const handleViewTimeline = (beneficiary: Beneficiary) => {
    navigate(`/beneficiaries/${beneficiary.beneficiaryId}/timeline`);
  };

  const handleExport = async () => {
    console.log('Exporting filtered beneficiaries...');
  };

  if (loading && beneficiaries.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beneficiaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
            <p className="text-gray-600 mt-1">
              Housing scheme payment beneficiary management
            </p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
          <StatCard label="Total" value={stats.total.toLocaleString()} color="bg-gray-50" />
          <StatCard label="BL" value={stats.bl.toLocaleString()} color="bg-blue-50" />
          <StatCard label="RL" value={stats.rl.toLocaleString()} color="bg-yellow-50" />
          <StatCard label="RC" value={stats.rc.toLocaleString()} color="bg-purple-50" />
          <StatCard label="Done" value={stats.completed.toLocaleString()} color="bg-green-50" />
          <StatCard label="Verified" value={stats.verified.toLocaleString()} color="bg-emerald-50" />
          <StatCard label="Failed" value={stats.failed.toLocaleString()} color="bg-red-50" />
          <StatCard label="Pending" value={stats.pending.toLocaleString()} color="bg-orange-50" />
          <StatCard label="Issues" value={stats.withFailures.toLocaleString()} color="bg-pink-50" />
        </div>

        {/* Filters */}
        <BeneficiaryFiltersComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          showAdvanced={showAdvancedFilters}
          onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
          uniqueBanks={uniqueBanks}
          totalCount={stats.total}
          filteredCount={totalRecords}
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beneficiary</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Penny Drop</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-semibold text-indigo-600 mb-1">
                        {beneficiary.beneficiaryId}
                      </div>
                      <div className="font-semibold text-gray-900">{beneficiary.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Aadhaar: {beneficiary.aadhaarNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-gray-900">
                        {beneficiary.accountNumber}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{beneficiary.bankName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStageBadge(beneficiary.currentStage)}
                      <div className="text-xs text-gray-600 mt-2">
                        Amount: <span className="font-semibold text-indigo-600">
                        ₹{beneficiary.stageAmount.toFixed(2)}L
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPennyDropBadge(beneficiary.pennyDropStatus)}
                      {beneficiary.accountHolderName && (
                        <div className="mt-2 text-xs text-green-700">
                          ✓ {beneficiary.accountHolderName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600 text-lg">
                      ₹{beneficiary.totalPaidSoFar.toFixed(2)}L
                      </div>
                      {beneficiary.lastPaymentDate && (
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(beneficiary.lastPaymentDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                      {!beneficiary.lastPaymentDate && (
                        <div className="text-xs text-gray-500 mt-1">No payment yet</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {beneficiary.failureCount > 0 ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            {beneficiary.failureCount} Failure(s)
                          </span>
                        </div>
                      ) : beneficiary.correctionCount > 0 ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <RefreshCw className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            {beneficiary.correctionCount} Correction(s)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">No Issues</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewTimeline(beneficiary)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {beneficiaries.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No beneficiaries found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <strong>{((currentPage - 1) * recordsPerPage) + 1}</strong> to{' '}
                <strong>{Math.min(currentPage * recordsPerPage, totalRecords)}</strong> of{' '}
                <strong>{totalRecords.toLocaleString()}</strong> beneficiaries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default ReconBeneficiaryList;