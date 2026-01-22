// BeneficiaryList.tsx - Supports both batch-scoped and global views

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Beneficiary, BeneficiaryFilters, BeneficiaryStats, WorkStage, PennyDropStatus, BeneficiaryStage, RejectionStatus } from '../../types';
import { BeneficiaryFiltersComponent } from './BeneficiaryFilters';

export const BeneficiaryList: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're in batch context or global context
  const isBatchContext = !!batchId;
  const isGlobalContext = !batchId && location.pathname.startsWith('/beneficiaries');
  
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;

  const [filters, setFilters] = useState<BeneficiaryFilters>({
    stage: 'all',
    pennyDrop: 'all',
    bank: 'all',
    district: 'all',
    paymentStatus: 'all',
    searchQuery: ''
  });

  const batchInfo = {
    batchId: batchId || 'ALL BATCHES',
    totalBeneficiaries: 450000
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [batchId]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      
      // In production:
      // if (isBatchContext) {
      //   const response = await fetch(`/api/batches/${batchId}/beneficiaries`);
      // } else {
      //   const response = await fetch(`/api/beneficiaries`);
      // }
      
      const mockData: Beneficiary[] = [
        {
            id: '1',
            beneficiaryId: 'BEN000001',
            name: 'Ramesh Kumar Singh',
            aadhaarNumber: '6297****0065',
            accountNumber: '052110118493',
            ifscCode: 'IPOST0000001',
            bankName: 'India Post Payments Bank',
            phoneNumber: '9876543210',
            address: 'H.No 12-34, Village Rampur',
            village: 'Rampur',
            mandal: 'Serilingampally',
            district: 'Hyderabad',
            currentStage: BeneficiaryStage.RL,
            stageAmount: 100000,
            pennyDropStatus: PennyDropStatus.VERIFIED,
            pennyDropDate: '2025-01-15',
            accountHolderName: 'RAMESH KUMAR SINGH',
            pennyDropError: null,
            totalPaidSoFar: 100000,
            lastPaymentDate: '2025-01-20',
            timeline: [],
            failureCount: 0,
            correctionCount: 0,
            aadhaar: '',
            bankAccount: '',
            amount: 0,
            housingPhase: 'G4',
            stagePayments: [],
            rejectionStatus: RejectionStatus.PENDING,
            retryCount: 0,
            batchId: batchId || 'BATCH20250115001',
            createdAt: '',
            updatedAt: ''
        },
        {
            id: '2',
            beneficiaryId: 'BEN000002',
            name: 'Lavanya Devi Reddy',
            aadhaarNumber: '5618****2102',
            accountNumber: '187610100057689',
            ifscCode: 'UBIN0018761',
            bankName: 'Union Bank of India',
            phoneNumber: '9876543211',
            address: 'H.No 45-67, Village Kandukur',
            village: 'Kandukur',
            mandal: 'Rajendranagar',
            district: 'Hyderabad',
            currentStage: BeneficiaryStage.RC,
            stageAmount: 200000,
            pennyDropStatus: PennyDropStatus.VERIFIED,
            pennyDropDate: '2025-01-15',
            accountHolderName: 'LAVANYA DEVI REDDY',
            pennyDropError: null,
            totalPaidSoFar: 200000,
            lastPaymentDate: '2025-01-23',
            timeline: [],
            failureCount: 0,
            correctionCount: 0,
            aadhaar: '',
            bankAccount: '',
            amount: 0,
            housingPhase: 'G4',
            stagePayments: [],
            rejectionStatus: RejectionStatus.PENDING,
            retryCount: 0,
            batchId: batchId || 'BATCH20250115002',
            createdAt: '',
            updatedAt: ''
        },
        {
            id: '3',
            beneficiaryId: 'BEN000003',
            name: 'Venkata Narasimha Rao',
            aadhaarNumber: '5989****0521',
            accountNumber: '010161711432',
            ifscCode: 'ICIC0000100',
            bankName: 'ICICI Bank Ltd',
            phoneNumber: '9876543214',
            address: 'H.No 78-90, Village Karimnagar',
            village: 'Karimnagar',
            mandal: 'Karimnagar',
            district: 'Karimnagar',
            currentStage: BeneficiaryStage.BL,
            stageAmount: 100000,
            pennyDropStatus: PennyDropStatus.FAILED,
            pennyDropDate: '2025-01-15',
            accountHolderName: null,
            pennyDropError: 'Invalid Account Number',
            totalPaidSoFar: 0,
            lastPaymentDate: null,
            timeline: [],
            failureCount: 2,
            correctionCount: 1,
            aadhaar: '',
            bankAccount: '',
            amount: 0,
            housingPhase: 'G4',
            stagePayments: [],
            rejectionStatus: RejectionStatus.PENDING,
            retryCount: 0,
            batchId: batchId || 'BATCH20250115001',
            createdAt: '',
            updatedAt: ''
        },
        {
            id: '4',
            beneficiaryId: 'BEN000004',
            name: 'Sita Rani Goud',
            aadhaarNumber: '3231****1173',
            accountNumber: '21100003183663',
            ifscCode: 'AUSB0000123',
            bankName: 'AU Small Finance Bank',
            phoneNumber: '9876543213',
            address: 'H.No 56-78, Village Warangal',
            village: 'Hanamkonda',
            mandal: 'Warangal',
            district: 'Warangal Urban',
            currentStage: BeneficiaryStage.COMPLETED,
            stageAmount: 100000,
            pennyDropStatus: PennyDropStatus.VERIFIED,
            pennyDropDate: '2025-01-15',
            accountHolderName: 'SITA RANI GOUD',
            pennyDropError: null,
            totalPaidSoFar: 500000,
            lastPaymentDate: '2025-01-25',
            timeline: [],
            failureCount: 0,
            correctionCount: 0,
            aadhaar: '',
            bankAccount: '',
            amount: 0,
            housingPhase: 'G4',
            stagePayments: [],
            rejectionStatus: RejectionStatus.PENDING,
            retryCount: 0,
            batchId: batchId || 'BATCH20250115003',
            createdAt: '',
            updatedAt: ''
        },
        {
            id: '5',
            beneficiaryId: 'BEN000005',
            name: 'Mohammed Abdul Kalam',
            aadhaarNumber: '3255****2532',
            accountNumber: '221122040010381',
            ifscCode: 'ICIC0000123',
            bankName: 'ICICI Bank Ltd',
            phoneNumber: '9876543215',
            address: 'H.No 23-45, Village Nizamabad',
            village: 'Nizamabad',
            mandal: 'Nizamabad',
            district: 'Nizamabad',
            currentStage: BeneficiaryStage.BL,
            stageAmount: 100000,
            pennyDropStatus: PennyDropStatus.PENDING,
            pennyDropDate: null,
            accountHolderName: null,
            pennyDropError: null,
            totalPaidSoFar: 0,
            lastPaymentDate: null,
            timeline: [],
            failureCount: 0,
            correctionCount: 0,
            aadhaar: '',
            bankAccount: '',
            amount: 0,
            housingPhase: 'G4',
            stagePayments: [],
            rejectionStatus: RejectionStatus.PENDING,
            retryCount: 0,
            batchId: batchId || 'BATCH20250115001',
            createdAt: '',
            updatedAt: ''
        }
      ];

      // Duplicate for pagination demo
      const expanded: Beneficiary[] = [];
      for (let i = 0; i < 25; i++) {
        expanded.push(...mockData.map((b, idx) => ({
          ...b,
          id: `${i}-${idx}`,
          beneficiaryId: `BEN${String(i * 5 + idx + 1).padStart(6, '0')}`
        })));
      }
      
      setBeneficiaries(expanded);
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage: WorkStage) => {
    const config: Record<WorkStage, { style: string; label: string }> = {
      'BL': { style: 'bg-blue-100 text-blue-800 border-blue-300', label: 'BL Stage' },
      'RL': { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'RL Stage' },
      'RC': { style: 'bg-purple-100 text-purple-800 border-purple-300', label: 'RC Stage' },
      'COMPLETED': { style: 'bg-green-100 text-green-800 border-green-300', label: 'Completed' }
    };
    const { style, label } = config[stage];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>{label}</span>;
  };

  const getPennyDropBadge = (status: PennyDropStatus) => {
    const config: Record<PennyDropStatus, { style: string; label: string; icon: React.ReactNode }> = {
      'VERIFIED': { style: 'bg-green-100 text-green-800', label: 'Verified', icon: <CheckCircle className="w-4 h-4" /> },
      'FAILED': { style: 'bg-red-100 text-red-800', label: 'Failed', icon: <XCircle className="w-4 h-4" /> },
      'PENDING': { style: 'bg-orange-100 text-orange-800', label: 'Pending', icon: <Clock className="w-4 h-4" /> }
    };
    const { style, label, icon } = config[status];
    return (
      <div className="flex items-center gap-2">
        {icon}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>{label}</span>
      </div>
    );
  };

  // Apply filters
  const filteredBeneficiaries = beneficiaries.filter(b => {
    const matchesStage = filters.stage === 'all' || b.currentStage === filters.stage;
    const matchesPennyDrop = filters.pennyDrop === 'all' || b.pennyDropStatus === filters.pennyDrop;
    const matchesBank = filters.bank === 'all' || b.bankName === filters.bank;
    const matchesDistrict = filters.district === 'all' || b.district === filters.district;
    const matchesPayment = filters.paymentStatus === 'all' ||
      (filters.paymentStatus === 'paid' && b.totalPaidSoFar > 0) ||
      (filters.paymentStatus === 'not-paid' && b.totalPaidSoFar === 0) ||
      (filters.paymentStatus === 'failures' && b.failureCount > 0);
    const matchesSearch = filters.searchQuery === '' ||
      b.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      b.beneficiaryId.includes(filters.searchQuery) ||
      b.accountNumber.includes(filters.searchQuery) ||
      b.village.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesStage && matchesPennyDrop && matchesBank && matchesDistrict && matchesPayment && matchesSearch;
  });

  // Calculate stats
  const stats: BeneficiaryStats = {
    total: beneficiaries.length,
    bl: beneficiaries.filter(b => b.currentStage === 'BL').length,
    rl: beneficiaries.filter(b => b.currentStage === 'RL').length,
    rc: beneficiaries.filter(b => b.currentStage === 'RC').length,
    completed: beneficiaries.filter(b => b.currentStage === 'COMPLETED').length,
    verified: beneficiaries.filter(b => b.pennyDropStatus === 'VERIFIED').length,
    failed: beneficiaries.filter(b => b.pennyDropStatus === 'FAILED').length,
    pending: beneficiaries.filter(b => b.pennyDropStatus === 'PENDING').length,
    withFailures: beneficiaries.filter(b => b.failureCount > 0).length,
    filtered: filteredBeneficiaries.length
  };

  const uniqueBanks = Array.from(new Set(beneficiaries.map(b => b.bankName))).sort();
  const uniqueDistricts = Array.from(new Set(beneficiaries.map(b => b.district))).sort();

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBeneficiaries.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredBeneficiaries.length / recordsPerPage);

  // Navigation handler - context-aware
  const handleViewTimeline = (beneficiary: Beneficiary) => {
    if (isBatchContext) {
      // Batch context: /batches/:batchId/beneficiaries/:beneficiaryId/timeline
      navigate(`/batches/${batchId}/beneficiaries/${beneficiary.id}/timeline`);
    } else {
      // Global context: /beneficiaries/:beneficiaryId/timeline
      navigate(`/beneficiaries/${beneficiary.id}/timeline`);
    }
  };

  const handleBackNavigation = () => {
    if (isBatchContext) {
      // Go back to batch detail
      navigate(`/batches/${batchId}`);
    } else {
      // Go back to dashboard or main menu
      navigate('/dashboard');
    }
  };

  if (loading) {
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
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackNavigation}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isBatchContext ? 'Batch Beneficiaries' : 'All Beneficiaries'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isBatchContext ? (
                  <>Batch: {batchInfo.batchId} | {batchInfo.totalBeneficiaries.toLocaleString()} Beneficiaries</>
                ) : (
                  <>Viewing all beneficiaries across all batches</>
                )}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export Filtered
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
          onFilterChange={setFilters}
          showAdvanced={showAdvancedFilters}
          onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
          uniqueBanks={uniqueBanks}
          uniqueDistricts={uniqueDistricts}
          totalCount={stats.total}
          filteredCount={stats.filtered}
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beneficiary</th>
                  {isGlobalContext && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batch</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Penny Drop</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRecords.map((beneficiary) => (
                  <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-semibold text-indigo-600 mb-1">{beneficiary.beneficiaryId}</div>
                      <div className="font-semibold text-gray-900">{beneficiary.name}</div>
                      <div className="text-xs text-gray-600 mt-1">Aadhaar: {beneficiary.aadhaarNumber}</div>
                      <div className="text-xs text-gray-600">Phone: {beneficiary.phoneNumber}</div>
                    </td>
                    {isGlobalContext && (
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-semibold text-blue-600">{beneficiary.batchId}</div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{beneficiary.village}</div>
                      <div className="text-xs text-gray-600">{beneficiary.mandal}</div>
                      <div className="text-xs font-medium text-gray-700">{beneficiary.district}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-gray-900">{beneficiary.accountNumber}</div>
                      <div className="text-xs text-gray-600 mt-1">IFSC: {beneficiary.ifscCode}</div>
                      <div className="text-xs text-gray-600">{beneficiary.bankName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStageBadge(beneficiary.currentStage)}
                      <div className="text-xs text-gray-600 mt-2">
                        Amount: <span className="font-semibold text-indigo-600">₹{(beneficiary.stageAmount / 100000).toFixed(0)}L</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPennyDropBadge(beneficiary.pennyDropStatus)}
                      {beneficiary.pennyDropStatus === 'VERIFIED' && beneficiary.accountHolderName && (
                        <div className="mt-2 text-xs text-green-700">✓ Verified</div>
                      )}
                      {beneficiary.pennyDropStatus === 'FAILED' && beneficiary.pennyDropError && (
                        <div className="mt-2 text-xs text-red-700">{beneficiary.pennyDropError}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600 text-lg">
                        ₹{(beneficiary.totalPaidSoFar / 100000).toFixed(0)}L
                      </div>
                      {beneficiary.lastPaymentDate && (
                        <div className="text-xs text-gray-600 mt-1">
                          Last: {new Date(beneficiary.lastPaymentDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                      {!beneficiary.lastPaymentDate && (
                        <div className="text-xs text-gray-500 mt-1">No payment yet</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {beneficiary.failureCount > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-xs font-semibold">{beneficiary.failureCount} Failure(s)</span>
                          </div>
                        )}
                        {beneficiary.correctionCount > 0 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <RefreshCw className="w-3 h-3" />
                            <span className="text-xs font-semibold">{beneficiary.correctionCount} Correction(s)</span>
                          </div>
                        )}
                        {beneficiary.failureCount === 0 && beneficiary.correctionCount === 0 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-xs font-semibold">No Issues</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewTimeline(beneficiary)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors text-sm font-medium"
                        title="View Timeline"
                      >
                        <Eye className="w-4 h-4" />
                        Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentRecords.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No beneficiaries found matching your filters</p>
              <button
                onClick={() => setFilters({
                  stage: 'all',
                  pennyDrop: 'all',
                  bank: 'all',
                  district: 'all',
                  paymentStatus: 'all',
                  searchQuery: ''
                })}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <strong>{indexOfFirstRecord + 1}</strong> to{' '}
                <strong>{Math.min(indexOfLastRecord, filteredBeneficiaries.length)}</strong> of{' '}
                <strong>{filteredBeneficiaries.length.toLocaleString()}</strong> beneficiaries
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
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
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
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

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

// Helper Component
interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default BeneficiaryList;