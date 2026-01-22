// AllFailuresScreen.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  XCircle,
  DollarSign,
  Building,
  Layers,
  TrendingDown,
  FileText,
  CheckCircle,
  X,
  Calendar,
  Hash,
  CreditCard
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface FailedBeneficiary {
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  totalApbsAttempts: number;
  totalAmountAttempted: number;
  stagesAttempted: string;
  lastProcessedDate: string;
  responseCodes: string;
  rejectionReasons: string;
  bankNames: string;
  bankIINs: string;
  needsInvestigation: boolean;
}

interface AttemptHistory {
  id: string;
  beneficiaryId: string;
  stage: string;
  uploadedAmount: number;
  bankPaymentStatus: string;
  responseCode: string;
  rejectionReason: string;
  bankProcessedDate: string;
  destination_bank_iin: string;
  bank_name: string;
  narration: string;
  credit_reference: string;
  npciResponseFlag: string;
}

// ============================================================
// ATTEMPT HISTORY MODAL COMPONENT
// ============================================================

interface AttemptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: FailedBeneficiary | null;
  attempts: AttemptHistory[];
  loading: boolean;
}

const AttemptHistoryModal: React.FC<AttemptHistoryModalProps> = ({
  isOpen,
  onClose,
  beneficiary,
  attempts,
  loading
}) => {
  if (!isOpen || !beneficiary) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      BL: 'bg-blue-100 text-blue-700 border-blue-300',
      RL: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      RC: 'bg-purple-100 text-purple-700 border-purple-300',
      COMPLETED: 'bg-green-100 text-green-700 border-green-300',
      PENNY_DROP: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Attempt History</h2>
              <p className="text-blue-100 text-sm">
                {beneficiary.name} ({beneficiary.beneficiaryId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Beneficiary Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Aadhaar Number</p>
              <p className="text-gray-900 font-mono font-semibold">{beneficiary.aadhaarNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Account Number</p>
              <p className="text-gray-900 font-mono font-semibold">{beneficiary.accountNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Attempts</p>
              <p className="text-gray-900 font-semibold">{beneficiary.totalApbsAttempts}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Amount</p>
              <p className="text-gray-900 font-semibold">
                {formatCurrency(beneficiary.totalAmountAttempted)}
              </p>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600 ml-3">Loading attempts...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No attempt history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt, idx) => (
                <div
                  key={attempt.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  {/* Attempt Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStageColor(attempt.stage)}`}>
                          {attempt.stage}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(attempt.bankPaymentStatus)}`}>
                          {attempt.bankPaymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-bold text-lg">
                        {formatCurrency(attempt.uploadedAmount)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(attempt.bankProcessedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Attempt Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Response Code */}
                    <div className="flex items-start gap-3">
                      <Hash className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Response Code</p>
                        <p className={`font-mono font-bold ${attempt.responseCode === '00' ? 'text-green-700' : 'text-red-700'}`}>
                          {attempt.responseCode || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Bank</p>
                        <p className="text-gray-900 text-sm font-semibold">
                          {attempt.bank_name || 'N/A'}
                        </p>
                        {attempt.destination_bank_iin && (
                          <p className="text-gray-500 text-xs font-mono">
                            IIN: {attempt.destination_bank_iin}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Narration */}
                    {attempt.narration && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Narration</p>
                          <p className="text-gray-900 text-sm font-mono">
                            {attempt.narration}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Credit Reference */}
                    {attempt.credit_reference && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Credit Reference</p>
                          <p className="text-gray-900 text-sm font-mono">
                            {attempt.credit_reference}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {attempt.rejectionReason && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-red-600 text-xs font-semibold mb-1">Rejection Reason</p>
                          <p className="text-red-700 text-sm">{attempt.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-all font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AllFailuresScreen: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<FailedBeneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<FailedBeneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [responseCodeFilter, setResponseCodeFilter] = useState<string>('ALL');
  const [investigationFilter, setInvestigationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'attempts' | 'amount' | 'date'>('attempts');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Expanded row
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<FailedBeneficiary | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistory[]>([]);
  const [attemptLoading, setAttemptLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:3002/api/apbs-failures';

  // ============================================================
  // DATA FETCHING
  // ============================================================

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [
    beneficiaries,
    searchTerm,
    stageFilter,
    responseCodeFilter,
    investigationFilter,
    sortBy,
    sortOrder
  ]);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/unique-beneficiaries`);
      setBeneficiaries(response.data.data);
      setFilteredBeneficiaries(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch beneficiaries');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

// Update the fetchAttemptHistory function in AllFailuresScreen.tsx

const fetchAttemptHistory = async (beneficiaryId: string) => {
  setAttemptLoading(true);
  try {
    // ✅ FIX: URL encode the beneficiaryId to handle special characters like /
    const encodedBeneficiaryId = encodeURIComponent(beneficiaryId);
    const response = await axios.get(`${API_BASE_URL}/beneficiary/${encodedBeneficiaryId}/history`);
    setAttemptHistory(response.data.data);
  } catch (err: any) {
    console.error('Error fetching attempt history:', err);
    setAttemptHistory([]);
  } finally {
    setAttemptLoading(false);
  }
};

  const handleAttemptsClick = async (beneficiary: FailedBeneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setModalOpen(true);
    await fetchAttemptHistory(beneficiary.beneficiaryId);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBeneficiary(null);
    setAttemptHistory([]);
  };

  // ============================================================
  // FILTERING & SORTING
  // ============================================================

  const applyFiltersAndSort = () => {
    let filtered = [...beneficiaries];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.beneficiaryId.toLowerCase().includes(term) ||
        b.name.toLowerCase().includes(term) ||
        b.aadhaarNumber.includes(term) ||
        (b.accountNumber && b.accountNumber.toLowerCase().includes(term))
      );
    }

    // Stage filter
    if (stageFilter !== 'ALL') {
      filtered = filtered.filter(b => b.stagesAttempted.includes(stageFilter));
    }

    // Response code filter
    if (responseCodeFilter !== 'ALL') {
      filtered = filtered.filter(b => b.responseCodes.includes(responseCodeFilter));
    }

    // Investigation filter
    if (investigationFilter === 'YES') {
      filtered = filtered.filter(b => b.needsInvestigation);
    } else if (investigationFilter === 'NO') {
      filtered = filtered.filter(b => !b.needsInvestigation);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'attempts':
          comparison = a.totalApbsAttempts - b.totalApbsAttempts;
          break;
        case 'amount':
          comparison = a.totalAmountAttempted - b.totalAmountAttempted;
          break;
        case 'date':
          comparison = new Date(a.lastProcessedDate).getTime() - new Date(b.lastProcessedDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBeneficiaries(filtered);
    setCurrentPage(1);
  };

  // ============================================================
  // UTILITIES
  // ============================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      BL: 'bg-blue-100 text-blue-700 border-blue-300',
      RL: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      RC: 'bg-purple-100 text-purple-700 border-purple-300',
      COMPLETED: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const exportToCSV = () => {
    const headers = [
      'Sr No',
      'Beneficiary ID',
      'Name',
      'Aadhaar Number',
      'Account Number',
      'Total Attempts',
      'Stages',
      'Last Date',
      'Response Codes',
      'Banks',
      'Rejection Reasons',
      'Needs Investigation'
    ];

    const rows = filteredBeneficiaries.map((b, idx) => [
      idx + 1,
      b.beneficiaryId,
      b.name,
      b.aadhaarNumber,
      b.accountNumber || 'N/A',
      b.totalApbsAttempts,
      b.stagesAttempted,
      formatDate(b.lastProcessedDate),
      b.responseCodes,
      b.bankNames || 'N/A',
      b.rejectionReasons || 'N/A',
      b.needsInvestigation ? 'YES' : 'NO'
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `apbs-all-failures-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique values for filters
  const uniqueStages = Array.from(
    new Set(beneficiaries.flatMap(b => b.stagesAttempted.split(',')))
  ).sort();

  const uniqueResponseCodes = Array.from(
    new Set(beneficiaries.flatMap(b => b.responseCodes.split(',')))
  ).sort();

  // Pagination
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBeneficiaries = filteredBeneficiaries.slice(startIndex, endIndex);

  // ============================================================
  // LOADING & ERROR STATES
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 text-xl font-semibold">Loading All APBS Failures...</p>
          <p className="text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Error Loading Data</h2>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchBeneficiaries}
            className="w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Attempt History Modal */}
      <AttemptHistoryModal
        isOpen={modalOpen}
        onClose={closeModal}
        beneficiary={selectedBeneficiary}
        attempts={attemptHistory}
        loading={attemptLoading}
      />

      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All APBS Failures</h1>
                <p className="text-gray-600">
                  {filteredBeneficiaries.length.toLocaleString('en-IN')} unique beneficiaries with all attempts failed
                </p>
              </div>
            </div>
            <button
              onClick={fetchBeneficiaries}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 border border-blue-200"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-red-600" />
            <span className="text-gray-600 text-sm">Total Beneficiaries</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {beneficiaries.length.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <span className="text-gray-600 text-sm">Total Attempts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {beneficiaries.reduce((sum, b) => sum + b.totalApbsAttempts, 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-6 h-6 text-purple-600" />
            <span className="text-gray-600 text-sm">Need Investigation</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {beneficiaries.filter(b => b.needsInvestigation).length.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="text-gray-700 text-sm mb-2 block flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, Name, Aadhaar, Account..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="text-gray-700 text-sm mb-2 block flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Stage
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Stages</option>
                {uniqueStages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            {/* Response Code Filter */}
            <div>
              <label className="text-gray-700 text-sm mb-2 block flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Response Code
              </label>
              <select
                value={responseCodeFilter}
                onChange={(e) => setResponseCodeFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Codes</option>
                {uniqueResponseCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            {/* Investigation Filter */}
            <div>
              <label className="text-gray-700 text-sm mb-2 block flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Investigation
              </label>
              <select
                value={investigationFilter}
                onChange={(e) => setInvestigationFilter(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All</option>
                <option value="YES">Needs Investigation</option>
                <option value="NO">Reviewed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-gray-700 text-sm mb-2 block flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="attempts">Attempts</option>
                  <option value="amount">Amount</option>
                  <option value="date">Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl px-3 py-3 text-gray-700 transition-all"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                Showing <span className="text-gray-900 font-bold">{startIndex + 1}-{Math.min(endIndex, filteredBeneficiaries.length)}</span> of{' '}
                <span className="text-gray-900 font-bold">{filteredBeneficiaries.length}</span>
              </p>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={200}>200 per page</option>
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-6 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 border border-green-200"
            >
              <Download className="w-5 h-5" />
              Export CSV ({filteredBeneficiaries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 text-gray-700 font-semibold">Sr</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Beneficiary ID</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Name</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Aadhaar</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Account</th>
                  <th className="text-center p-4 text-gray-700 font-semibold">Attempts</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Stages</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Codes</th>
                  <th className="text-left p-4 text-gray-700 font-semibold">Last Date</th>
                  <th className="text-center p-4 text-gray-700 font-semibold">Status</th>
                  <th className="text-center p-4 text-gray-700 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentBeneficiaries.map((beneficiary, idx) => (
                  <React.Fragment key={beneficiary.beneficiaryId}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">{startIndex + idx + 1}</td>
                      <td className="p-4 text-gray-900 font-mono text-sm">{beneficiary.beneficiaryId}</td>
                      <td className="p-4 text-gray-900">{beneficiary.name}</td>
                      <td className="p-4 text-gray-700 font-mono text-sm">{beneficiary.aadhaarNumber}</td>
                      <td className="p-4 text-gray-700 font-mono text-sm">{beneficiary.accountNumber || 'N/A'}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleAttemptsClick(beneficiary)}
                          className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                        >
                          {beneficiary.totalApbsAttempts}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {beneficiary.stagesAttempted.split(',').map((stage) => (
                            <span
                              key={stage}
                              className={`px-2 py-1 rounded text-xs font-semibold ${getStageColor(stage)} border`}
                            >
                              {stage}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {beneficiary.responseCodes.split(',').slice(0, 3).map((code) => (
                            <span
                              key={code}
                              className="px-2 py-1 rounded text-xs font-mono font-bold bg-red-100 text-red-700 border border-red-200"
                            >
                              {code}
                            </span>
                          ))}
                          {beneficiary.responseCodes.split(',').length > 3 && (
                            <span className="text-gray-500 text-xs">
                              +{beneficiary.responseCodes.split(',').length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 text-sm">
                        {formatDate(beneficiary.lastProcessedDate)}
                      </td>
                      <td className="p-4 text-center">
                        {beneficiary.needsInvestigation ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                            <AlertTriangle className="w-3 h-3" />
                            Investigate
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 w-fit mx-auto">
                            <CheckCircle className="w-3 h-3" />
                            Reviewed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setExpandedRow(
                            expandedRow === beneficiary.beneficiaryId ? null : beneficiary.beneficiaryId
                          )}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-1 mx-auto"
                        >
                          {expandedRow === beneficiary.beneficiaryId ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Details
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row */}
                    {expandedRow === beneficiary.beneficiaryId && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan={11} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bank Details */}
                            <div>
                              <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                                <Building className="w-4 h-4 text-blue-600" />
                                Bank Details
                              </h4>
                              <div className="space-y-2 bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm">Bank Name:</span>
                                  <span className="text-gray-900 text-sm">{beneficiary.bankNames || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 text-sm">Bank IIN:</span>
                                  <span className="text-gray-900 text-sm font-mono">{beneficiary.bankIINs || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Rejection Reasons */}
                            <div>
                              <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-red-600" />
                                Rejection Reasons
                              </h4>
                              <div className="space-y-2 bg-red-50 rounded-lg p-4 border border-red-200">
                                {beneficiary.rejectionReasons ? (
                                  beneficiary.rejectionReasons.split(' | ').map((reason, idx) => (
                                    <p key={idx} className="text-red-700 text-sm">• {reason}</p>
                                  ))
                                ) : (
                                  <p className="text-gray-600 text-sm">No rejection reasons available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredBeneficiaries.length === 0 && (
            <div className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 text-lg">No beneficiaries match your filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStageFilter('ALL');
                  setResponseCodeFilter('ALL');
                  setInvestigationFilter('ALL');
                }}
                className="mt-4 bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = 1;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                Next
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-3">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFailuresScreen;