// ============================================
// pages/PennyDrop/PennyDropBeneficiaryList.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  Users,
  RefreshCw
} from 'lucide-react';
import { PennyDropStatus } from '../../types';

export const PennyDropBeneficiaryList: React.FC = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'all');
  const [filterBank, setFilterBank] = useState(searchParams.get('bank') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;

  useEffect(() => {
    fetchBeneficiaries();
  }, [batchId]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      // Mock beneficiary data
      const mockData = [
        {
          id: '1',
          beneficiaryId: 'BEN001',
          name: 'Ramesh Kumar',
          aadhaar: '6297****0065',
          bankAccount: '052110118493',
          ifscCode: 'IPOST0000001',
          bankName: 'India Post Payments Bank',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          accountHolderName: 'RAMESH KUMAR',
          matched: true,
          category: 'Ready for Payment'
        },
        {
          id: '2',
          beneficiaryId: 'BEN002',
          name: 'Lavudya Mathri',
          aadhaar: '5618****2102',
          bankAccount: '187610100057689',
          ifscCode: 'UBIN0018761',
          bankName: 'Union Bank of India',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          accountHolderName: 'L MATHRI',
          matched: true,
          category: 'Ready for Payment'
        },
        {
          id: '3',
          beneficiaryId: 'BEN003',
          name: 'Jidugu Veerababu',
          aadhaar: '3255****2532',
          bankAccount: '221122040010381',
          ifscCode: 'ICIC0000123',
          bankName: 'ICICI Bank',
          pennyDropStatus: PennyDropStatus.FAILED,
          amount: 500000,
          verificationDate: '2025-01-15',
          errorMessage: 'Invalid Account Number',
          category: 'Rejected'
        },
        {
          id: '4',
          beneficiaryId: 'BEN004',
          name: 'Gantela Pushpalatha',
          aadhaar: '3231****1173',
          bankAccount: '21100003183663',
          ifscCode: 'AUSB0000123',
          bankName: 'AU Small Finance Bank',
          pennyDropStatus: PennyDropStatus.PENDING,
          amount: 500000,
          verificationDate: null,
          category: 'Needs Penny Drop'
        },
        {
          id: '5',
          beneficiaryId: 'BEN005',
          name: 'Ramidi Madevi',
          aadhaar: '5989****0521',
          bankAccount: '010161711432',
          ifscCode: 'ICIC0000100',
          bankName: 'ICICI Bank',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          accountHolderName: 'RAMIDI M',
          matched: true,
          category: 'Ready for Payment'
        },
        {
          id: '6',
          beneficiaryId: 'BEN006',
          name: 'Siliveru Anusha',
          aadhaar: '8163****7910',
          bankAccount: '58478100000841',
          ifscCode: 'BARB0058478',
          bankName: 'Bank of Baroda',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          accountHolderName: 'SILIVERU ANUSHA',
          matched: true,
          category: 'Ready for Payment'
        },
        {
          id: '7',
          beneficiaryId: 'BEN007',
          name: 'Kurapati Srinivasa Rao',
          aadhaar: '7437****7363',
          bankAccount: '20378506750',
          ifscCode: 'FINO0000203',
          bankName: 'Fino Payments Bank',
          pennyDropStatus: PennyDropStatus.FAILED,
          amount: 500000,
          verificationDate: '2025-01-15',
          errorMessage: 'Account Closed/Dormant',
          category: 'Rejected'
        },
        {
          id: '8',
          beneficiaryId: 'BEN008',
          name: 'Bhookya Nageswarao',
          aadhaar: '8529****6428',
          bankAccount: '73070632275',
          ifscCode: 'TGBK0070632',
          bankName: 'Telangana Grameena Bank',
          pennyDropStatus: PennyDropStatus.VERIFIED,
          amount: 500000,
          verificationDate: '2025-01-15',
          accountHolderName: 'BHOOKYA NAGESWARAO',
          matched: true,
          category: 'Ready for Payment'
        }
      ];

      // Simulate more records
      const expandedData = [];
      for (let i = 0; i < 100; i++) {
        expandedData.push(...mockData.map((b, idx) => ({
          ...b,
          id: `${i}-${idx}`,
          beneficiaryId: `BEN${String(i * mockData.length + idx + 1).padStart(6, '0')}`
        })));
      }

      setBeneficiaries(expandedData);
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PennyDropStatus) => {
    const styles: Record<PennyDropStatus, string> = {
      [PennyDropStatus.VERIFIED]: 'bg-green-100 text-green-800',
      [PennyDropStatus.FAILED]: 'bg-red-100 text-red-800',
      [PennyDropStatus.PENDING]: 'bg-orange-100 text-orange-800'
    };
    const labels: Record<PennyDropStatus, string> = {
      [PennyDropStatus.VERIFIED]: 'Verified',
      [PennyDropStatus.FAILED]: 'Failed',
      [PennyDropStatus.PENDING]: 'Not Done'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      if (filterStatus === 'verified') matchesStatus = b.pennyDropStatus === PennyDropStatus.VERIFIED;
      else if (filterStatus === 'failed') matchesStatus = b.pennyDropStatus === PennyDropStatus.FAILED;
      else if (filterStatus === 'pending') matchesStatus = b.pennyDropStatus === PennyDropStatus.PENDING;
    }

    let matchesBank = true;
    if (filterBank !== 'all') {
      matchesBank = b.bankName.toLowerCase().includes(filterBank.toLowerCase());
    }

    const matchesSearch = searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.aadhaar.includes(searchQuery) ||
      b.beneficiaryId.includes(searchQuery) ||
      b.bankAccount.includes(searchQuery);

    return matchesStatus && matchesBank && matchesSearch;
  });

  const stats = {
    total: beneficiaries.length,
    verified: beneficiaries.filter(b => b.pennyDropStatus === PennyDropStatus.VERIFIED).length,
    failed: beneficiaries.filter(b => b.pennyDropStatus === PennyDropStatus.FAILED).length,
    pending: beneficiaries.filter(b => b.pennyDropStatus === PennyDropStatus.PENDING).length,
    filtered: filteredBeneficiaries.length
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBeneficiaries.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredBeneficiaries.length / recordsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beneficiaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/penny-drop/batch/${batchId}`)} 
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beneficiary List</h1>
            <p className="text-gray-600 mt-1">Batch: BATCH20250115001</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Filtered
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Beneficiaries"
          value={stats.total.toLocaleString()}
          color="bg-gray-50"
          icon="👥"
        />
        <StatCard
          label="Verified (Success)"
          value={stats.verified.toLocaleString()}
          subtext={`${((stats.verified / stats.total) * 100).toFixed(1)}%`}
          color="bg-green-50"
          icon="✓"
        />
        <StatCard
          label="Failed (Rejected)"
          value={stats.failed.toLocaleString()}
          subtext={`${((stats.failed / stats.total) * 100).toFixed(1)}%`}
          color="bg-red-50"
          icon="✗"
        />
        <StatCard
          label="Not Done (Pending)"
          value={stats.pending.toLocaleString()}
          subtext={`${((stats.pending / stats.total) * 100).toFixed(1)}%`}
          color="bg-orange-50"
          icon="⏳"
        />
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
            <option value="failed">Failed Only</option>
            <option value="pending">Not Done Only</option>
          </select>
          <select
            value={filterBank}
            onChange={(e) => setFilterBank(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Banks</option>
            <option value="sbi">State Bank of India</option>
            <option value="hdfc">HDFC Bank</option>
            <option value="icici">ICICI Bank</option>
            <option value="union">Union Bank</option>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beneficiary ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Aadhaar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Account Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Result</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecords.map((beneficiary) => (
                <tr key={beneficiary.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-semibold text-gray-900">{beneficiary.beneficiaryId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{beneficiary.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-600">{beneficiary.aadhaar}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-900">{beneficiary.bankAccount}</div>
                    <div className="text-xs text-gray-500">{beneficiary.ifscCode}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{beneficiary.bankName}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(beneficiary.pennyDropStatus)}
                  </td>
                  <td className="px-6 py-4">
                    {beneficiary.pennyDropStatus === PennyDropStatus.VERIFIED && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-green-900">{beneficiary.accountHolderName}</div>
                          <div className="text-xs text-green-700">Name Matched</div>
                        </div>
                      </div>
                    )}
                    {beneficiary.pennyDropStatus === PennyDropStatus.FAILED && (
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-red-900">{beneficiary.errorMessage}</div>
                          <div className="text-xs text-red-700">Requires Correction</div>
                        </div>
                      </div>
                    )}
                    {beneficiary.pennyDropStatus === PennyDropStatus.PENDING && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium text-orange-900">Penny Drop Not Done</div>
                          <div className="text-xs text-orange-700">Send to External Service</div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => alert(`View details for ${beneficiary.beneficiaryId}`)}
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
            <strong>{filteredBeneficiaries.toLocaleString()}</strong> beneficiaries
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
  );
};

// Components
interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, color, icon }) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
    </div>
  );
};

export default PennyDropBeneficiaryList;