import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Users
} from 'lucide-react';

type WorkStage = 'BL' | 'RL' | 'RC' | 'COMPLETED';
type PennyDropStatus = 'VERIFIED' | 'FAILED' | 'PENDING';

interface Beneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  phoneNumber: string;
  address: string;
  currentStage: WorkStage;
  stageAmount: number;
  pennyDropStatus: PennyDropStatus;
  pennyDropDate: string | null;
  accountHolderName: string | null;
  pennyDropError: string | null;
  totalPaidSoFar: number;
  lastPaymentDate: string | null;
}

export default function BeneficiaryListScreen() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterPennyDrop, setFilterPennyDrop] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;

  const batchInfo = {
    batchId: 'BATCH20250115001',
    totalBeneficiaries: 450000
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const mockBeneficiaries: Beneficiary[] = [
        {
          id: '1',
          beneficiaryId: 'BEN000001',
          name: 'Ramesh Kumar Singh',
          aadhaarNumber: '6297****0065',
          accountNumber: '052110118493',
          ifscCode: 'IPOST0000001',
          bankName: 'India Post Payments Bank',
          phoneNumber: '9876543210',
          address: 'Village Rampur, Mandal Serilingampally, Dist. Hyderabad, Telangana - 500019',
          currentStage: 'BL',
          stageAmount: 100000,
          pennyDropStatus: 'VERIFIED',
          pennyDropDate: '2025-01-15',
          accountHolderName: 'RAMESH KUMAR SINGH',
          pennyDropError: null,
          totalPaidSoFar: 0,
          lastPaymentDate: null
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
          address: 'Village Kandukur, Mandal Rajendranagar, Dist. Hyderabad, Telangana - 500030',
          currentStage: 'RL',
          stageAmount: 100000,
          pennyDropStatus: 'VERIFIED',
          pennyDropDate: '2025-01-15',
          accountHolderName: 'LAVANYA DEVI REDDY',
          pennyDropError: null,
          totalPaidSoFar: 100000,
          lastPaymentDate: '2025-01-20'
        },
        {
          id: '3',
          beneficiaryId: 'BEN000003',
          name: 'Mohammed Abdul Kalam',
          aadhaarNumber: '3255****2532',
          accountNumber: '221122040010381',
          ifscCode: 'ICIC0000123',
          bankName: 'ICICI Bank Ltd',
          phoneNumber: '9876543212',
          address: 'Village Miryalaguda, Mandal Miryalaguda, Dist. Nalgonda, Telangana - 508207',
          currentStage: 'RC',
          stageAmount: 200000,
          pennyDropStatus: 'VERIFIED',
          pennyDropDate: '2025-01-15',
          accountHolderName: 'MOHAMMED ABDUL KALAM',
          pennyDropError: null,
          totalPaidSoFar: 200000,
          lastPaymentDate: '2025-01-22'
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
          address: 'Village Hanamkonda, Mandal Warangal, Dist. Warangal Urban, Telangana - 506001',
          currentStage: 'COMPLETED',
          stageAmount: 100000,
          pennyDropStatus: 'VERIFIED',
          pennyDropDate: '2025-01-15',
          accountHolderName: 'SITA RANI GOUD',
          pennyDropError: null,
          totalPaidSoFar: 500000,
          lastPaymentDate: '2025-01-25'
        },
        {
          id: '5',
          beneficiaryId: 'BEN000005',
          name: 'Venkata Narasimha Rao',
          aadhaarNumber: '5989****0521',
          accountNumber: '010161711432',
          ifscCode: 'ICIC0000100',
          bankName: 'ICICI Bank Ltd',
          phoneNumber: '9876543214',
          address: 'Village Karimnagar, Mandal Karimnagar, Dist. Karimnagar, Telangana - 505001',
          currentStage: 'BL',
          stageAmount: 100000,
          pennyDropStatus: 'FAILED',
          pennyDropDate: '2025-01-15',
          accountHolderName: null,
          pennyDropError: 'Invalid Account Number',
          totalPaidSoFar: 0,
          lastPaymentDate: null
        },
        {
          id: '6',
          beneficiaryId: 'BEN000006',
          name: 'Anjali Reddy Pasupuleti',
          aadhaarNumber: '8163****7910',
          accountNumber: '58478100000841',
          ifscCode: 'BARB0058478',
          bankName: 'Bank of Baroda',
          phoneNumber: '9876543215',
          address: 'Village Khammam, Mandal Khammam, Dist. Khammam, Telangana - 507001',
          currentStage: 'RL',
          stageAmount: 100000,
          pennyDropStatus: 'PENDING',
          pennyDropDate: null,
          accountHolderName: null,
          pennyDropError: null,
          totalPaidSoFar: 100000,
          lastPaymentDate: '2025-01-20'
        },
        {
          id: '7',
          beneficiaryId: 'BEN000007',
          name: 'Bhookya Nageswarao',
          aadhaarNumber: '8529****6428',
          accountNumber: '73070632275',
          ifscCode: 'TGBK0070632',
          bankName: 'Telangana Grameena Bank',
          phoneNumber: '9876543216',
          address: 'Village Adilabad, Mandal Adilabad, Dist. Adilabad, Telangana - 504001',
          currentStage: 'RC',
          stageAmount: 200000,
          pennyDropStatus: 'VERIFIED',
          pennyDropDate: '2025-01-15',
          accountHolderName: 'BHOOKYA NAGESWARAO',
          pennyDropError: null,
          totalPaidSoFar: 200000,
          lastPaymentDate: '2025-01-23'
        },
        {
          id: '8',
          beneficiaryId: 'BEN000008',
          name: 'Padma Lakshmi Devi',
          aadhaarNumber: '7437****7363',
          accountNumber: '20378506750',
          ifscCode: 'FINO0000203',
          bankName: 'Fino Payments Bank',
          phoneNumber: '9876543217',
          address: 'Village Nizamabad, Mandal Nizamabad, Dist. Nizamabad, Telangana - 503001',
          currentStage: 'BL',
          stageAmount: 100000,
          pennyDropStatus: 'FAILED',
          pennyDropDate: '2025-01-15',
          accountHolderName: null,
          pennyDropError: 'Account Closed/Dormant',
          totalPaidSoFar: 0,
          lastPaymentDate: null
        }
      ];
      
      // Duplicate for pagination demo
      const expanded: Beneficiary[] = [];
      for (let i = 0; i < 100; i++) {
        expanded.push(...mockBeneficiaries.map((b, idx) => ({
          ...b,
          id: `${i}-${idx}`,
          beneficiaryId: `BEN${String(i * 8 + idx + 1).padStart(6, '0')}`
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
      'VERIFIED': { 
        style: 'bg-green-100 text-green-800 border-green-300', 
        label: 'Verified', 
        icon: <CheckCircle className="w-4 h-4 text-green-600" /> 
      },
      'FAILED': { 
        style: 'bg-red-100 text-red-800 border-red-300', 
        label: 'Failed', 
        icon: <XCircle className="w-4 h-4 text-red-600" /> 
      },
      'PENDING': { 
        style: 'bg-orange-100 text-orange-800 border-orange-300', 
        label: 'Pending', 
        icon: <Clock className="w-4 h-4 text-orange-600" /> 
      }
    };
    const { style, label, icon } = config[status];
    return (
      <div className="flex items-center gap-2">
        {icon}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>{label}</span>
      </div>
    );
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    let matchesStage = true;
    if (filterStage !== 'all') {
      matchesStage = b.currentStage === filterStage;
    }

    let matchesPennyDrop = true;
    if (filterPennyDrop !== 'all') {
      matchesPennyDrop = b.pennyDropStatus === filterPennyDrop;
    }

    const matchesSearch = searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.aadhaarNumber.includes(searchQuery) ||
      b.beneficiaryId.includes(searchQuery) ||
      b.accountNumber.includes(searchQuery);

    return matchesStage && matchesPennyDrop && matchesSearch;
  });

  const stats = {
    total: beneficiaries.length,
    bl: beneficiaries.filter(b => b.currentStage === 'BL').length,
    rl: beneficiaries.filter(b => b.currentStage === 'RL').length,
    rc: beneficiaries.filter(b => b.currentStage === 'RC').length,
    completed: beneficiaries.filter(b => b.currentStage === 'COMPLETED').length,
    verified: beneficiaries.filter(b => b.pennyDropStatus === 'VERIFIED').length,
    failed: beneficiaries.filter(b => b.pennyDropStatus === 'FAILED').length,
    pending: beneficiaries.filter(b => b.pennyDropStatus === 'PENDING').length,
    filtered: filteredBeneficiaries.length
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBeneficiaries.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredBeneficiaries.length / recordsPerPage);

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
            <button className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Beneficiary List</h1>
              <p className="text-gray-600 mt-1">Batch: {batchInfo.batchId} | {batchInfo.totalBeneficiaries.toLocaleString()} Total Beneficiaries</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export Filtered
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard label="Total" value={stats.total.toLocaleString()} color="bg-gray-50" textColor="text-gray-900" />
          <StatCard label="BL Stage" value={stats.bl.toLocaleString()} color="bg-blue-50" textColor="text-blue-900" />
          <StatCard label="RL Stage" value={stats.rl.toLocaleString()} color="bg-yellow-50" textColor="text-yellow-900" />
          <StatCard label="RC Stage" value={stats.rc.toLocaleString()} color="bg-purple-50" textColor="text-purple-900" />
          <StatCard label="Completed" value={stats.completed.toLocaleString()} color="bg-green-50" textColor="text-green-900" />
          <StatCard label="Verified" value={stats.verified.toLocaleString()} color="bg-emerald-50" textColor="text-emerald-900" />
          <StatCard label="Failed" value={stats.failed.toLocaleString()} color="bg-red-50" textColor="text-red-900" />
          <StatCard label="Pending" value={stats.pending.toLocaleString()} color="bg-orange-50" textColor="text-orange-900" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, Aadhaar, Beneficiary ID, or Account Number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Stages</option>
              <option value="BL">BL Stage Only</option>
              <option value="RL">RL Stage Only</option>
              <option value="RC">RC Stage Only</option>
              <option value="COMPLETED">Completed Only</option>
            </select>
            <select
              value={filterPennyDrop}
              onChange={(e) => setFilterPennyDrop(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Penny Drop Status</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="FAILED">Failed Only</option>
              <option value="PENDING">Pending Only</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing <strong>{stats.filtered.toLocaleString()}</strong> of <strong>{stats.total.toLocaleString()}</strong> beneficiaries
          </div>
        </div>

        {/* Beneficiaries Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beneficiary Info</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Work Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stage Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Penny Drop</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-semibold text-gray-900">{beneficiary.accountNumber}</div>
                      <div className="text-xs text-gray-600 mt-1">IFSC: {beneficiary.ifscCode}</div>
                      <div className="text-xs text-gray-600">{beneficiary.bankName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStageBadge(beneficiary.currentStage)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-600 text-lg">
                        ₹{(beneficiary.stageAmount / 100000).toFixed(0)}L
                      </div>
                      <div className="text-xs text-gray-600">Current stage</div>
                    </td>
                    <td className="px-6 py-4">
                      {getPennyDropBadge(beneficiary.pennyDropStatus)}
                      {beneficiary.pennyDropStatus === 'VERIFIED' && beneficiary.accountHolderName && (
                        <div className="mt-2 text-xs">
                          <div className="font-medium text-green-900">{beneficiary.accountHolderName}</div>
                          <div className="text-green-700">Name Matched</div>
                        </div>
                      )}
                      {beneficiary.pennyDropStatus === 'FAILED' && beneficiary.pennyDropError && (
                        <div className="mt-2 text-xs">
                          <div className="font-medium text-red-900">{beneficiary.pennyDropError}</div>
                          <div className="text-red-700">Requires Correction</div>
                        </div>
                      )}
                      {beneficiary.pennyDropStatus === 'PENDING' && (
                        <div className="mt-2 text-xs text-orange-700">
                          Needs penny drop processing
                        </div>
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
                      <button
                        className="p-2 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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
            </div>
          )}
        </div>

        {/* Pagination */}
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
      </div>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, textColor }) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-4`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};